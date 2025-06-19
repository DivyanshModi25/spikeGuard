from kafka_consumer import get_consumer
from db import sessionLocal,Base,engine
import models
import datetime
from collections import defaultdict

Base.metadata.create_all(bind=engine)

# In-memory aggregation bucket (window: 1 min)
aggregation_window = defaultdict(lambda: {
    "log_count": 0,
    "error_count": 0,
    "critical_count": 0,
    "last_seen": None
})

# Thresholds (can be tuned later)
TRAFFIC_SPIKE_THRESHOLD = 50  # logs/min
ERROR_SPIKE_THRESHOLD = 10  # errors/min

print("Analyzer service started...")

consumer = get_consumer()

for message in consumer:
    db = sessionLocal()
    try:
        log = message.value
        service_api_key = log['service_api_key']
        log_level = log['log_level']
        timestamp = datetime.datetime.utcnow()

        # Find service_id from DB
        service = db.query(models.Service).filter_by(api_key=service_api_key).first()
        if not service:
            continue  # Invalid log, skip

        key = (service.id, timestamp.replace(second=0, microsecond=0))  # round to minute

        aggregation_window[key]["log_count"] += 1
        aggregation_window[key]["last_seen"] = timestamp

        if log_level == "ERROR":
            aggregation_window[key]["error_count"] += 1
        if log_level == "CRITICAL":
            aggregation_window[key]["critical_count"] += 1

        # Persist aggregation after each message
        agg = aggregation_window[key]
        aggregate = db.query(models.Aggregate).filter_by(service_id=service.id, timestamp=key[1]).first()
        if not aggregate:
            aggregate = models.Aggregate(
                service_id=service.id,
                timestamp=key[1],
                log_count=agg["log_count"],
                error_count=agg["error_count"],
                critical_count=agg["critical_count"]
            )
            db.add(aggregate)
        else:
            aggregate.log_count = agg["log_count"]
            aggregate.error_count = agg["error_count"]
            aggregate.critical_count = agg["critical_count"]

        db.commit()

        # Simple alert generation:
        if agg["log_count"] >= TRAFFIC_SPIKE_THRESHOLD:
            print(f"[ALERT] Traffic spike for service {service.name}")

        if agg["error_count"] >= ERROR_SPIKE_THRESHOLD:
            print(f"[ALERT] Error spike for service {service.name}")

    except Exception as e:
        print("Error in analyzer:", e)
    finally:
        db.close()
