from models import AggregatedMetric,Log
import datetime

def round_time_to_minute(dt):
    return dt.replace(second=0,microsecond=0)

def aggregate_log(db,log):
    bucket_time=round_time_to_minute(log.timestamp)

    existing=db.query(AggregatedMetric).filter_by(
        service_id=log.service_id,
        time_bucket=bucket_time
    ).first()

    if existing:
        existing.total_logs += 1
        if log.log_level == "ERROR":
            existing.error_logs += 1
        print(f"Updated existing metric: {existing}")
    
    else:
        new_metric = AggregatedMetric(
            service_id=log.service_id,
            time_bucket=bucket_time,
            total_logs=1,
            error_logs=1 if log.log_level == "ERROR" else 0
        )
        db.add(new_metric)
        print(f"Added new metric: {new_metric}")

    db.commit()
    