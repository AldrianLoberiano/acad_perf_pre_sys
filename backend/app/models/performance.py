from datetime import datetime

from app.models import db


class Performance(db.Model):
    __tablename__ = "performance"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)
    attendance = db.Column(db.Float, nullable=False)
    quiz_score = db.Column(db.Float, nullable=False)
    assignment_score = db.Column(db.Float, nullable=False)
    study_hours = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "student_id": self.student_id,
            "attendance": self.attendance,
            "quiz_score": self.quiz_score,
            "assignment_score": self.assignment_score,
            "study_hours": self.study_hours,
            "created_at": self.created_at.isoformat(),
        }
