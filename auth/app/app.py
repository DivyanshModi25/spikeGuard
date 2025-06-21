from flask import Flask,request,jsonify
from db import engine, sessionLocal,Base
import models
import utils
from decorator import token_required
import requests 


app=Flask(__name__)

# Auto create tables
Base.metadata.create_all(bind=engine)

@app.route("/health")
def health():
    return jsonify({"status":"healthy"})


# Register user
@app.route('/register',methods=['POST'])
def register():
    data=request.json
    db=sessionLocal()

    try:
        name=data['name']
        email=data['email']
        password=data['password']



        existing_user = db.query(models.User).filter_by(email=email).first()
        if existing_user:
            return jsonify({"error": "Email already registered"}), 401
        
        hashed_password=utils.hash_password(password)
        user = models.User(email=email,name=name,hashed_password=hashed_password)
        db.add(user)
        db.commit()

    except Exception as e:
        return jsonify({"message":f"{e}"})
    
    finally:
        db.close()
    
    print(dict(request.headers)) 
    return jsonify({"message":"user created successfully"}),200
    

@app.route('/login',methods=['POST'])
def login():
    data = request.json
    db=sessionLocal()

    try:
        email=data['email']
        password=data['password']

        user=db.query(models.User).filter_by(email=email).first()

        if not user or not utils.verify_password(password,user.hashed_password):
            return jsonify({"error":"invalid credentials"}),401
        
        token=utils.create_access_token({"user_id":user.id})
        resp = jsonify({"message": "Login successful"})
        resp.set_cookie(
            "access_token", 
            token, 
            httponly=True, 
            secure=True, 
            samesite='Strict'
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
        secure=True, 
        samesite='Strict'
    )
    resp.status_code=200
    return resp


@app.route("/user-detail",methods=['POST'])
@token_required
def get_user_details():
    data=request.json
    db=sessionLocal()

    try:
        user_id=data['user_id']
        user=db.query(models.User).filter_by(id=user_id).first()
        
        return jsonify({
            'id':user.id,
            'name':user.name,
            'email':user.email
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
        service_name=data['name']
        user_id=request.user_id

        api_key=utils.generate_api_key()

        service=models.Service(name=service_name,api_key=api_key,owner_id=user_id)
        db.add(service)
        db.commit()

        res={
            "id":service.id,
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
        id=data['id']
        user_id=request.user_id

        service = db.query(models.Service).filter_by(
            id=id,
            owner_id=user_id
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
        user_id=request.user_id

        services=db.query(models.Service).filter_by(owner_id=user_id).all()
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
            metric = metrics_map.get(s.id, {"total_logs": 0, "error_logs": 0})
            services_list.append({
                "id": s.id,
                "name": s.name,
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
