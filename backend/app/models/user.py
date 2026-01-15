"""User model for authentication"""
from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    """User model for authentication"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    volunteer_id = db.Column(db.Integer, db.ForeignKey('volunteers.id'), unique=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='volunteer')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    volunteer = db.relationship('Volunteer', back_populates='user')

    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password):
        """Check if password matches hash"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'volunteer_id': self.volunteer_id,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        return f'<User {self.username}>'
