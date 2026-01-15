"""Volunteer model"""
from app import db
from datetime import datetime


class Volunteer(db.Model):
    """Volunteer model representing a volunteer in the system"""
    __tablename__ = 'volunteers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True)
    reliability_score = db.Column(db.Integer, default=100)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    signups = db.relationship('Signup', back_populates='volunteer', cascade='all, delete-orphan')
    user = db.relationship('User', back_populates='volunteer', uselist=False)

    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'reliability_score': self.reliability_score,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<Volunteer {self.name}>'
