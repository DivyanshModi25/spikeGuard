import jwt
import requests
from models import Service
import os 

PUBLIC_KEY = os.environ.get("PUBLIC_KEY")


def verify_access_token(token):
    try:
        payload=jwt.decode(token,PUBLIC_KEY,algorithms='RS256')
        return payload
    except Exception as e:
        return e
    

def get_ip_location(ip):
    try:
        res = requests.get(f"https://ipwho.is/{ip}", timeout=5)
        if res.status_code == 200:
            data = res.json()
            if data["success"]:
                return {
                    "ip": ip,
                    "country": data["country"],
                    "latitude": data["latitude"],
                    "longitude": data["longitude"],
                    "city": data["city"]
                }
    except Exception:
        pass
    return None
    


def validate_user_service_ownership(db, dev_id, service_id):
    return db.query(Service).filter_by(owner_id=dev_id, service_id=service_id).first() is not None

