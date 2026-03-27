from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

from app.models import db
from app.routes.auth import auth_bp
from app.routes.students import students_bp
from app.routes.performance import performance_bp
from app.routes.prediction import prediction_bp
from app.routes.analytics import analytics_bp
from app.routes.reports import reports_bp
from app.utils.errors import register_error_handlers
from config import config_by_name

migrate = Migrate()
jwt = JWTManager()


def create_app(config_name: str = "development") -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    allowed_origins = [origin.strip() for origin in app.config["FRONTEND_ORIGINS"].split(",") if origin.strip()]
    CORS(app, resources={r"/*": {"origins": allowed_origins}})

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(students_bp, url_prefix="/students")
    app.register_blueprint(performance_bp, url_prefix="/performance")
    app.register_blueprint(prediction_bp, url_prefix="/")
    app.register_blueprint(analytics_bp, url_prefix="/analytics")
    app.register_blueprint(reports_bp, url_prefix="/reports")
    register_error_handlers(app)

    @app.get("/health")
    def health_check():
        return {"status": "ok"}, 200

    return app
