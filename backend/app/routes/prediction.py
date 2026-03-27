from flask import Blueprint, current_app
from flask_jwt_extended import jwt_required

from app.ml.model_service import ModelService
from app.models import db
from app.models.performance import Performance
from app.models.prediction import Prediction
from app.models.student import Student
from app.services.auth_service import role_required
from app.services.recommendation_service import build_recommendations

prediction_bp = Blueprint("prediction", __name__)


def _latest_performance(student_id: int):
    return (
        Performance.query.filter_by(student_id=student_id)
        .order_by(Performance.created_at.desc())
        .first()
    )


@prediction_bp.post("/predict/<int:student_id>")
@role_required({"admin", "teacher"})
def predict_student(student_id: int):
    Student.query.get_or_404(student_id)
    performance = _latest_performance(student_id)

    if not performance:
        return {"message": "No performance data found for student"}, 404

    service = ModelService(
        model_path=current_app.config["MODEL_PATH"],
        scaler_path=current_app.config["SCALER_PATH"],
    )

    try:
        result = service.predict(
            attendance=performance.attendance,
            quiz_score=performance.quiz_score,
            assignment_score=performance.assignment_score,
            study_hours=performance.study_hours,
        )
    except FileNotFoundError as exc:
        return {"message": str(exc)}, 400

    recommendations = build_recommendations(performance, result["failure_probability"])

    prediction = Prediction(
        student_id=student_id,
        predicted_grade=result["predicted_grade"],
        risk_level=result["risk_level"],
        confidence=result["confidence"],
        failure_probability=result["failure_probability"],
        recommendations="||".join(recommendations),
    )

    db.session.add(prediction)
    db.session.commit()

    return {
        "student_id": student_id,
        "predicted_grade": result["predicted_grade"],
        "risk_level": result["risk_level"],
        "confidence": result["confidence"],
        "failure_probability": result["failure_probability"],
        "recommendations": recommendations,
    }, 200


@prediction_bp.get("/predictions")
@jwt_required()
def list_predictions():
    predictions = Prediction.query.order_by(Prediction.created_at.desc()).all()
    return {"data": [item.to_dict() for item in predictions]}, 200
