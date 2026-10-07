"""
Simulation Engine
Manages the orbital simulation of satellites and debris
Handles real-time position updates and collision detection
"""

import threading
import time
import math
import random
import os
from datetime import datetime
from models.satellite import Satellite
from models.debris import Debris
from services.collision_detector import CollisionDetector
try:
    from services.ai_predictor import AIPredictor
except Exception:
    AIPredictor = None
from database.mongo_db import mongo_db

class SimulationEngine:
    """Main simulation engine for space traffic management"""
    
    def __init__(self):
        """Initialize simulation engine with default parameters"""
        self.satellites = []
        self.debris = []
        self.alerts = []
        self.is_running = False
        self.simulation_thread = None
        self.collision_detector = CollisionDetector()
        model_path = os.path.join(os.path.dirname(__file__), '..', 'ml-model', 'collision_predictor.pkl')
        if AIPredictor is not None:
            self.ai_predictor = AIPredictor(os.path.normpath(model_path))
        else:
            self.ai_predictor = None
            print("AI predictor unavailable; using heuristic fallback values.")
        self.time_scale = 1.0  # Simulation time multiplier
        self.delta_time = 1.0  # Update interval in seconds
        
        # Initialize default satellites
        self._initialize_default_satellites()
        self._initialize_default_debris()
        
    def _initialize_default_satellites(self):
        """Create default satellites for demonstration"""
        # Create 12 satellites with different orbits
        satellite_configs = [
            # Low Earth Orbit satellites
            {'name': 'ISS', 'orbit_radius': 6771, 'speed': 7.66, 'altitude': 408, 'inclination': 51.6},
            {'name': 'HST', 'orbit_radius': 6990, 'speed': 7.55, 'altitude': 547, 'inclination': 28.5},
            {'name': 'Terra', 'orbit_radius': 7078, 'speed': 7.52, 'altitude': 705, 'inclination': 98.2},
            {'name': 'Aqua', 'orbit_radius': 7078, 'speed': 7.52, 'altitude': 705, 'inclination': 98.2},
            {'name': 'Aura', 'orbit_radius': 7078, 'speed': 7.52, 'altitude': 705, 'inclination': 98.2},
            
            # Medium Earth Orbit satellites
            {'name': 'GPS-1', 'orbit_radius': 26560, 'speed': 3.87, 'altitude': 20200, 'inclination': 55},
            {'name': 'GPS-2', 'orbit_radius': 26560, 'speed': 3.87, 'altitude': 20200, 'inclination': 55},
            {'name': 'GLONASS', 'orbit_radius': 25510, 'speed': 3.95, 'altitude': 19100, 'inclination': 64.8},
            
            # Geostationary satellites
            {'name': 'GOES-16', 'orbit_radius': 42164, 'speed': 3.07, 'altitude': 35786, 'inclination': 0},
            {'name': 'GOES-17', 'orbit_radius': 42164, 'speed': 3.07, 'altitude': 35786, 'inclination': 0},
            {'name': 'Meteosat', 'orbit_radius': 42164, 'speed': 3.07, 'altitude': 35786, 'inclination': 0},
            {'name': 'Starlink-1', 'orbit_radius': 6900, 'speed': 7.58, 'altitude': 550, 'inclination': 53}
        ]
        
        for config in satellite_configs:
            satellite = Satellite(
                name=config['name'],
                orbit_radius=config['orbit_radius'],
                speed=config['speed'],
                altitude=config['altitude'],
                inclination=config['inclination'],
                longitude=random.uniform(0, 360)
            )
            self.satellites.append(satellite)
    
    def _initialize_default_debris(self):
        """Create default space debris objects"""
        debris_configs = [
            {'size': 'small', 'velocity': 7.5, 'risk': 'low'},
            {'size': 'medium', 'velocity': 7.8, 'risk': 'medium'},
            {'size': 'large', 'velocity': 8.0, 'risk': 'high'},
            {'size': 'small', 'velocity': 7.6, 'risk': 'low'},
            {'size': 'medium', 'velocity': 7.9, 'risk': 'medium'}
        ]
        
        for i, config in enumerate(debris_configs):
            debris = Debris(
                debris_id=f"DEBRIS-{i+1}",
                size=config['size'],
                velocity=config['velocity'],
                orbit_radius=random.uniform(6800, 43000),
                inclination=random.uniform(0, 180)
            )
            self.debris.append(debris)
    
    def start(self):
        """Start the simulation thread"""
        if not self.is_running:
            self.is_running = True
            self.simulation_thread = threading.Thread(target=self._simulation_loop, daemon=True)
            self.simulation_thread.start()
            print("Simulation started")
    
    def stop(self):
        """Stop the simulation"""
        self.is_running = False
        if self.simulation_thread:
            self.simulation_thread.join(timeout=2)
        print("Simulation stopped")
    
    def _simulation_loop(self):
        """Main simulation loop - runs in separate thread"""
        last_update = time.time()
        
        while self.is_running:
            current_time = time.time()
            delta = min((current_time - last_update) * self.time_scale, 0.1)  # Cap delta time
            last_update = current_time
            
            # Update all objects
            self._update_satellites(delta)
            self._update_debris(delta)
            
            # Check for collisions
            self._check_collisions()
            
            # Generate AI predictions
            self._generate_predictions()
            
            # Store data periodically
            if int(current_time) % 10 == 0:
                self._store_simulation_data()
            
            # Control simulation speed
            time.sleep(0.016)  # ~60 FPS
    
    def _update_satellites(self, delta_time):
        """Update positions of all satellites"""
        for satellite in self.satellites:
            satellite.update_position(delta_time)
    
    def _update_debris(self, delta_time):
        """Update positions of all debris"""
        for debris in self.debris:
            debris.update_position(delta_time)
    
    def _check_collisions(self):
        """Check for collisions between satellites and debris"""
        # Check satellite-satellite collisions
        for i, sat1 in enumerate(self.satellites):
            for sat2 in self.satellites[i+1:]:
                risk = self.collision_detector.calculate_collision_risk(sat1, sat2)
                if risk > 0.5:  # High risk threshold
                    self._create_alert(sat1, sat2, risk)
        
        # Check satellite-debris collisions
        for satellite in self.satellites:
            for debris in self.debris:
                risk = self.collision_detector.check_debris_collision(satellite, debris)
                if risk > 0.5:
                    self._create_alert(satellite, debris, risk)
    
    def _create_alert(self, object1, object2, risk):
        """Create a collision alert"""
        alert = {
            'timestamp': datetime.now().isoformat(),
            'object1': object1.name if hasattr(object1, 'name') else object1.debris_id,
            'object2': object2.name if hasattr(object2, 'name') else object2.debris_id,
            'risk_level': 'HIGH' if risk > 0.7 else 'MEDIUM',
            'risk_probability': risk,
            'distance': self.collision_detector.calculate_distance(object1, object2),
            'recommendation': self._generate_recommendation(object1, object2, risk)
        }
        
        # Store alert in database
        db = mongo_db.db
        if db is not None:
            db.alerts.insert_one(alert)
        
        self.alerts.append(alert)
        
        # Keep only last 100 alerts
        if len(self.alerts) > 100:
            self.alerts = self.alerts[-100:]
    
    def _generate_recommendation(self, object1, object2, risk):
        """Generate collision avoidance recommendation"""
        if risk > 0.8:
            return f"CRITICAL: Immediate orbit adjustment required for {object1.name if hasattr(object1, 'name') else object1.debris_id}. Recommend 5% speed reduction."
        elif risk > 0.6:
            return f"WARNING: Close approach detected. Recommend altering trajectory by 2 degrees."
        else:
            return f"MONITOR: Continue observation. No immediate action required."
    
    def _generate_predictions(self):
        """Generate AI-based collision predictions"""
        if self.ai_predictor is None:
            return

        predictions = self.ai_predictor.predict_collisions(self.satellites)
        for sat_id, risk in predictions.items():
            for satellite in self.satellites:
                if satellite.satellite_id == sat_id:
                    satellite.collision_risk = risk
    
    def _store_simulation_data(self):
        """Store simulation data to database"""
        db = mongo_db.db
        if db is None:
            return
        
        # Store satellite positions
        for satellite in self.satellites:
            db.satellites.update_one(
                {'satellite_id': satellite.satellite_id},
                {'$set': satellite.to_dict()},
                upsert=True
            )
        
        # Store debris positions
        for debris in self.debris:
            db.debris.update_one(
                {'debris_id': debris.debris_id},
                {'$set': debris.to_dict()},
                upsert=True
            )
    
    def get_current_state(self):
        """Get current simulation state for frontend"""
        return {
            'satellites': [sat.to_dict() for sat in self.satellites],
            'debris': [deb.to_dict() for deb in self.debris],
            'alerts': self.alerts[-20:],  # Last 20 alerts
            'stats': {
                'total_satellites': len(self.satellites),
                'total_debris': len(self.debris),
                'active_alerts': len([a for a in self.alerts if 'timestamp' in a]),
                'simulation_time': datetime.now().isoformat()
            }
        }
