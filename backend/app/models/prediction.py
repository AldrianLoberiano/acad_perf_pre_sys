from datetime import datetime

from app.models import db


class Prediction(db.Model):
    __tablename__ = "predictions"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)
    predicted_grade = db.Column(db.String(10), nullable=False)
    risk_level = db.Column(db.String(20), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    failure_probability = db.Column(db.Float, nullable=False)
    recommendations = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "student_id": self.student_id,
            "predicted_grade": self.predicted_grade,
            "risk_level": self.risk_level,
            "confidence": self.confidence,
            "failure_probability": self.failure_probability,
            "recommendations": self.recommendations.split("||") if self.recommendations else [],
            "created_at": self.created_at.isoformat(),
        }
