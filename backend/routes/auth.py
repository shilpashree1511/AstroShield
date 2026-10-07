"""
Authentication API Routes
Handles user registration, login, and authentication
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from database.mongo_db import mongo_db
from datetime import datetime
import bcrypt
import re

auth_bp = Blueprint('auth', __name__)

DEMO_USER = {
    'username': 'admin',
    'email': 'admin@example.com',
    'role': 'admin'
}

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    return True, "Valid password"

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.json
    
    # Validate required fields
    required_fields = ['username', 'email', 'password']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    username = data['username']
    email = data['email']
    password = data['password']
    
    # Validate email
    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Validate password
    is_valid, message = validate_password(password)
    if not is_valid:
        return jsonify({'error': message}), 400
    
    db = mongo_db.db
    if db is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    # Check if user already exists
    existing_user = db.users.find_one({'$or': [{'username': username}, {'email': email}]})
    if existing_user:
        return jsonify({'error': 'Username or email already exists'}), 409
    
    # Hash password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    # Create user document
    user = {
        'username': username,
        'email': email,
        'password': hashed_password,
        'role': data.get('role', 'user'),
        'created_at': datetime.now().isoformat(),
        'last_login': None,
        'is_active': True
    }
    
    # Insert user
    result = db.users.insert_one(user)
    
    # Create access token
    access_token = create_access_token(identity=username)
    refresh_token = create_refresh_token(identity=username)
    
    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'username': username,
            'email': email,
            'role': user['role']
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return tokens"""
    data = request.json
    
    if not data or ('username' not in data and 'email' not in data) or 'password' not in data:
        return jsonify({'error': 'Username/email and password required'}), 400
    
    identifier = (data.get('username') or data.get('email') or '').strip()
    password = data['password']

    normalized_identifier = identifier.lower()
    demo_identity_matches = (
        normalized_identifier in {DEMO_USER['username'].lower(), DEMO_USER['email'].lower()} or
        identifier == 'admin'
    )

    if demo_identity_matches and password == 'admin123':
        access_token = create_access_token(identity=DEMO_USER['username'])
        refresh_token = create_refresh_token(identity=DEMO_USER['username'])
        return jsonify({
            'message': 'Demo login successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': DEMO_USER
        }), 200
    
    db = mongo_db.db
    if db is None:
        return jsonify({'error': 'Database unavailable. Use demo login admin / admin123, or start MongoDB.'}), 503
    
    # Find user by username or email
    user = db.users.find_one({
        '$or': [
            {'username': identifier},
            {'email': identifier}
        ]
    })
    
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Check password
    if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Check if user is active
    if not user.get('is_active', True):
        return jsonify({'error': 'Account is deactivated'}), 403
    
    # Update last login
    db.users.update_one(
        {'_id': user['_id']},
        {'$set': {'last_login': datetime.now().isoformat()}}
    )
    
    # Create tokens
    access_token = create_access_token(identity=user['username'])
    refresh_token = create_refresh_token(identity=user['username'])
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'username': user['username'],
            'email': user['email'],
            'role': user.get('role', 'user')
        }
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    """Refresh access token"""
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    
    return jsonify({
        'access_token': new_access_token
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (client-side token removal)"""
    # In a production system, you might want to blacklist the token
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    current_user = get_jwt_identity()

    if current_user == DEMO_USER['username']:
        return jsonify(DEMO_USER), 200
    
    db = mongo_db.db
    if db is None:
        return jsonify({'error': 'Database unavailable'}), 503

    user = db.users.find_one({'username': current_user}, {'password': 0, '_id': 0})
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    current_user = get_jwt_identity()
    data = request.json
    
    db = mongo_db.db
    if db is None:
        return jsonify({'error': 'Database unavailable. Start MongoDB to update profile.'}), 503
    
    # Prepare update data (exclude sensitive fields)
    update_data = {}
    allowed_fields = ['email', 'full_name', 'organization']
    
    for field in allowed_fields:
        if field in data:
            update_data[field] = data[field]
    
    if update_data:
        # Validate email if being updated
        if 'email' in update_data and not validate_email(update_data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Check if email is already taken
        if 'email' in update_data:
            existing = db.users.find_one({'email': update_data['email'], 'username': {'$ne': current_user}})
            if existing:
                return jsonify({'error': 'Email already in use'}), 409
        
        update_data['updated_at'] = datetime.now().isoformat()
        
        result = db.users.update_one(
            {'username': current_user},
            {'$set': update_data}
        )
        
        if result.modified_count > 0:
            return jsonify({'message': 'Profile updated successfully'}), 200
    
    return jsonify({'message': 'No changes made'}), 200

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    current_user = get_jwt_identity()
    data = request.json
    
    if not data.get('current_password') or not data.get('new_password'):
        return jsonify({'error': 'Current password and new password required'}), 400
    
    db = mongo_db.db
    if db is None:
        return jsonify({'error': 'Database unavailable. Start MongoDB to change password.'}), 503
    user = db.users.find_one({'username': current_user})
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Verify current password
    if not bcrypt.checkpw(data['current_password'].encode('utf-8'), user['password']):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    # Validate new password
    is_valid, message = validate_password(data['new_password'])
    if not is_valid:
        return jsonify({'error': message}), 400
    
    # Hash new password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(data['new_password'].encode('utf-8'), salt)
    
    # Update password
    db.users.update_one(
        {'username': current_user},
        {'$set': {'password': hashed_password, 'password_changed_at': datetime.now().isoformat()}}
    )
    
    return jsonify({'message': 'Password changed successfully'}), 200

@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    """Get all users (admin only)"""
    current_user = get_jwt_identity()
    
    db = mongo_db.db
    if db is None:
        return jsonify({'error': 'Database unavailable. Start MongoDB to list users.'}), 503
    user = db.users.find_one({'username': current_user})
    
    # Check if admin
    if user.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    users = list(db.users.find({}, {'password': 0, '_id': 0}))
    return jsonify(users), 200
