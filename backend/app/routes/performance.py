from flask import Blueprint, abort, request
from flask_jwt_extended import jwt_required

from app.models import db
from app.models.performance import Performance
from app.models.student import Student
from app.services.auth_service import role_required
from app.utils.validators import require_fields

performance_bp = Blueprint("performance", __name__)


@performance_bp.post("")
@role_required({"admin", "teacher"})
def add_performance():
    payload = request.get_json() or {}
    require_fields(
        payload,
        ["student_id", "attendance", "quiz_score", "assignment_score", "study_hours"],
    )

    try:
        student_id = int(payload["student_id"])
        attendance = float(payload["attendance"])
        quiz_score = float(payload["quiz_score"])
        assignment_score = float(payload["assignment_score"])
        study_hours = float(payload["study_hours"])
    except (TypeError, ValueError):
        abort(
            400,
            description=(
                "student_id must be an integer and attendance, quiz_score, "
                "assignment_score, study_hours must be numeric"
            ),
        )

    student = Student.query.get_or_404(student_id)

    record = Performance(
        student_id=student.id,
        attendance=attendance,
        quiz_score=quiz_score,
        assignment_score=assignment_score,
        study_hours=study_hours,
    )

    db.session.add(record)
    db.session.commit()

    return {"message": "Performance added", "performance": record.to_dict()}, 201


@performance_bp.get("/<int:student_id>")
@jwt_required()
def get_performance(student_id: int):
    Student.query.get_or_404(student_id)
    records = (
        Performance.query.filter_by(student_id=student_id)
        .order_by(Performance.created_at.desc())
        .all()
    )

    return {"student_id": student_id, "records": [record.to_dict() for record in records]}, 200
