from jose import jwt
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))



with open(os.path.join(BASE_DIR, '../public.pem'), 'r') as public:
    PUBLIC_KEY = public.read()


def decode_token(token):
    try:
        payload = jwt.decode(token, PUBLIC_KEY, algorithms='RS256')
        return payload
    except Exception:
        return None
