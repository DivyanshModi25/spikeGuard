from functools import wraps
from flask import request, jsonify
import utils  # your JWT utility functions

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if request.cookies.get('access_token'):
            token = request.cookies.get('access_token')
        else:
            return jsonify({"message": "Token is missing or invalid format"}), 401
        try:
            data = utils.verify_access_token(token)
            if data is None:
                raise Exception("Invalid token")
            request.dev_id = data["dev_id"]

        except Exception as e:
            return jsonify({"message": str(e)}), 401
        
        return f(*args, **kwargs)
    
    return decorated
