import secrets
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# SECRET_KEY = "laa&^%$#iu298374*&*&97543SD^&^$sJASD5&^$#4325JH*^$#@F"
# Get absolute path to this file's directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Read the keys
with open(os.path.join(BASE_DIR, '../private.pem'), 'r') as private:
    PRIVATE_KEY = private.read()

with open(os.path.join(BASE_DIR, '../public.pem'), 'r') as public:
    PUBLIC_KEY = public.read()


def hash_password(password):
    return pwd_context.hash(password)


def verify_password(plain_pass,hash_pass):
    return pwd_context.verify(plain_pass,hash_pass)


def generate_api_key():
    return secrets.token_hex(16)


def create_access_token(data, expires_delta=timedelta(hours=4)):
    to_encode=data.copy()
    expire=datetime.utcnow() + expires_delta
    to_encode.update({"exp":expire})
    encoded_jwt=jwt.encode(to_encode,PRIVATE_KEY,algorithm='RS256')
    return encoded_jwt

def verify_access_token(token):
    try:
        payload=jwt.decode(token,PUBLIC_KEY,algorithms='RS256')
        return payload
    except Exception as e:
        return e
    


