from flask import Flask,request,jsonify
from db import sessionLocal
from models import AggregatedMetric,Service
from sqlalchemy import func
from decorator import token_required
from datetime import datetime,timedelta
import pytz
from dateutil.relativedelta import relativedelta

app = Flask(__name__)


@app.route("/metrics/services")
@token_required
def service_metrices():
    db=sessionLocal()

    try:
        dev_id = request.dev_id  # We get user ID from token (auth service)

        # First, get all services owned by the user
        services = db.query(Service).filter_by(owner_id=dev_id).all()
        service_ids = [service.service_id for service in services]

        if not service_ids:
            return jsonify([])


        data = db.query(
            AggregatedMetric.service_id,
            func.sum(AggregatedMetric.total_logs),
            func.sum(AggregatedMetric.error_logs)
        ).group_by(AggregatedMetric.service_id).all()

        result = []
        for row in data:
            result.append({
                "service_id": row[0],
                "total_logs": row[1],
                "error_logs": row[2]
            })
        
    finally:
        db.close()

    return jsonify(result)


@app.route("/metrics/service/<int:service_id>/history")
@token_required
def service_history(service_id):
    db = sessionLocal()
    try:
        dev_id = request.dev_id  # We get user ID from token (auth service)

        # First, get all services owned by the user
        services = db.query(Service).filter_by(owner_id=dev_id).all()
        service_ids = [service.service_id for service in services]

        if not service_ids:
            return jsonify([])


        data = db.query(
            AggregatedMetric.time_bucket,
            AggregatedMetric.total_logs,
            AggregatedMetric.error_logs
        ).filter(AggregatedMetric.service_id == service_id).order_by(AggregatedMetric.time_bucket).all()

        result = []
        for row in data:
            result.append({
                "time_bucket": row[0].isoformat(),
                "total_logs": row[1],
                "error_logs": row[2]
            })

    finally:
        db.close()

    return jsonify(result)


@app.route("/metrics/daily_traffic",methods=['POST'])
@token_required
def daily_traffic():
    db=sessionLocal()
    try:
        service_id=request.service_id
        dev_id=request.dev_id

        today = datetime.utcnow().date()
        start_date = today - timedelta(days=30)

        data = db.query(
            func.date(AggregatedMetric.timestamp).label("day"),
            func.sum(AggregatedMetric.total_logs).label("total")
        ).filter(
            AggregatedMetric.service_id == service_id,
            AggregatedMetric.timestamp >= start_date
        ).group_by("day")\
        .order_by("day DESC").all()

        result = [{"day": str(row.day), "total_logs": row.total} for row in data]
        return jsonify(result)

    finally:
        db.close()

@app.route("/metrics/hourly_trafic",methods=['POST'])
@token_required
def hourly_traffic():
    db = sessionLocal()

    try:
        data = request.json
        service_id = data['service_id']

        # Current time floored to the current hour
        tz = pytz.timezone("Asia/Kolkata")
        now = datetime.now(tz).replace(minute=0, second=0, microsecond=0)
        start_time = now - timedelta(hours=24)

        # Step 1: Generate exact 24 hourly slots from start_time to (now - 1 hour)
        all_hours = [(start_time + timedelta(hours=i)).strftime("%Y-%m-%d %H:00:00") for i in range(25)]

        # Step 2: Query the logs
        rows = db.query(
            func.date_format(AggregatedMetric.time_bucket, "%Y-%m-%d %H:00:00").label("hour_slot"),
            func.sum(AggregatedMetric.total_logs).label("total_logs"),
            func.sum(AggregatedMetric.error_logs).label("total_error_logs")
        ).filter(
            AggregatedMetric.service_id == service_id,
            AggregatedMetric.time_bucket >= start_time,
            AggregatedMetric.time_bucket <= now  # strictly less than current hour
        ).group_by("hour_slot").order_by("hour_slot").all()

        existing_data = {
            row.hour_slot: {"total_logs": int(row.total_logs or 0), "total_error_logs": int(row.total_error_logs or 0)}
            for row in rows
        }

        # Build response
        result = [
            {
                "hour": hour,
                "total_logs": existing_data.get(hour, {}).get("total_logs", 0),
                "total_error_logs": existing_data.get(hour, {}).get("total_error_logs", 0)
            }
            for hour in all_hours
        ]

        return jsonify(result)

    finally:
        db.close()


@app.route("/metrics/monthly_trafic",methods=['POST'])
# @token_required
def monthly_traffic():
    db = sessionLocal()
    try:
        data = request.json
        service_id = data['service_id']

        # Time setup: Asia/Kolkata timezone

        tz = pytz.timezone("Asia/Kolkata")
        now = datetime.now(tz).replace(second=0, microsecond=0)
        start_time = now - relativedelta(years=1)


        # Generate last 12 months including current month as placeholder
        all_months = [
            (start_time + relativedelta(months=i)).strftime("%Y-%m")
            for i in range(13)
        ]

        # Query database: group by month
        rows = db.query(
            func.date_format(AggregatedMetric.time_bucket, "%Y-%m").label("month_slot"),
            func.sum(AggregatedMetric.total_logs).label("total_logs"),
            func.sum(AggregatedMetric.error_logs).label("total_error_logs")
        ).filter(
            AggregatedMetric.service_id == service_id,
            AggregatedMetric.time_bucket >= start_time,
            AggregatedMetric.time_bucket <= now  # strictly before this month
        ).group_by("month_slot").order_by("month_slot").all()


        existing_data = {
            row.month_slot: {"total_logs": int(row.total_logs or 0), "total_error_logs": int(row.total_error_logs or 0)}
            for row in rows
        }

        # Fill missing months
        result = [
            {
                "month": month,
                "total_logs": existing_data.get(month, {}).get("total_logs", 0),
                "total_error_logs": existing_data.get(month, {}).get("total_error_logs", 0)
            }
            for month in all_months
        ]

        return jsonify(result)

    finally:
        db.close()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)