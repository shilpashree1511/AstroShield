"""
External space-data API routes.
"""

from flask import Blueprint, jsonify, request
from services.api_integration import APIIntegration

external_bp = Blueprint('external', __name__)
api_integration = APIIntegration()


@external_bp.route('/tle/<satellite_id>', methods=['GET'])
def get_tle_data(satellite_id):
    tle = api_integration.get_tle_data(satellite_id)
    if not tle:
        return jsonify({'error': 'TLE data unavailable for this satellite'}), 404
    return jsonify(tle)


@external_bp.route('/positions/<satellite_id>', methods=['GET'])
def get_satellite_positions(satellite_id):
    lat = request.args.get('lat', request.args.get('observer_lat', 0), type=float)
    lng = request.args.get('lng', request.args.get('observer_lng', 0), type=float)
    alt = request.args.get('alt', request.args.get('observer_alt', 0), type=float)
    return jsonify(api_integration.get_satellite_positions(satellite_id, lat, lng, alt))


@external_bp.route('/neo', methods=['GET'])
def get_near_earth_objects():
    return jsonify(api_integration.get_near_earth_objects(
        request.args.get('start_date'),
        request.args.get('end_date')
    ))


@external_bp.route('/constellation/<constellation_name>', methods=['GET'])
def get_constellation_data(constellation_name):
    return jsonify({
        'constellation': constellation_name,
        'satellites': api_integration.get_constellation_data(constellation_name)
    })


@external_bp.route('/satellites', methods=['GET'])
def get_active_satellites():
    return jsonify({
        'source': 'CelesTrak',
        'satellites': api_integration.get_active_satellites(request.args.get('limit', 12, type=int))
    })


@external_bp.route('/cache', methods=['GET'])
def get_cache_stats():
    return jsonify(api_integration.get_cache_stats())


@external_bp.route('/cache/clear', methods=['POST'])
def clear_cache():
    return jsonify(api_integration.clear_cache())
