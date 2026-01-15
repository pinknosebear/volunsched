"""Volunteer routes"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Volunteer, User
from app.services.validation import ValidationService

volunteers_bp = Blueprint('volunteers', __name__, url_prefix='/api/volunteers')


@volunteers_bp.route('', methods=['GET'])
@jwt_required()
def get_volunteers():
    """Get list of all volunteers (coordinator only)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'coordinator':
        return jsonify({'error': 'Coordinator access required'}), 403

    volunteers = Volunteer.query.all()
    return jsonify([v.to_dict() for v in volunteers]), 200


@volunteers_bp.route('/<int:volunteer_id>', methods=['GET'])
@jwt_required()
def get_volunteer(volunteer_id):
    """Get specific volunteer details"""
    volunteer = Volunteer.query.get(volunteer_id)

    if not volunteer:
        return jsonify({'error': 'Volunteer not found'}), 404

    return jsonify(volunteer.to_dict()), 200


@volunteers_bp.route('', methods=['POST'])
@jwt_required()
def create_volunteer():
    """Create a new volunteer (coordinator only)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'coordinator':
        return jsonify({'error': 'Coordinator access required'}), 403

    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    # Validate required fields
    name = data.get('name')
    phone = data.get('phone')
    email = data.get('email')

    if not name or not phone:
        return jsonify({'error': 'Missing required fields: name, phone'}), 400

    # Check if phone exists
    if Volunteer.query.filter_by(phone=phone).first():
        return jsonify({'error': 'Phone number already registered'}), 400

    try:
        volunteer = Volunteer(
            name=name,
            phone=phone,
            email=email,
            reliability_score=data.get('reliability_score', 100)
        )
        db.session.add(volunteer)
        db.session.commit()

        return jsonify(volunteer.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create volunteer: {str(e)}'}), 500


@volunteers_bp.route('/<int:volunteer_id>', methods=['PUT'])
@jwt_required()
def update_volunteer(volunteer_id):
    """Update volunteer details"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    volunteer = Volunteer.query.get(volunteer_id)

    if not volunteer:
        return jsonify({'error': 'Volunteer not found'}), 404

    # Check permissions: own volunteer or coordinator
    if user.volunteer_id != volunteer_id and user.role != 'coordinator':
        return jsonify({'error': 'Insufficient permissions'}), 403

    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        if 'name' in data:
            volunteer.name = data['name']
        if 'email' in data:
            volunteer.email = data['email']
        if 'reliability_score' in data and user.role == 'coordinator':
            volunteer.reliability_score = data['reliability_score']

        db.session.commit()
        return jsonify(volunteer.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update volunteer: {str(e)}'}), 500


@volunteers_bp.route('/<int:volunteer_id>/stats', methods=['GET'])
@jwt_required()
def get_volunteer_stats(volunteer_id):
    """Get volunteer's signup statistics"""
    volunteer = Volunteer.query.get(volunteer_id)

    if not volunteer:
        return jsonify({'error': 'Volunteer not found'}), 404

    stats = ValidationService.get_volunteer_stats(volunteer_id)

    return jsonify({
        'volunteer_id': volunteer_id,
        'stats': stats
    }), 200
