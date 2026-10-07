"""
Main Flask Application Entry Point
Space Traffic Management System Backend API
"""

from flask import Flask, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Initialize Flask app
app = Flask(__name__)
app.url_map.strict_slashes = False

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# Initialize extensions
CORS(app, resources={r"/api/*": {"origins": "*"}})
jwt = JWTManager(app)

# Import routes
from routes.satellites import satellites_bp
from routes.debris import debris_bp
from routes.alerts import alerts_bp
from routes.auth import auth_bp
from routes.ai import ai_bp
from routes.external import external_bp
from routes.reports import reports_bp
from routes.realtime import realtime_bp

# Register blueprints
app.register_blueprint(satellites_bp, url_prefix='/api/satellites')
app.register_blueprint(debris_bp, url_prefix='/api/debris')
app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(ai_bp, url_prefix='/api/ai')
app.register_blueprint(external_bp, url_prefix='/api/external')
app.register_blueprint(reports_bp, url_prefix='/api/reports')
app.register_blueprint(realtime_bp, url_prefix='/api/realtime')

# Initialize database connection
from database.mongo_db import init_db
init_db(app)

# Initialize simulation engine
from services.simulation_engine import SimulationEngine
simulation_engine = SimulationEngine()
app.config['simulation_engine'] = simulation_engine

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return {'status': 'healthy', 'message': 'Space Traffic Management System API is running'}

@app.route('/api/simulation/start', methods=['POST'])
def start_simulation():
    """Start the orbit simulation"""
    simulation_engine.start()
    return {'status': 'started', 'message': 'Simulation is now running'}

@app.route('/api/simulation/stop', methods=['POST'])
def stop_simulation():
    """Stop the orbit simulation"""
    simulation_engine.stop()
    return {'status': 'stopped', 'message': 'Simulation has been stopped'}

@app.route('/api/simulation/state', methods=['GET'])
def get_simulation_state():
    """Get current simulation state"""
    state = simulation_engine.get_current_state()
    return state

@app.route('/api/simulation/speed', methods=['POST'])
def set_simulation_speed():
    """Set simulation speed multiplier"""
    payload = request.get_json(silent=True) or {}
    speed = payload.get('speed', 1.0)
    try:
        speed = float(speed)
    except (TypeError, ValueError):
        return {'error': 'Speed must be a number'}, 400

    speed = max(0.1, min(speed, 100.0))
    simulation_engine.time_scale = speed
    return {'status': 'updated', 'speed': speed}

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
