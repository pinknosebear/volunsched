"""Signup routes with validation"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Signup, Shift, User, Volunteer
from app.services.validation import ValidationService
from app.services.notifications import NotificationService

signups_bp = Blueprint('signups', __name__, url_prefix='/api/signups')


@signups_bp.route('', methods=['GET'])
@jwt_required()
def get_signups():
    """Get list of signups with optional filters"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    # Get query parameters
    volunteer_id = request.args.get('volunteer_id', type=int)
    shift_id = request.args.get('shift_id', type=int)
    status = request.args.get('status')

    query = Signup.query

    # Non-coordinators can only see their own signups
    if user.role != 'coordinator':
        query = query.filter(Signup.volunteer_id == user.volunteer_id)
    elif volunteer_id:
        query = query.filter(Signup.volunteer_id == volunteer_id)

    if shift_id:
        query = query.filter(Signup.shift_id == shift_id)

    if status:
        query = query.filter(Signup.status == status)

    signups = query.order_by(Signup.created_at.desc()).all()
    return jsonify([s.to_dict() for s in signups]), 200


@signups_bp.route('/validate', methods=['POST'])
@jwt_required()
def validate_signup():
    """Pre-validate a signup without creating it"""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    volunteer_id = data.get('volunteer_id')
    shift_id = data.get('shift_id')

    if not volunteer_id or not shift_id:
        return jsonify({'error': 'Missing volunteer_id or shift_id'}), 400

    # Validate the signup
    is_valid, error_msg = ValidationService.validate_signup(volunteer_id, shift_id)

    # Get volunteer stats
    stats = ValidationService.get_volunteer_stats(volunteer_id)

    return jsonify({
        'is_valid': is_valid,
        'error_message': error_msg,
        'stats': stats
    }), 200


@signups_bp.route('', methods=['POST'])
@jwt_required()
def create_signup():
    """Create a new signup with validation"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    volunteer_id = data.get('volunteer_id')
    shift_id = data.get('shift_id')

    if not volunteer_id or not shift_id:
        return jsonify({'error': 'Missing volunteer_id or shift_id'}), 400

    # Check permissions: own volunteer or coordinator
    if user.volunteer_id != volunteer_id and user.role != 'coordinator':
        return jsonify({'error': 'Insufficient permissions'}), 403

    # Verify volunteer and shift exist
    volunteer = Volunteer.query.get(volunteer_id)
    shift = Shift.query.get(shift_id)

    if not volunteer:
        return jsonify({'error': 'Volunteer not found'}), 404

    if not shift:
        return jsonify({'error': 'Shift not found'}), 404

    # Validate the signup against rules
    is_valid, error_msg = ValidationService.validate_signup(volunteer_id, shift_id)

    if not is_valid:
        return jsonify({'error': error_msg}), 400

    try:
        # Create the signup
        signup = Signup(volunteer_id=volunteer_id, shift_id=shift_id)
        db.session.add(signup)
        db.session.commit()

        # Send confirmation notification
        NotificationService.send_confirmation(volunteer_id, shift_id)

        # Get updated stats
        stats = ValidationService.get_volunteer_stats(volunteer_id)

        return jsonify({
            'message': 'Signup created successfully',
            'signup': signup.to_dict(),
            'stats': stats
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create signup: {str(e)}'}), 500


@signups_bp.route('/<int:signup_id>', methods=['DELETE'])
@jwt_required()
def cancel_signup(signup_id):
    """Cancel a signup"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    signup = Signup.query.get(signup_id)

    if not signup:
        return jsonify({'error': 'Signup not found'}), 404

    # Check permissions: own signup or coordinator
    if signup.volunteer_id != user.volunteer_id and user.role != 'coordinator':
        return jsonify({'error': 'Insufficient permissions'}), 403

    try:
        # Send cancellation notification
        NotificationService.send_cancellation(signup.volunteer_id, signup.shift_id)

        # Delete the signup
        db.session.delete(signup)
        db.session.commit()

        return jsonify({'message': 'Signup cancelled successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to cancel signup: {str(e)}'}), 500


@signups_bp.route('/<int:signup_id>/status', methods=['PUT'])
@jwt_required()
def update_signup_status(signup_id):
    """Update signup status (coordinator only)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'coordinator':
        return jsonify({'error': 'Coordinator access required'}), 403

    signup = Signup.query.get(signup_id)

    if not signup:
        return jsonify({'error': 'Signup not found'}), 404

    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    new_status = data.get('status')

    if new_status not in ['confirmed', 'cancelled', 'no-show']:
        return jsonify({'error': 'Invalid status. Must be confirmed, cancelled, or no-show'}), 400

    try:
        old_status = signup.status
        signup.status = new_status

        db.session.commit()

        # Handle no-show: update reliability score
        if new_status == 'no-show' and old_status == 'confirmed':
            volunteer = Volunteer.query.get(signup.volunteer_id)
            if volunteer:
                volunteer.reliability_score = max(0, volunteer.reliability_score - 10)
                db.session.commit()

        return jsonify({
            'message': f'Signup status updated to {new_status}',
            'signup': signup.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update signup: {str(e)}'}), 500
