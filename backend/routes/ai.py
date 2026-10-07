"""
AI prediction API routes.
Exposes the simulation engine's collision prediction data to the frontend.
"""

from flask import Blueprint, current_app, jsonify

ai_bp = Blueprint('ai', __name__)


def get_engine():
    return current_app.config.get('simulation_engine')


def risk_level(probability):
    if probability > 0.7:
        return 'HIGH'
    if probability > 0.3:
        return 'MEDIUM'
    return 'LOW'


def recommendation(probability):
    if probability > 0.8:
        return 'IMMEDIATE ACTION REQUIRED: Execute collision avoidance maneuver.'
    if probability > 0.6:
        return 'HIGH RISK: Prepare for possible maneuver and monitor closely.'
    if probability > 0.3:
        return 'MEDIUM RISK: Continue monitoring this conjunction.'
    return 'LOW RISK: Routine monitoring only.'


@ai_bp.route('/predictions', methods=['GET'])
def get_predictions():
    """Return collision predictions for current satellite pairs."""
    engine = get_engine()
    if not engine:
        return jsonify({'error': 'Simulation engine unavailable'}), 503

    predictions = []
    satellites = engine.satellites
    detector = engine.collision_detector
    predictor = engine.ai_predictor

    for index, sat1 in enumerate(satellites):
        for sat2 in satellites[index + 1:]:
            model_result = predictor.predict_collision_probability(sat1, sat2)
            probability = model_result['probability']
            distance = detector.calculate_distance(sat1, sat2)
            predictions.append({
                'id': f'{sat1.satellite_id}_{sat2.satellite_id}',
                'satellite1': sat1.name,
                'satellite2': sat2.name,
                'probability': probability,
                'riskLevel': model_result.get('risk_level', risk_level(probability)),
                'distance': distance,
                'relativeSpeed': abs(sat1.speed - sat2.speed),
                'timeToCollision': 300 if probability > 0.5 else None,
                'recommendation': recommendation(probability),
                'randomForest': model_result.get('random_forest_prediction'),
                'logisticRegression': model_result.get('logistic_regression_prediction')
            })

    predictions.sort(key=lambda item: item['probability'], reverse=True)
    return jsonify({'predictions': predictions[:20]})


@ai_bp.route('/metrics', methods=['GET'])
def get_metrics():
    """Return demo model metrics for the trained local models."""
    return jsonify({
        'accuracy': 0.943,
        'precision': 0.921,
        'recall': 0.937,
        'false_positive_rate': 0.023,
        'models': [
            {'name': 'Random Forest', 'weight': 0.6, 'accuracy': 0.958},
            {'name': 'Logistic Regression', 'weight': 0.4, 'accuracy': 0.929}
        ]
    })


@ai_bp.route('/features', methods=['GET'])
def get_features():
    """Return feature importance values used by the AI page."""
    return jsonify({
        'features': [
            {'name': 'Distance', 'importance': 0.42},
            {'name': 'Relative Speed', 'importance': 0.18},
            {'name': 'Orbit Angle', 'importance': 0.15},
            {'name': 'Altitude Diff', 'importance': 0.12},
            {'name': 'Direction', 'importance': 0.08},
            {'name': 'Orbit Radius', 'importance': 0.05}
        ]
    })


@ai_bp.route('/retrain', methods=['POST'])
def retrain_models():
    """Retrain the in-memory models using synthetic training data."""
    engine = get_engine()
    if not engine:
        return jsonify({'error': 'Simulation engine unavailable'}), 503

    engine.ai_predictor.train_models()
    return jsonify({'message': 'AI models retrained successfully'})
