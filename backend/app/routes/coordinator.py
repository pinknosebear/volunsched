"""Coordinator-specific routes for dashboards and tools"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Volunteer, Shift, Signup
from app.services.validation import ValidationService
from app.services.notifications import NotificationService
from sqlalchemy import func

coordinator_bp = Blueprint('coordinator', __name__, url_prefix='/api/coordinator')


@coordinator_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    """Get coordinator dashboard overview"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'coordinator':
        return jsonify({'error': 'Coordinator access required'}), 403

    # Get all metrics
    total_volunteers = Volunteer.query.count()
    total_signups = Signup.query.filter_by(status='confirmed').count()
    total_shifts = Shift.query.count()

    # Get upcoming shifts
    upcoming_shifts = Shift.query.order_by(Shift.date).limit(10).all()

    # Calculate understaffed shifts
    understaffed = []
    for shift in upcoming_shifts:
        current_signups = Signup.query.filter(
            Signup.shift_id == shift.id,
            Signup.status == 'confirmed'
        ).count()
        if current_signups < shift.capacity:
            understaffed.append({
                'shift': shift.to_dict(),
                'current_signups': current_signups,
                'needed': shift.capacity - current_signups
            })

    # Get average reliability score
    avg_reliability = db.session.query(
        func.avg(Volunteer.reliability_score)
    ).scalar() or 0

    return jsonify({
        'total_volunteers': total_volunteers,
        'total_signups': total_signups,
        'total_shifts': total_shifts,
        'average_reliability_score': round(float(avg_reliability), 2),
        'understaffed_shifts': understaffed
    }), 200


@coordinator_bp.route('/substitutes', methods=['GET'])
@jwt_required()
def find_substitutes():
    """Find available substitutes for a shift"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'coordinator':
        return jsonify({'error': 'Coordinator access required'}), 403

    shift_id = request.args.get('shift_id', type=int)

    if not shift_id:
        return jsonify({'error': 'Missing shift_id parameter'}), 400

    shift = Shift.query.get(shift_id)

    if not shift:
        return jsonify({'error': 'Shift not found'}), 404

    # Find eligible volunteers
    eligible_volunteers = ValidationService.find_eligible_volunteers(shift_id)

    # Get their current stats
    candidates = []
    for volunteer in eligible_volunteers:
        stats = ValidationService.get_volunteer_stats(volunteer.id)
        candidates.append({
            'volunteer': volunteer.to_dict(),
            'stats': stats
        })

    # Sort by reliability score (highest first)
    candidates.sort(
        key=lambda x: x['volunteer']['reliability_score'],
        reverse=True
    )

    return jsonify({
        'shift': shift.to_dict(),
        'available_substitutes': candidates
    }), 200


@coordinator_bp.route('/notifications/send', methods=['POST'])
@jwt_required()
def send_bulk_notification():
    """Send notifications to multiple volunteers"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'coordinator':
        return jsonify({'error': 'Coordinator access required'}), 403

    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    volunteer_ids = data.get('volunteer_ids', [])
    message = data.get('message')

    if not volunteer_ids or not message:
        return jsonify({'error': 'Missing volunteer_ids or message'}), 400

    if not isinstance(volunteer_ids, list):
        return jsonify({'error': 'volunteer_ids must be a list'}), 400

    # Send notifications
    sent = 0
    failed = []

    for vol_id in volunteer_ids:
        volunteer = Volunteer.query.get(vol_id)
        if volunteer:
            success = NotificationService.send_custom_message(volunteer.phone, message)
            if success:
                sent += 1
            else:
                failed.append(vol_id)
        else:
            failed.append(vol_id)

    return jsonify({
        'message': f'Notifications sent to {sent} volunteers',
        'sent': sent,
        'failed': failed
    }), 200


@coordinator_bp.route('/volunteers/reliability', methods=['GET'])
@jwt_required()
def get_volunteers_by_reliability():
    """Get volunteers sorted by reliability score"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'coordinator':
        return jsonify({'error': 'Coordinator access required'}), 403

    min_score = request.args.get('min_score', type=int, default=0)

    volunteers = Volunteer.query.filter(
        Volunteer.reliability_score >= min_score
    ).order_by(
        Volunteer.reliability_score.desc()
    ).all()

    return jsonify([v.to_dict() for v in volunteers]), 200


@coordinator_bp.route('/shifts/fill-status', methods=['GET'])
@jwt_required()
def get_shifts_fill_status():
    """Get all shifts with their fill status"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'coordinator':
        return jsonify({'error': 'Coordinator access required'}), 403

    shifts = Shift.query.order_by(Shift.date).all()

    shifts_with_status = []
    for shift in shifts:
        current_signups = Signup.query.filter(
            Signup.shift_id == shift.id,
            Signup.status == 'confirmed'
        ).count()

        fill_percentage = (current_signups / shift.capacity * 100) if shift.capacity > 0 else 0

        shifts_with_status.append({
            'shift': shift.to_dict(),
            'current_signups': current_signups,
            'fill_percentage': round(fill_percentage, 1),
            'is_full': current_signups >= shift.capacity,
            'is_understaffed': current_signups < shift.capacity
        })

    return jsonify(shifts_with_status), 200
