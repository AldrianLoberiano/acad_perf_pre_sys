from flask import Blueprint
from flask_jwt_extended import jwt_required

from app.models.performance import Performance
from app.models.prediction import Prediction
from app.models.student import Student

reports_bp = Blueprint("reports", __name__)


@reports_bp.get("/students/<int:student_id>")
@jwt_required()
def student_report(student_id: int):
    student = Student.query.get_or_404(student_id)
    performances = (
        Performance.query.filter_by(student_id=student_id)
        .order_by(Performance.created_at.desc())
        .all()
    )
    predictions = (
        Prediction.query.filter_by(student_id=student_id)
        .order_by(Prediction.created_at.desc())
        .all()
    )

    return {
        "student": student.to_dict(),
        "performance_history": [entry.to_dict() for entry in performances],
        "prediction_history": [entry.to_dict() for entry in predictions],
    }, 200
