from flask import Flask,request,jsonify
from db import sessionLocal
from models import AggregatedMetric,Service
from sqlalchemy import func
from decorator import token_required

app = Flask(__name__)


@app.route("/metrics/services")
@token_required
def service_metrices():
    db=sessionLocal()

    try:
        user_id = request.user_id  # We get user ID from token (auth service)

        # First, get all services owned by the user
        services = db.query(Service).filter_by(owner_id=user_id).all()
        service_ids = [service.id for service in services]

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
        user_id = request.user_id  # We get user ID from token (auth service)

        # First, get all services owned by the user
        services = db.query(Service).filter_by(owner_id=user_id).all()
        service_ids = [service.id for service in services]

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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)