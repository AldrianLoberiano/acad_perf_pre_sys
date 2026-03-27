from app.models import db


class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    course = db.Column(db.String(120), nullable=False)

    performances = db.relationship(
        "Performance",
        backref="student",
        cascade="all, delete-orphan",
        lazy=True,
    )
    predictions = db.relationship(
        "Prediction",
        backref="student",
        cascade="all, delete-orphan",
        lazy=True,
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "age": self.age,
            "course": self.course,
        }
