"""
Space Debris Model Class
Represents orbital debris objects in the space traffic management system
"""

import math
import uuid
from datetime import datetime

class Debris:
    """Debris class representing space junk and fragments"""
    
    def __init__(self, debris_id=None, size='medium', velocity=7.5, 
                 orbit_radius=7000, inclination=0, longitude=0):
        """
        Initialize a new debris object
        
        Parameters:
        - debris_id: Unique identifier
        - size: Size category (small, medium, large)
        - velocity: Orbital velocity (km/s)
        - orbit_radius: Distance from Earth center (km)
        - inclination: Orbit inclination (degrees)
        - longitude: Initial longitude position (degrees)
        """
        self.debris_id = debris_id or f"DEBRIS-{str(uuid.uuid4())[:6]}"
        self.size = size  # small, medium, large
        self.velocity = velocity  # km/s
        self.orbit_radius = orbit_radius  # km
        self.inclination = inclination  # degrees
        self.longitude = longitude  # degrees
        self.theta = math.radians(longitude)
        
        # Size-based properties
        self.mass = self._calculate_mass()
        self.risk_multiplier = self._calculate_risk_multiplier()
        
        # Position in 3D space
        self.x = orbit_radius * math.cos(self.theta) * math.cos(math.radians(inclination))
        self.y = orbit_radius * math.sin(self.theta) * math.cos(math.radians(inclination))
        self.z = orbit_radius * math.sin(math.radians(inclination))
        
        # Tracking
        self.trail = []
        self.max_trail_length = 30
        self.detection_time = datetime.now()
        
    def _calculate_mass(self):
        """Calculate approximate mass based on size"""
        masses = {
            'small': 0.1,    # 100 grams
            'medium': 10.0,   # 10 kg
            'large': 500.0    # 500 kg
        }
        return masses.get(self.size, 1.0)
    
    def _calculate_risk_multiplier(self):
        """Calculate risk multiplier based on size"""
        multipliers = {
            'small': 1.0,
            'medium': 2.0,
            'large': 5.0
        }
        return multipliers.get(self.size, 1.0)
    
    def update_position(self, delta_time=1.0):
        """
        Update debris position based on orbital mechanics
        
        Parameters:
        - delta_time: Time elapsed since last update (seconds)
        """
        # Update angle based on orbital velocity
        angle_change = (self.velocity / self.orbit_radius) * delta_time
        self.theta += angle_change
        
        # Keep theta within 0 to 2π
        self.theta = self.theta % (2 * math.pi)
        
        # Calculate new 3D position
        self.x = self.orbit_radius * math.cos(self.theta) * math.cos(math.radians(self.inclination))
        self.y = self.orbit_radius * math.sin(self.theta) * math.cos(math.radians(self.inclination))
        self.z = self.orbit_radius * math.sin(math.radians(self.inclination))
        
        # Update trail
        self.trail.append((self.x, self.y, self.z))
        if len(self.trail) > self.max_trail_length:
            self.trail.pop(0)
    
    def get_position(self):
        """Get current 3D position"""
        return {
            'x': self.x,
            'y': self.y,
            'z': self.z,
            'longitude': math.degrees(self.theta),
            'latitude': math.degrees(math.asin(self.z / self.orbit_radius)) if self.orbit_radius != 0 else 0
        }
    
    def get_risk_level(self):
        """Calculate current risk level based on position and size"""
        # Higher risk for larger debris and lower orbits
        altitude_risk = max(0, 1 - (self.orbit_radius - 6371) / 2000)
        size_risk = self.risk_multiplier / 5
        
        total_risk = (altitude_risk * 0.6 + size_risk * 0.4)
        
        if total_risk > 0.7:
            return 'HIGH'
        elif total_risk > 0.3:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def to_dict(self):
        """Convert debris to dictionary for JSON serialization"""
        return {
            'debris_id': self.debris_id,
            'size': self.size,
            'mass': self.mass,
            'velocity': self.velocity,
            'orbit_radius': self.orbit_radius,
            'inclination': self.inclination,
            'position': self.get_position(),
            'trail': self.trail,
            'risk_level': self.get_risk_level(),
            'detection_time': self.detection_time.isoformat()
        }