from flask import Flask,request,jsonify
from sqlalchemy import func 
from db import engine, sessionLocal,Base
from models import Service,AggregatedMetric
import utils
from decorator import token_required


app=Flask(__name__)

try:
    Base.metadata.create_all(bind=engine)
except sqlalchemy.exc.OperationalError as e:
    print(f"Skipping table creation: {e}")


@app.route("/health")
def health():
    return jsonify({"status":"service-management healthy"})

# create services

@app.route("/services",methods=['POST'])
@token_required
def create_service():

    data=request.json
    db=sessionLocal()

    try:
        service_name=data['service_name']
        dev_id=request.dev_id

        api_key=utils.generate_api_key()

        service=Service(service_name=service_name,api_key=api_key,owner_id=dev_id)
        db.add(service)
        db.commit()

        res={
            "service_id":service.service_id,
            "service_name":service_name,
            "api_key":api_key
        }
    
    except Exception as e:
        return jsonify({"message":f"{e}"})
    
    finally:
        db.close()

    return jsonify(res)


@app.route("/delete_service",methods=['POST'])
@token_required
def delete_service():
    data=request.json
    db=sessionLocal()

    try:
        service_id=data['service_id']
        dev_id=request.dev_id

        service = db.query(Service).filter_by(
            service_id=service_id,
            owner_id=dev_id
        ).first()

        if not service:
            return jsonify({"error": "Service not found"}), 404

        service.flag = False
        db.commit()

        return jsonify({"message": "Service deactivated successfully"}), 200

    except Exception as e:
        return jsonify({"message":f"{e}"})
    finally:
        db.close()


# list services
@app.route("/services",methods=['GET'])
@token_required
def list_services():
    
    db=sessionLocal()

    try:
        dev_id=request.dev_id

        services=db.query(Service).filter_by(owner_id=dev_id).all()
        services_list=[]

        for service in services:
            service_id=service.service_id

            log_count_data = (
                db.query(
                    func.sum(AggregatedMetric.total_logs).label("total_logs"),
                    func.sum(AggregatedMetric.error_logs).label("error_logs")
                )
                .filter(AggregatedMetric.service_id == service_id)
                .group_by(AggregatedMetric.service_id)
                .first()
            )

            total_logs = log_count_data.total_logs if log_count_data else 0
            error_logs = log_count_data.error_logs if log_count_data else 0

            data={
                "service_id":service_id,
                "service_name":service.service_name,
                "api_key":service.api_key,
                "flag":service.flag,
                "total_logs":total_logs,
                "error_logs":error_logs
            }

            services_list.append(data)

    except Exception as e:
        return jsonify({"message":f"{e}"})
    finally:
        db.close()
    
    return jsonify(services_list)


if __name__=="__main__":
    app.run(host='0.0.0.0',debug=True)
