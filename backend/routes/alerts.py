"""
Alerts API Routes
Manages collision alerts and notifications
"""

from flask import Blueprint, request, jsonify
from database.mongo_db import mongo_db
from datetime import datetime, timedelta

alerts_bp = Blueprint('alerts', __name__)

def demo_alerts():
    """Small set of recent alerts for local demo mode."""
    now = datetime.now()
    return [
        {
            'alert_id': 'demo-alert-1',
            'timestamp': (now - timedelta(minutes=8)).isoformat(),
            'object1': 'ISS',
            'object2': 'Debris-LEO-042',
            'risk_level': 'MEDIUM',
            'probability': 0.34,
            'message': 'Potential conjunction detected in low Earth orbit'
        },
        {
            'alert_id': 'demo-alert-2',
            'timestamp': (now - timedelta(minutes=26)).isoformat(),
            'object1': 'GPS-1',
            'object2': 'Debris-MEO-117',
            'risk_level': 'LOW',
            'probability': 0.12,
            'message': 'Object passing within monitoring threshold'
        }
    ]

@alerts_bp.route('/', methods=['GET'])
def get_alerts():
    """Get all collision alerts"""
    db = mongo_db.db
    limit = request.args.get('limit', 50, type=int)
    if db is None:
        return jsonify(demo_alerts()[:limit])
    
    alerts = list(db.alerts.find({}, {'_id': 0}).sort('timestamp', -1).limit(limit))
    return jsonify(alerts)

@alerts_bp.route('/active', methods=['GET'])
def get_active_alerts():
    """Get active (recent) alerts from last hour"""
    db = mongo_db.db
    if db is None:
        return jsonify(demo_alerts())

    one_hour_ago = (datetime.now() - timedelta(hours=1)).isoformat()
    
    alerts = list(db.alerts.find(
        {'timestamp': {'$gte': one_hour_ago}},
        {'_id': 0}
    ).sort('timestamp', -1))
    
    return jsonify(alerts)

@alerts_bp.route('/statistics', methods=['GET'])
def get_alert_statistics():
    """Get alert statistics and trends"""
    db = mongo_db.db
    if db is None:
        recent_alerts = demo_alerts()
        return jsonify({
            'total_alerts_24h': len(recent_alerts),
            'high_risk_alerts': len([a for a in recent_alerts if a.get('risk_level') == 'HIGH']),
            'medium_risk_alerts': len([a for a in recent_alerts if a.get('risk_level') == 'MEDIUM']),
            'most_risky_object': recent_alerts[0]['object1'],
            'alert_frequency_per_hour': round(len(recent_alerts) / 24, 2)
        })

    last_24h = (datetime.now() - timedelta(hours=24)).isoformat()
    
    # Get alerts from last 24 hours
    recent_alerts = list(db.alerts.find({'timestamp': {'$gte': last_24h}}))
    
    statistics = {
        'total_alerts_24h': len(recent_alerts),
        'high_risk_alerts': len([a for a in recent_alerts if a.get('risk_level') == 'HIGH']),
        'medium_risk_alerts': len([a for a in recent_alerts if a.get('risk_level') == 'MEDIUM']),
        'most_risky_object': None,
        'alert_frequency_per_hour': len(recent_alerts) / 24 if recent_alerts else 0
    }
    
    # Find most risky object
    if recent_alerts:
        object_counts = {}
        for alert in recent_alerts:
            obj = alert.get('object1', '')
            object_counts[obj] = object_counts.get(obj, 0) + 1
        if object_counts:
            statistics['most_risky_object'] = max(object_counts, key=object_counts.get)
    
    return jsonify(statistics)

@alerts_bp.route('/clear', methods=['POST'])
def clear_alerts():
    """Clear old alerts (optional admin function)"""
    db = mongo_db.db
    if db is None:
        return jsonify({'message': 'Demo mode has no persisted alerts to clear', 'deleted_count': 0})

    older_than = (request.json or {}).get('older_than_hours', 24)
    
    cutoff_time = (datetime.now() - timedelta(hours=older_than)).isoformat()
    result = db.alerts.delete_many({'timestamp': {'$lt': cutoff_time}})
    
    return jsonify({
        'message': f'Cleared {result.deleted_count} alerts',
        'deleted_count': result.deleted_count
    })
