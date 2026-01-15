"""Flask application factory"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app(config_name='development'):
    """Create and configure Flask application"""
    app = Flask(__name__)

    # Load configuration
    if config_name == 'testing':
        from app.config import TestingConfig
        app.config.from_object(TestingConfig)
    elif config_name == 'production':
        from app.config import ProductionConfig
        app.config.from_object(ProductionConfig)
    else:
        from app.config import DevelopmentConfig
        app.config.from_object(DevelopmentConfig)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    jwt.init_app(app)

    # Register blueprints
    with app.app_context():
        from app.routes import auth_bp, volunteers_bp, shifts_bp, signups_bp, coordinator_bp
        app.register_blueprint(auth_bp)
        app.register_blueprint(volunteers_bp)
        app.register_blueprint(shifts_bp)
        app.register_blueprint(signups_bp)
        app.register_blueprint(coordinator_bp)

    # Create tables
    with app.app_context():
        db.create_all()

    return app
