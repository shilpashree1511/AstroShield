"""
Debris API Routes
Handles CRUD operations for space debris data
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from database.mongo_db import mongo_db
from models.debris import Debris
from datetime import datetime
import random

debris_bp = Blueprint('debris', __name__)

DEMO_DEBRIS = [
    {'debris_id': 'DEBRIS-001', 'size': 'large', 'mass': 500, 'velocity': 7.8, 'risk_level': 'HIGH', 'orbit_radius': 6900},
    {'debris_id': 'DEBRIS-002', 'size': 'medium', 'mass': 10, 'velocity': 7.5, 'risk_level': 'MEDIUM', 'orbit_radius': 7100},
    {'debris_id': 'DEBRIS-003', 'size': 'small', 'mass': 0.1, 'velocity': 7.6, 'risk_level': 'LOW', 'orbit_radius': 7000},
    {'debris_id': 'DEBRIS-004', 'size': 'medium', 'mass': 22, 'velocity': 7.2, 'risk_level': 'HIGH', 'orbit_radius': 6840},
    {'debris_id': 'DEBRIS-005', 'size': 'small', 'mass': 0.4, 'velocity': 8.1, 'risk_level': 'MEDIUM', 'orbit_radius': 7350},
]

def debris_statistics(debris_list):
    """Calculate debris statistics from a debris list."""
    if not debris_list:
        return {
            'total_debris': 0,
            'by_size': {'small': 0, 'medium': 0, 'large': 0},
            'by_risk': {'HIGH': 0, 'MEDIUM': 0, 'LOW': 0},
            'average_velocity': 0,
            'total_mass': 0,
            'most_congested_orbit': 'N/A'
        }

    by_size = {'small': 0, 'medium': 0, 'large': 0}
    by_risk = {'HIGH': 0, 'MEDIUM': 0, 'LOW': 0}
    total_velocity = 0
    total_mass = 0
    orbit_counts = {}

    for debris in debris_list:
        size = debris.get('size', 'medium')
        by_size[size] = by_size.get(size, 0) + 1
        risk = debris.get('risk_level', 'LOW')
        by_risk[risk] = by_risk.get(risk, 0) + 1
        total_velocity += debris.get('velocity', 0)
        total_mass += debris.get('mass', 0)
        orbit_radius = debris.get('orbit_radius', 0)
        orbit_range = f"{int(orbit_radius/1000)*1000}-{int(orbit_radius/1000)*1000+999}"
        orbit_counts[orbit_range] = orbit_counts.get(orbit_range, 0) + 1

    return {
        'total_debris': len(debris_list),
        'by_size': by_size,
        'by_risk': by_risk,
        'average_velocity': round(total_velocity / len(debris_list), 2),
        'total_mass': round(total_mass, 2),
        'most_congested_orbit': max(orbit_counts.items(), key=lambda x: x[1])[0] if orbit_counts else 'N/A'
    }

@debris_bp.route('/', methods=['GET'])
def get_all_debris():
    """Get all space debris from database"""
    db = mongo_db.db
    if db is None:
        return jsonify(DEMO_DEBRIS)
    
    debris_list = list(db.debris.find({}, {'_id': 0}))
    return jsonify(debris_list)

@debris_bp.route('/<debris_id>', methods=['GET'])
def get_debris(debris_id):
    """Get specific debris by ID"""
    db = mongo_db.db
    if db is None:
        debris = next((d for d in DEMO_DEBRIS if d['debris_id'] == debris_id), None)
        if debris:
            return jsonify(debris)
        return jsonify({'error': 'Debris not found'}), 404

    debris = db.debris.find_one({'debris_id': debris_id}, {'_id': 0})
    
    if debris:
        return jsonify(debris)
    return jsonify({'error': 'Debris not found'}), 404

@debris_bp.route('/statistics', methods=['GET'])
def get_debris_statistics():
    """Get debris statistics and analytics"""
    db = mongo_db.db
    if db is None:
        return jsonify(debris_statistics(DEMO_DEBRIS))

    debris_list = list(db.debris.find({}, {'_id': 0}))
    
    if not debris_list:
        return jsonify(debris_statistics(DEMO_DEBRIS))

    return jsonify(debris_statistics(debris_list))

@debris_bp.route('/risky', methods=['GET'])
def get_risky_debris():
    """Get debris with HIGH risk level"""
    db = mongo_db.db
    if db is None:
        return jsonify([d for d in DEMO_DEBRIS if d.get('risk_level') == 'HIGH'])

    risky_debris = list(db.debris.find(
        {'risk_level': 'HIGH'},
        {'_id': 0}
    ))
    return jsonify(risky_debris)

@debris_bp.route('/', methods=['POST'])
@jwt_required()
def add_debris():
    """Add new debris object (requires authentication)"""
    data = request.json
    db = mongo_db.db
    if db is None:
        return jsonify({'error': 'Database unavailable. Start MongoDB to add debris.'}), 503
    
    # Validate required fields
    required_fields = ['size', 'orbit_radius']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Create debris object
    debris = Debris(
        size=data['size'],
        velocity=data.get('velocity', random.uniform(6, 8)),
        orbit_radius=data['orbit_radius'],
        inclination=data.get('inclination', random.uniform(0, 180))
    )
    
    # Store in database
    result = db.debris.insert_one(debris.to_dict())
    
    return jsonify({
        'message': 'Debris added successfully',
        'debris_id': debris.debris_id
    }), 201

@debris_bp.route('/simulate', methods=['POST'])
@jwt_required()
def simulate_debris_generation():
    """Simulate generation of new debris (e.g., from satellite breakup)"""
    data = request.json
    parent_satellite = data.get('satellite_name', 'Unknown')
    pieces = data.get('pieces', 10)
    
    generated_debris = []
    db = mongo_db.db
    if db is None:
        return jsonify({'error': 'Database unavailable. Start MongoDB to simulate debris generation.'}), 503
    
    for i in range(pieces):
        # Generate debris with varying properties
        size = random.choices(['small', 'medium', 'large'], weights=[0.7, 0.2, 0.1])[0]
        debris = Debris(
            size=size,
            velocity=random.uniform(6.5, 8.5),
            orbit_radius=random.uniform(6800, 43000),
            inclination=random.uniform(0, 180)
        )
        
        # Add metadata
        debris_dict = debris.to_dict()
        debris_dict['parent_satellite'] = parent_satellite
        debris_dict['generation_time'] = datetime.now().isoformat()
        
        db.debris.insert_one(debris_dict)
        generated_debris.append(debris_dict)
    
    return jsonify({
        'message': f'Generated {pieces} debris pieces from {parent_satellite}',
        'debris': generated_debris
    }), 201
