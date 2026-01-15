"""Signup model"""
from app import db
from datetime import datetime


class Signup(db.Model):
    """Signup model representing a volunteer's signup for a shift"""
    __tablename__ = 'signups'

    id = db.Column(db.Integer, primary_key=True)
    volunteer_id = db.Column(db.Integer, db.ForeignKey('volunteers.id'), nullable=False)
    shift_id = db.Column(db.Integer, db.ForeignKey('shifts.id'), nullable=False)
    status = db.Column(db.String(20), default='confirmed')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    volunteer = db.relationship('Volunteer', back_populates='signups')
    shift = db.relationship('Shift', back_populates='signups')

    __table_args__ = (
        db.UniqueConstraint('volunteer_id', 'shift_id', name='unique_volunteer_shift'),
    )

    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'volunteer_id': self.volunteer_id,
            'shift_id': self.shift_id,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'volunteer': self.volunteer.to_dict() if self.volunteer else None,
            'shift': self.shift.to_dict() if self.shift else None
        }

    def __repr__(self):
        return f'<Signup volunteer_id={self.volunteer_id} shift_id={self.shift_id}>'
