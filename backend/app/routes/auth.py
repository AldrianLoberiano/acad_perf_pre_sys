from flask import Blueprint, request
from flask_jwt_extended import create_access_token

from app.models import db
from app.models.user import User
from app.utils.validators import require_fields, validate_role

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    payload = request.get_json() or {}
    require_fields(payload, ["username", "password", "role"])

    username = payload["username"].strip()
    password = payload["password"]
    role = payload["role"].lower().strip()

    if not validate_role(role):
        return {"message": "Role must be one of: admin, teacher, student"}, 400

    if User.query.filter_by(username=username).first():
        return {"message": "Username already exists"}, 409

    user = User(username=username, role=role)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return {"message": "User registered successfully", "user": user.to_dict()}, 201


@auth_bp.post("/login")
def login():
    payload = request.get_json() or {}
    require_fields(payload, ["username", "password"])

    user = User.query.filter_by(username=payload["username"].strip()).first()
    if not user or not user.check_password(payload["password"]):
        return {"message": "Invalid credentials"}, 401

    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return {
        "access_token": token,
        "user": user.to_dict(),
    }, 200
