"""Shift routes"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Shift, User
from datetime import datetime

shifts_bp = Blueprint('shifts', __name__, url_prefix='/api/shifts')


@shifts_bp.route('', methods=['GET'])
@jwt_required()
def get_shifts():
    """Get list of shifts with optional filters"""
    # Get query parameters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    shift_type = request.args.get('shift_type')  # 'Kakad' or 'Robes'

    query = Shift.query

    if start_date:
        try:
            start = datetime.fromisoformat(start_date).date()
            query = query.filter(Shift.date >= start)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format'}), 400

    if end_date:
        try:
            end = datetime.fromisoformat(end_date).date()
            query = query.filter(Shift.date <= end)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format'}), 400

    if shift_type:
        query = query.filter(Shift.shift_type == shift_type)

    shifts = query.order_by(Shift.date).all()
    return jsonify([s.to_dict() for s in shifts]), 200


@shifts_bp.route('/<int:shift_id>', methods=['GET'])
@jwt_required()
def get_shift(shift_id):
    """Get specific shift details with signups"""
    shift = Shift.query.get(shift_id)

    if not shift:
        return jsonify({'error': 'Shift not found'}), 404

    return jsonify(shift.to_dict(include_signups=True)), 200


@shifts_bp.route('', methods=['POST'])
@jwt_required()
def create_shift():
    """Create a new shift (coordinator only)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'coordinator':
        return jsonify({'error': 'Coordinator access required'}), 403

    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    # Validate required fields
    date_str = data.get('date')
    shift_type = data.get('shift_type')  # 'Kakad' or 'Robes'

    if not date_str or not shift_type:
        return jsonify({'error': 'Missing required fields: date, shift_type'}), 400

    if shift_type not in ['Kakad', 'Robes']:
        return jsonify({'error': 'Invalid shift_type. Must be Kakad or Robes'}), 400

    try:
        shift_date = datetime.fromisoformat(date_str).date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use ISO format (YYYY-MM-DD)'}), 400

    # Get day name
    day_name = shift_date.strftime('%A')

    # Check if shift already exists for this date and type
    existing = Shift.query.filter_by(date=shift_date, shift_type=shift_type).first()
    if existing:
        return jsonify({'error': f'{shift_type} shift already exists for {shift_date}'}), 400

    try:
        # Default capacity: Kakad=1, Robes=4
        capacity = data.get('capacity', 1 if shift_type == 'Kakad' else 4)

        shift = Shift(
            date=shift_date,
            day_name=day_name,
            shift_type=shift_type,
            capacity=capacity
        )
        db.session.add(shift)
        db.session.commit()

        return jsonify(shift.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create shift: {str(e)}'}), 500


@shifts_bp.route('/<int:shift_id>', methods=['PUT'])
@jwt_required()
def update_shift(shift_id):
    """Update shift details (coordinator only)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'coordinator':
        return jsonify({'error': 'Coordinator access required'}), 403

    shift = Shift.query.get(shift_id)

    if not shift:
        return jsonify({'error': 'Shift not found'}), 404

    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        if 'capacity' in data:
            shift.capacity = data['capacity']

        db.session.commit()
        return jsonify(shift.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update shift: {str(e)}'}), 500


@shifts_bp.route('/<int:shift_id>', methods=['DELETE'])
@jwt_required()
def delete_shift(shift_id):
    """Delete a shift (coordinator only)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or user.role != 'coordinator':
        return jsonify({'error': 'Coordinator access required'}), 403

    shift = Shift.query.get(shift_id)

    if not shift:
        return jsonify({'error': 'Shift not found'}), 404

    try:
        # Delete associated signups cascade
        db.session.delete(shift)
        db.session.commit()

        return jsonify({'message': 'Shift deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete shift: {str(e)}'}), 500
