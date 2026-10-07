"""
Satellites API Routes
Handles CRUD operations for satellite data
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.mongo_db import mongo_db
from services.api_integration import APIIntegration
import math
import uuid

satellites_bp = Blueprint('satellites', __name__)
api_integration = APIIntegration()

DEMO_SATELLITES = [
    {'satellite_id': 'SAT-101', 'name': 'Aurora Watch', 'altitude': 520, 'orbit_radius': 7210, 'speed': 7.1, 'collision_risk': 0.12, 'color': '#29d8ff', 'inclination': 21},
    {'satellite_id': 'SAT-202', 'name': 'Orbit Link', 'altitude': 780, 'orbit_radius': 8420, 'speed': 1.18, 'collision_risk': 0.08, 'color': '#b45cff', 'inclination': 47},
    {'satellite_id': 'SAT-303', 'name': 'Geo Shield', 'altitude': 1200, 'orbit_radius': 9820, 'speed': 0.84, 'collision_risk': 0.21, 'color': '#42b8ff', 'inclination': 62},
    {'satellite_id': 'SAT-404', 'name': 'Sentinel Relay', 'altitude': 35786, 'orbit_radius': 45239, 'speed': 3.07, 'collision_risk': 0.05, 'color': '#ff3d5a', 'inclination': 5},
]

def build_analytics(satellites):
    """Build satellite analytics from a satellite list."""
    return {
        'total_satellites': len(satellites),
        'low_earth_orbit': len([s for s in satellites if s.get('altitude', 0) < 2000]),
        'medium_earth_orbit': len([s for s in satellites if 2000 <= s.get('altitude', 0) < 35786]),
        'geostationary': len([s for s in satellites if s.get('altitude', 0) >= 35786]),
        'average_speed': sum(s.get('speed', 0) for s in satellites) / len(satellites),
        'satellites_at_risk': len([s for s in satellites if s.get('collision_risk', 0) > 0.5])
    }

@satellites_bp.route('/', methods=['GET'])
def get_all_satellites():
    """Get all satellites from database"""
    if request.args.get('source') == 'external':
        satellites = api_integration.get_active_satellites(request.args.get('limit', 12, type=int))
        if satellites:
            return jsonify(satellites)

    db = mongo_db.db
    if db is None:
        return jsonify(DEMO_SATELLITES)
    
    satellites = list(db.satellites.find({}, {'_id': 0}))
    if not satellites:
        return jsonify(DEMO_SATELLITES)
    return jsonify(satellites)

@satellites_bp.route('/<satellite_id>', methods=['GET'])
def get_satellite(satellite_id):
    """Get specific satellite by ID"""
    db = mongo_db.db
    if db is None:
        satellite = next((s for s in DEMO_SATELLITES if s['satellite_id'] == satellite_id), None)
        if satellite:
            return jsonify(satellite)
        return jsonify({'error': 'Satellite not found'}), 404

    satellite = db.satellites.find_one({'satellite_id': satellite_id}, {'_id': 0})
    if not satellite:
        satellite = next((s for s in DEMO_SATELLITES if s['satellite_id'] == satellite_id), None)
    
    if satellite:
        return jsonify(satellite)
    return jsonify({'error': 'Satellite not found'}), 404

@satellites_bp.route('/analytics', methods=['GET'])
def get_satellite_analytics():
    """Get satellite analytics and statistics"""
    db = mongo_db.db
    if db is None:
        return jsonify(build_analytics(DEMO_SATELLITES))

    satellites = list(db.satellites.find({}, {'_id': 0}))
    
    if not satellites:
        return jsonify(build_analytics(DEMO_SATELLITES))
    
    return jsonify(build_analytics(satellites))

@satellites_bp.route('/', methods=['POST'])
@jwt_required()
def create_satellite():
    """Create a new satellite (requires authentication)"""
    data = request.json
    db = mongo_db.db
    if db is None:
        return jsonify({'error': 'Database unavailable. Start MongoDB to create satellites.'}), 503
    
    # Validate required fields
    required_fields = ['name', 'orbit_radius', 'speed']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Check if satellite already exists
    existing = db.satellites.find_one({'name': data['name']})
    if existing:
        return jsonify({'error': 'Satellite with this name already exists'}), 409

    data.setdefault('satellite_id', f"SAT-{uuid.uuid4().hex[:8].upper()}")
    
    # Insert new satellite
    result = db.satellites.insert_one(data)
    
    return jsonify({
        'message': 'Satellite created successfully',
        'satellite_id': str(result.inserted_id)
    }), 201

@satellites_bp.route('/<satellite_id>', methods=['PUT'])
@jwt_required()
def update_satellite(satellite_id):
    """Update a satellite by ID."""
    db = mongo_db.db
    if db is None:
        return jsonify({'error': 'Database unavailable. Start MongoDB to update satellites.'}), 503

    data = request.json or {}
    result = db.satellites.update_one({'satellite_id': satellite_id}, {'$set': data})
    if result.matched_count == 0:
        return jsonify({'error': 'Satellite not found'}), 404
    return jsonify({'message': 'Satellite updated successfully'})

@satellites_bp.route('/<satellite_id>', methods=['DELETE'])
@jwt_required()
def delete_satellite(satellite_id):
    """Delete a satellite by ID."""
    db = mongo_db.db
    if db is None:
        return jsonify({'error': 'Database unavailable. Start MongoDB to delete satellites.'}), 503

    result = db.satellites.delete_one({'satellite_id': satellite_id})
    if result.deleted_count == 0:
        return jsonify({'error': 'Satellite not found'}), 404
    return jsonify({'message': 'Satellite deleted successfully'})

@satellites_bp.route('/<satellite_id>/trajectory', methods=['GET'])
def get_satellite_trajectory(satellite_id):
    """Return a simple predicted trajectory for a satellite."""
    duration = request.args.get('duration', 3600, type=int)
    db = mongo_db.db
    if db is None:
        satellite = next((s for s in DEMO_SATELLITES if s['satellite_id'] == satellite_id), None)
    else:
        satellite = db.satellites.find_one({'satellite_id': satellite_id}, {'_id': 0})
        if not satellite:
            satellite = next((s for s in DEMO_SATELLITES if s['satellite_id'] == satellite_id), None)

    if not satellite:
        return jsonify({'error': 'Satellite not found'}), 404

    orbit_radius = satellite.get('orbit_radius', 7000)
    speed = satellite.get('speed', 7.5)
    points = []
    for step in range(0, max(duration, 1), max(int(duration / 24), 1)):
        theta = (speed / orbit_radius) * step
        points.append({
            'time_offset_seconds': step,
            'x': orbit_radius * math.cos(theta),
            'y': orbit_radius * math.sin(theta),
            'z': orbit_radius * 0.05
        })

    return jsonify({'satellite_id': satellite_id, 'duration': duration, 'trajectory': points})
