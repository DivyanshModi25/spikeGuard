from flask import Flask,request,jsonify
from sqlalchemy import func 
from db import engine, sessionLocal,Base
from models import Developers,Service,AggregatedMetric
import utils
from decorator import token_required
import requests 
from flask_cors import CORS

app=Flask(__name__)

CORS(app,
     origins="*",
     supports_credentials=True,
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     max_age=1728000)

try:
    Base.metadata.create_all(bind=engine)
except sqlalchemy.exc.OperationalError as e:
    print(f"Skipping table creation: {e}")


@app.route("/auth/health")
def health():
    return jsonify({"status":"healthy"})


# Register user(Developer)
@app.route('/auth/register',methods=['POST'])
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
    

@app.route('/auth/login',methods=['POST'])
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
            samesite='Lax',
            max_age=60*60*24*2
        )
        resp.status_code = 201
    except Exception as e:
        return jsonify({"message":f"{e}"}),401
    finally:
        db.close()

    return resp

@app.route("/auth/logout")
def logout():
    resp = jsonify({"message": "Logged out successfully"})
    resp.set_cookie(
        "access_token", 
        "", 
        expires=0, 
        httponly=True, 
        samesite='Lax'
    )
    resp.status_code=200
    return resp


@app.route("/auth/developer_details",methods=['POST'])
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



if __name__=="__main__":
    app.run(host='0.0.0.0',debug=True)
