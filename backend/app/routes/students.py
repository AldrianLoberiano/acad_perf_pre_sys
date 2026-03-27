import io

import pandas as pd
from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from app.models import db
from app.models.student import Student
from app.services.auth_service import role_required
from app.utils.validators import require_fields

students_bp = Blueprint("students", __name__)


@students_bp.get("")
@jwt_required()
def list_students():
    students = Student.query.order_by(Student.id.asc()).all()
    return {"data": [student.to_dict() for student in students]}, 200


@students_bp.post("")
@role_required({"admin", "teacher"})
def create_student():
    payload = request.get_json() or {}
    require_fields(payload, ["name", "age", "course"])

    student = Student(
        name=payload["name"].strip(),
        age=int(payload["age"]),
        course=payload["course"].strip(),
    )

    db.session.add(student)
    db.session.commit()

    return {"message": "Student created", "student": student.to_dict()}, 201


@students_bp.post("/bulk-upload")
@role_required({"admin", "teacher"})
def bulk_upload_students():
    if "file" not in request.files:
        return {"message": "CSV file is required in 'file' field"}, 400

    csv_file = request.files["file"]
    content = csv_file.read().decode("utf-8")
    dataframe = pd.read_csv(io.StringIO(content))

    required_columns = {"name", "age", "course"}
    if not required_columns.issubset(set(dataframe.columns)):
        return {"message": "CSV must contain columns: name, age, course"}, 400

    created = []
    for _, row in dataframe.iterrows():
        student = Student(name=str(row["name"]).strip(), age=int(row["age"]), course=str(row["course"]).strip())
        db.session.add(student)
        created.append(student)

    db.session.commit()

    return {
        "message": f"Uploaded {len(created)} students",
        "students": [student.to_dict() for student in created],
    }, 201


@students_bp.put("/<int:student_id>")
@role_required({"admin", "teacher"})
def update_student(student_id: int):
    student = Student.query.get_or_404(student_id)
    payload = request.get_json() or {}

    if "name" in payload:
        student.name = payload["name"].strip()
    if "age" in payload:
        student.age = int(payload["age"])
    if "course" in payload:
        student.course = payload["course"].strip()

    db.session.commit()

    return {"message": "Student updated", "student": student.to_dict()}, 200


@students_bp.delete("/<int:student_id>")
@role_required({"admin"})
def delete_student(student_id: int):
    student = Student.query.get_or_404(student_id)
    db.session.delete(student)
    db.session.commit()

    return {"message": "Student deleted"}, 200
