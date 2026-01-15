"""Shift model"""
from app import db
from datetime import datetime


class Shift(db.Model):
    """Shift model representing a volunteer shift"""
    __tablename__ = 'shifts'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    day_name = db.Column(db.String(10), nullable=False)  # e.g., 'Thursday'
    week_of_month = db.Column(db.Integer)
    shift_type = db.Column(db.String(10), nullable=False)  # 'Kakad' or 'Robes'
    capacity = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    signups = db.relationship('Signup', back_populates='shift', cascade='all, delete-orphan')

    __table_args__ = (
        db.UniqueConstraint('date', 'shift_type', name='unique_date_shifttype'),
    )

    def to_dict(self, include_signups=False):
        """Convert model to dictionary"""
        data = {
            'id': self.id,
            'date': self.date.isoformat(),
            'day_name': self.day_name,
            'week_of_month': self.week_of_month,
            'shift_type': self.shift_type,
            'capacity': self.capacity,
            'created_at': self.created_at.isoformat(),
            'current_signups': len([s for s in self.signups if s.status == 'confirmed'])
        }
        if include_signups:
            data['signups'] = [s.to_dict() for s in self.signups]
        return data

    def __repr__(self):
        return f'<Shift {self.shift_type} {self.date}>'
