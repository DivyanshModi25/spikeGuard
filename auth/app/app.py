from flask import Flask,request,jsonify
from db import engine, sessionLocal,Base
import models
import utils


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

    name=data['name']
    email=data['email']
    password=data['password']


    existing_user = db.query(models.User).filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Email already registered"}), 400
    
    hashed_password=utils.hash_password(password)
    user = models.User(email=email,name=name,hashed_password=hashed_password)
    db.add(user)
    db.commit()
    return jsonify({"message":"user created successfully"})
    

@app.route('/login',methods=['POST'])
def login():
    data = request.json
    db=sessionLocal()

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
    return resp


# create services

@app.route("/services",methods=['POST'])
def create_service():
    token=request.headers.get("Authorization")
    if not token:
        return jsonify({"error":"missing token"}),401
    
    payload=utils.verify_access_token(token)

    if not payload:
        return jsonify({"error":"invalid token"}),401
    

    data=request.json
    db=sessionLocal()

    service_name=data['name']


    api_key=utils.generate_api_key()
    service=models.Service(name=service_name,api_key=api_key,owner_id=payload["user_id"])
    db.add(service)
    db.commit()

    return jsonify({"api_key":api_key})


# list services
@app.route("/services",methods=['GET'])
def list_services():
    token=request.headers.get("Authorization")
    if not token:
        return jsonify({"error":"missing token"}),401
    
    payload=utils.verify_access_token(token)

    if not payload:
        return jsonify({"error":"invalid token"}),401
    

    db=sessionLocal()
    services=db.query(models.Service).filter_by(owner_id=payload['user_id']).all()
    services_list=[]

    for s in services:
        services_list.append({
            "id":s.id,
            "name":s.name,
            "api_key":s.api_key
        })
    
    return jsonify(services_list)


if __name__=="__main__":
    app.run(host='0.0.0.0',debug=True)
