from kafka import KafkaConsumer
from db import sessionLocal,Base,engine
from models import Log,AggregatedMetric,Service
from aggregator import aggregate_log
import os
import json
from datetime import datetime



# Create tables
Base.metadata.create_all(bind=engine)
print("kafka_consumer service started")

KAFKA_BROKER = os.getenv('KAFKA_BROKER')
consumer = KafkaConsumer(
    'logs',
    bootstrap_servers=[KAFKA_BROKER],
    value_deserializer=lambda x: json.loads(x.decode('utf-8')),
    auto_offset_reset='earliest',
    enable_auto_commit=True,
    group_id='analyzer-consumer-service'
)


print("kafka_consumer connected!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
print("subscribed to :",consumer.topics())

for message in consumer:
    data=message.value
    print(f"received log {data} from kafka by the analyze_consumer service")
    db=sessionLocal()

    service=db.query(Service).filter_by(api_key=data['service_api_key']).first()

    try:
        log_entry=Log(
            service_id=service.id,
            log_level=data['log_level'],
            message=data['message'],
            timestamp=datetime.fromisoformat(data['timestamp']),
            api_key=data['service_api_key'],
            ip=data['meta']['ip']
        )

        db.add(log_entry)
        db.commit()

        # Aggregation:
        aggregate_log(db, log_entry)

    except Exception as e:
        print(f"Error processing message: {e}")
        db.rollback()

    finally:
        db.close()