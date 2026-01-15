"""Routes blueprints"""
from app.routes.auth import auth_bp
from app.routes.volunteers import volunteers_bp
from app.routes.shifts import shifts_bp
from app.routes.signups import signups_bp
from app.routes.coordinator import coordinator_bp

__all__ = ['auth_bp', 'volunteers_bp', 'shifts_bp', 'signups_bp', 'coordinator_bp']
