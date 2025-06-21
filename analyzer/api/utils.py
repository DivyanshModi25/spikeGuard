import jwt

with open('./public.pem', 'r') as public:
    PUBLIC_KEY = public.read()


def verify_access_token(token):
    try:
        payload=jwt.decode(token,PUBLIC_KEY,algorithms='RS256')
        return payload
    except Exception as e:
        return e
    


