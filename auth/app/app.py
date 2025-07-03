from flask import Flask,request,jsonify
from db import engine, sessionLocal,Base
from models import Developers,Service,AggregatedMetric
import utils
from decorator import token_required
import requests 


app=Flask(__name__)

try:
    Base.metadata.create_all(bind=engine)
except sqlalchemy.exc.OperationalError as e:
    print(f"Skipping table creation: {e}")

@app.route("/health")
def health():
    return jsonify({"status":"healthy"})


# Register user(Developer)
@app.route('/register',methods=['POST'])
def register():
    data=request.json
    db=sessionLocal()

    try:
        dev_name=data['dev_name']
        dev_email=data['dev_email']
        password=data['password']



        existing_developer = db.query(Developers).filter_by(dev_email=dev_email).first()
        if existing_developer:
            return jsonify({"error": "Email already registered"}), 401
        
        hashed_password=utils.hash_password(password)
        dev = Developers(dev_email=dev_email,dev_name=dev_name,hashed_password=hashed_password)
        db.add(dev)
        db.commit()

    except Exception as e:
        return jsonify({"message":f"{e}"})
    
    finally:
        db.close()
    
    print(dict(request.headers)) 
    return jsonify({"message":"Developer created successfully"}),200
    

@app.route('/login',methods=['POST'])
def login():
    data = request.json
    db=sessionLocal()

    try:
        dev_email=data['dev_email']
        password=data['password']

        dev=db.query(Developers).filter_by(dev_email=dev_email).first()

        if not dev or not utils.verify_password(password,dev.hashed_password):
            return jsonify({"error":"invalid credentials"}),401
        
        token=utils.create_access_token({"dev_id":dev.dev_id})
        resp = jsonify({"message": "Login successful"})
        resp.set_cookie(
            "access_token", 
            token, 
            httponly=True, 
            secure=False, 
            samesite='Lax'
        )
        resp.status_code = 201
    except Exception as e:
        return jsonify({"message":f"{e}"}),401
    finally:
        db.close()

    return resp

@app.route("/logout")
def logout():
    resp = jsonify({"message": "Logged out successfully"})
    resp.set_cookie(
        "access_token", 
        "", 
        expires=0, 
        httponly=True, 
        secure=False, 
        samesite='Lax'
    )
    resp.status_code=200
    return resp


@app.route("/developer_details",methods=['POST'])
@token_required
def get_developer_details():
    data=request.json
    db=sessionLocal()

    try:
        dev_id=data['dev_id']
        dev=db.query(Developers).filter_by(dev_id=dev_id).first()
        
        return jsonify({
            'dev_id':dev.dev_id,
            'dev_name':dev.dev_name,
            'dev_email':dev.dev_email
        }),200
    except:
        return jsonify({"error":"internal server error"}),401
    finally:
        db.close()


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

        try:
            metrics_response = requests.get("http://nginx/analyze/metrics/services", cookies=request.cookies)
            metrics_data = metrics_response.json() if metrics_response.status_code == 200 else []
        except Exception as e:
            metrics_data = []  # Fallback

        metrics_map = {item["service_id"]: item for item in metrics_data}

        # Step 4: Merge service data with metrics
        services_list = []
        for s in services:
            metric = metrics_map.get(s.service_id, {"total_logs": 0, "error_logs": 0})
            services_list.append({
                "service_id": s.service_id,
                "service_name": s.service_name,
                "api_key": s.api_key,
                "flag": s.flag,
                "total_logs": int(metric["total_logs"]),
                "error_logs": int(metric["error_logs"])
            })

    except Exception as e:
        return jsonify({"message":f"{e}"})
    finally:
        db.close()
    
    return jsonify(services_list)


if __name__=="__main__":
    app.run(host='0.0.0.0',debug=True)
