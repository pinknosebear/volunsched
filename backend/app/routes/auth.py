"""Authentication routes"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User, Volunteer

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user and volunteer"""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    # Validate required fields
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    phone = data.get('phone')
    email = data.get('email')

    if not all([username, password, name, phone]):
        return jsonify({'error': 'Missing required fields: username, password, name, phone'}), 400

    # Check if username exists
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    # Check if phone exists
    if Volunteer.query.filter_by(phone=phone).first():
        return jsonify({'error': 'Phone number already registered'}), 400

    try:
        # Create volunteer
        volunteer = Volunteer(name=name, phone=phone, email=email)
        db.session.add(volunteer)
        db.session.flush()  # Get the volunteer ID

        # Create user
        user = User(username=username, volunteer_id=volunteer.id, role='volunteer')
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        # Create access token
        access_token = create_access_token(identity=user.id)

        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': user.to_dict(),
            'volunteer': volunteer.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Missing username or password'}), 400

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid username or password'}), 401

    # Create access token (identity must be a string)
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': user.to_dict(),
        'volunteer': user.volunteer.to_dict() if user.volunteer else None
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'user': user.to_dict(),
        'volunteer': user.volunteer.to_dict() if user.volunteer else None
    }), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (token blacklisting would be implemented here)"""
    return jsonify({'message': 'Logout successful'}), 200
