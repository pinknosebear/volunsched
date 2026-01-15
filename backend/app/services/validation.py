"""Validation service for scheduling rules"""
from app.models import Signup, Shift
from sqlalchemy import and_


class ValidationService:
    """Service for validating volunteer signups against scheduling rules"""

    @staticmethod
    def validate_signup(volunteer_id, shift_id):
        """
        Validate if a volunteer can sign up for a shift.

        Implements the following rules:
        1. Maximum Kakad signups: 2 total per volunteer
        2. Maximum total signups: 4 total per volunteer (Kakad + Robes)
        3. Maximum Thursday signups: 2 total per volunteer (any day of week)
        4. Shift capacity: cannot exceed shift's capacity
        5. No duplicates: volunteer cannot sign up for same shift twice

        Args:
            volunteer_id: ID of the volunteer
            shift_id: ID of the shift

        Returns:
            tuple: (is_valid: bool, error_message: str or None)
        """
        shift = Shift.query.get(shift_id)
        if not shift:
            return False, "Shift not found"

        # Get all current signups for this volunteer (confirmed only)
        volunteer_signups = Signup.query.filter(
            Signup.volunteer_id == volunteer_id,
            Signup.status == 'confirmed'
        ).all()

        # Rule 1: Check total Kakad signups (max 2)
        kakad_count = sum(1 for s in volunteer_signups if s.shift.shift_type == 'Kakad')
        if shift.shift_type == 'Kakad' and kakad_count >= 2:
            return False, "Maximum Kakad signups (2) reached"

        # Rule 2: Check total signups (max 4)
        total_signups = len(volunteer_signups)
        if total_signups >= 4:
            return False, "Maximum total signups (4) reached"

        # Rule 3: Check Thursday-specific limit (max 2)
        # Thursday shifts include any shift on any Thursday date
        if shift.day_name == 'Thursday':
            thursday_count = sum(1 for s in volunteer_signups if s.shift.day_name == 'Thursday')
            if thursday_count >= 2:
                return False, "Maximum Thursday signups (2) reached"

        # Rule 4: Check shift capacity
        current_signups = Signup.query.filter(
            Signup.shift_id == shift_id,
            Signup.status == 'confirmed'
        ).count()

        if current_signups >= shift.capacity:
            return False, f"Shift is at full capacity ({shift.capacity})"

        # Rule 5: Prevent duplicate signup
        duplicate = Signup.query.filter(
            and_(
                Signup.volunteer_id == volunteer_id,
                Signup.shift_id == shift_id
            )
        ).first()

        if duplicate:
            return False, "Already signed up for this shift"

        return True, None

    @staticmethod
    def get_volunteer_stats(volunteer_id):
        """
        Get current signup statistics for a volunteer.

        Returns counts and remaining capacity for each constraint.

        Args:
            volunteer_id: ID of the volunteer

        Returns:
            dict: Statistics about volunteer's signups and remaining capacity
        """
        signups = Signup.query.filter(
            Signup.volunteer_id == volunteer_id,
            Signup.status == 'confirmed'
        ).all()

        kakad_count = sum(1 for s in signups if s.shift.shift_type == 'Kakad')
        total_count = len(signups)
        thursday_count = sum(1 for s in signups if s.shift.day_name == 'Thursday')

        return {
            'kakad_signups': kakad_count,
            'kakad_remaining': 2 - kakad_count,
            'total_signups': total_count,
            'total_remaining': 4 - total_count,
            'thursday_signups': thursday_count,
            'thursday_remaining': 2 - thursday_count
        }

    @staticmethod
    def find_eligible_volunteers(shift_id, exclude_volunteer_id=None):
        """
        Find all volunteers eligible to sign up for a specific shift.

        Used by coordinators to find substitute candidates.

        Args:
            shift_id: ID of the shift
            exclude_volunteer_id: Optional volunteer ID to exclude

        Returns:
            list: List of volunteer IDs who are eligible for this shift
        """
        from app.models import Volunteer

        shift = Shift.query.get(shift_id)
        if not shift:
            return []

        all_volunteers = Volunteer.query.all()
        eligible = []

        for volunteer in all_volunteers:
            if exclude_volunteer_id and volunteer.id == exclude_volunteer_id:
                continue

            # Check if volunteer can sign up
            is_valid, _ = ValidationService.validate_signup(volunteer.id, shift_id)
            if is_valid:
                eligible.append(volunteer)

        return eligible
