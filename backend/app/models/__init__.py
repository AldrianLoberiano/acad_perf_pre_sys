from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()

from app.models.user import User  # noqa: E402,F401
from app.models.student import Student  # noqa: E402,F401
from app.models.performance import Performance  # noqa: E402,F401
from app.models.prediction import Prediction  # noqa: E402,F401
