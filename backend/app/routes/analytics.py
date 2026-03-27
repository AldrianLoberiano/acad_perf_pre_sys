from flask import Blueprint
from flask_jwt_extended import jwt_required
from sqlalchemy import case, func

from app.models.performance import Performance
from app.models.prediction import Prediction
from app.models.student import Student

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.get("/overview")
@jwt_required()
def analytics_overview():
    class_average = (
        Performance.query.with_entities(
            func.avg(
                (Performance.quiz_score + Performance.assignment_score + Performance.attendance) / 3.0
            )
        ).scalar()
        or 0.0
    )

    top_performers = (
        Student.query.join(Performance, Student.id == Performance.student_id)
        .with_entities(
            Student.id,
            Student.name,
            func.avg((Performance.quiz_score + Performance.assignment_score) / 2.0).label("avg_score"),
        )
        .group_by(Student.id)
        .order_by(func.avg((Performance.quiz_score + Performance.assignment_score) / 2.0).desc())
        .limit(5)
        .all()
    )

    pass_fail = (
        Prediction.query.with_entities(
            func.sum(case((Prediction.predicted_grade != "Fail", 1), else_=0)).label("pass_count"),
            func.sum(case((Prediction.predicted_grade == "Fail", 1), else_=0)).label("fail_count"),
        ).first()
    )

    trends = (
        Prediction.query.with_entities(
            func.date(Prediction.created_at).label("date"),
            func.avg(Prediction.failure_probability).label("avg_failure_probability"),
        )
        .group_by(func.date(Prediction.created_at))
        .order_by(func.date(Prediction.created_at).asc())
        .all()
    )

    return {
        "class_average": round(float(class_average), 2),
        "top_performers": [
            {
                "student_id": item.id,
                "name": item.name,
                "avg_score": round(float(item.avg_score), 2),
            }
            for item in top_performers
        ],
        "pass_fail_ratio": {
            "pass": int(pass_fail.pass_count or 0),
            "fail": int(pass_fail.fail_count or 0),
        },
        "performance_trends": [
            {
                "date": str(item.date),
                "avg_failure_probability": round(float(item.avg_failure_probability), 4),
            }
            for item in trends
        ],
    }, 200


@analytics_bp.get("/at-risk")
@jwt_required()
def at_risk_students():
    risky = (
        Prediction.query.join(Student, Prediction.student_id == Student.id)
        .with_entities(
            Student.id,
            Student.name,
            Student.course,
            Prediction.risk_level,
            Prediction.failure_probability,
            Prediction.created_at,
        )
        .filter(Prediction.risk_level.in_(["High", "Medium"]))
        .order_by(Prediction.failure_probability.desc())
        .all()
    )

    return {
        "data": [
            {
                "student_id": item.id,
                "name": item.name,
                "course": item.course,
                "risk_level": item.risk_level,
                "failure_probability": round(float(item.failure_probability), 4),
                "created_at": item.created_at.isoformat(),
            }
            for item in risky
        ]
    }, 200
