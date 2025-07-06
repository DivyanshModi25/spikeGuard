import secrets
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Read RSA keys from environment variables
PRIVATE_KEY = os.environ.get("PRIVATE_KEY")
PUBLIC_KEY = os.environ.get("PUBLIC_KEY")


def generate_api_key():
    return secrets.token_hex(16)


def verify_access_token(token):
    try:
        payload=jwt.decode(token,PUBLIC_KEY,algorithms='RS256')
        return payload
    except Exception as e:
        return e
    


