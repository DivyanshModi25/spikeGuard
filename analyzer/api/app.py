from flask import Flask,request,jsonify,send_file
from db import sessionLocal
from models import AggregatedMetric,Service,Log
from sqlalchemy import func,case
from decorator import token_required
from datetime import datetime,timedelta
import pytz
from dateutil.relativedelta import relativedelta
from utils import get_ip_location
from collections import defaultdict
import csv
from io import StringIO,BytesIO

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
        now = datetime.now(tz).replace()
        start_time = now - relativedelta(hours=24)

        # Step 1: Generate exact 24 hourly slots from start_time to (now - 1 hour)
        all_hours = [(start_time + relativedelta(hours=i)).strftime("%Y-%m-%d %H:00:00") for i in range(25)]

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


@app.route('/level_count', methods=['POST'])
@token_required
def log_level_count():
    db=sessionLocal()

    try:
        data = request.json 
        service_id = data['service_id']

        if not service_id:
            return jsonify({'error': 'Missing service_id'}), 400

        results = (
            db.query(Log.log_level, func.count().label("count"))
            .filter(Log.service_id == service_id)
            .group_by(Log.log_level)
            .all()
        )

        output = [{"log_level": row.log_level, "count": row.count} for row in results]
    finally:
        db.close()

    return jsonify(output), 200


@app.route('/traffic-meter',methods=['POST'])
@token_required
def traffic_meter():

    db=sessionLocal()

    try:
        data=request.json
        service_id=data['service_id']

        if service_id is None:
            return jsonify({"error": "service_id is required"}), 400

        tz = pytz.timezone("Asia/Kolkata")
        now = datetime.now(tz)
        five_minutes_ago = now - relativedelta(minutes=5)

        print("Now:", now)
        print("Five minutes ago:", five_minutes_ago)

        count = db.query(func.count(Log.log_id))\
            .filter(Log.timestamp >= five_minutes_ago)\
            .filter(Log.service_id == service_id)\
            .scalar()
        
        print(count)

        # Optional: Normalize to percentage
        # e.g., high traffic ~ 500+ logs in 5 min
        MAX_THRESHOLD = 500
        percentage = min((count / MAX_THRESHOLD) * 100, 100)

        return jsonify({
            "count": count,
            "percentage": round(percentage, 2)
        })
    finally:
        db.close()


@app.route("/metrics/total_service_logs",methods=['POST'])
@token_required
def total_service_logs():
    db = sessionLocal()

    try:
        data = request.get_json()
        service_id = data['service_id']
        
        result = (
            db.query(
                func.count().label("total_logs"),
                func.sum(
                    case(
                        (Log.log_level == 'ERROR', 1),
                        else_=0
                    )
                ).label("error_logs")
            )
            .filter(Log.service_id == service_id)  # ✅ use .filter not .filter_by
            .one()
        )

        total_logs = result.total_logs
        error_logs = result.error_logs
        error_rate = (error_logs / total_logs)*100 if total_logs else 0

        return jsonify({
            "service_id": service_id,
            "total_logs": total_logs,
            "error_logs": error_logs,
            "error_rate": error_rate
        })
    finally:
        db.close()


@app.route("/metrics/log_locations", methods=["POST"])
@token_required
def log_locations():
    db = sessionLocal()
    try:
        data = request.get_json()
        service_id = data['service_id']

        # Step 1: Query all user_ip counts at once
        ip_counts = (
            db.query(Log.user_ip, func.count().label("log_count"))
            .filter_by(service_id=service_id)
            .group_by(Log.user_ip)
            .all()
        )

        # Step 2: Prepare mapping for IP -> log_count
        ip_log_map = {ip: count for ip, count in ip_counts}
        unique_ips = list(ip_log_map.keys())

        # Step 3: Initialize aggregators
        country_log_counts = defaultdict(int)
        country_locations = {}

        # Step 4: Geolocate each IP and aggregate
        for ip in unique_ips:
            location = get_ip_location(ip)
            if location:
                country = location["country"]
                ip_count = ip_log_map[ip]

                country_log_counts[country] += ip_count

                # Save location only once per country
                if country not in country_locations:
                    country_locations[country] = {
                        "latitude": location["latitude"],
                        "longitude": location["longitude"]
                    }

        # Step 5: Format response
        result = [
            {
                "country": country,
                "count": count,
                "latitude": country_locations[country]["latitude"],
                "longitude": country_locations[country]["longitude"]
            }
            for country, count in country_log_counts.items()
        ]

        return jsonify({
            "service_id": service_id,
            "log_summary": result
        })

    finally:
        db.close()


@app.route('/display_top_logs', methods=['POST'])
def get_top_logs():
    db = sessionLocal()
    results = {}

    try:
        data=request.json
        service_id=data['service_id']
        for level in ['ERROR', 'CRITICAL', 'INFO', 'WARNING','DEBUG']:
            logs = (
                db.query(Log)
                .filter(Log.log_level == level)
                .filter(Log.service_id == service_id)
                .order_by(Log.timestamp.desc())
                .limit(10)
                .all()
            )
            results[level] = [
                {
                    "log_id": log.log_id,
                    "timestamp": log.timestamp.isoformat(),
                    "message": log.message,
                    "log_level":log.log_level,
                    "user_ip":log.user_ip
                } for log in logs
            ]
        return jsonify(results)

    finally:
        db.close()


@app.route('/download_logs', methods=['POST'])
def download_logs():
    db = sessionLocal()

    try:
        # Params
        data=request.json 
        service_id=data['service_id']
        start = data["start_time"]
        end = data["end_time"]
        log_levels = data.get("log_level", [])

        # Parse dates
        start_dt = datetime.fromisoformat(start)
        end_dt = datetime.fromisoformat(end)

        logs = (
                    db.query(Log)
                    .filter(
                        Log.timestamp.between(start_dt, end_dt),
                        Log.log_level.in_(log_levels)
                    )
                    .order_by(Log.timestamp.desc())
                    .all()
                )

        # Generate CSV in memory
        si = StringIO()
        writer = csv.writer(si)
        writer.writerow(["ID", "Timestamp", "Level", "Message","user ip"])
        for log in logs:
            writer.writerow([log.log_id, log.timestamp, log.log_level, log.message,log.user_ip])

        byte_io = BytesIO()
        byte_io.write(si.getvalue().encode('utf-8'))
        byte_io.seek(0)

        return send_file(
            byte_io,
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'filtered_logs_{service_id}.csv'
        )

    finally:
        db.close()



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)