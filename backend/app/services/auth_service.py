from functools import wraps

from flask import abort
from flask_jwt_extended import get_jwt, verify_jwt_in_request


def role_required(allowed_roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            role = claims.get("role")
            if role not in allowed_roles:
                abort(403, description="Insufficient role permissions")
            return fn(*args, **kwargs)

        return decorator

    return wrapper
