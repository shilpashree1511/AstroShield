"""
Satellite Model Class
Represents a satellite in the space traffic management system
"""

import math
import uuid
from datetime import datetime

class Satellite:
    """Satellite class representing orbital objects"""
    
    def __init__(self, satellite_id=None, name=None, orbit_radius=7000, 
                 speed=7.8, inclination=0, longitude=0, altitude=500):
        """
        Initialize a new satellite
        
        Parameters:
        - satellite_id: Unique identifier
        - name: Satellite name
        - orbit_radius: Distance from Earth center (km)
        - speed: Orbital speed (km/s)
        - inclination: Orbit inclination (degrees)
        - longitude: Initial longitude position (degrees)
        - altitude: Altitude above Earth surface (km)
        """
        self.satellite_id = satellite_id or str(uuid.uuid4())[:8]
        self.name = name or f"SAT-{self.satellite_id[:4]}"
        self.orbit_radius = orbit_radius  # km from Earth center
        self.speed = speed  # km/s
        self.inclination = inclination  # degrees
        self.longitude = longitude  # degrees
        self.altitude = altitude  # km
        self.theta = math.radians(longitude)  # Initial angle in radians
        self.color = self._generate_color()
        
        # Position in 3D space
        self.x = orbit_radius * math.cos(self.theta) * math.cos(math.radians(inclination))
        self.y = orbit_radius * math.sin(self.theta) * math.cos(math.radians(inclination))
        self.z = orbit_radius * math.sin(math.radians(inclination))
        
        # Track previous positions for trail
        self.trail = []
        self.max_trail_length = 50
        
        # Collision risk data
        self.collision_risk = 0
        self.last_alert_time = None
        
    def _generate_color(self):
        """Generate color based on altitude"""
        if self.altitude < 500:
            return '#00ff88'  # Low Earth Orbit - Green
        elif self.altitude < 2000:
            return '#00ccff'  # Medium Earth Orbit - Blue
        else:
            return '#ff00ff'  # High Earth Orbit - Purple
    
    def update_position(self, delta_time=1.0):
        """
        Update satellite position based on orbital mechanics
        
        Parameters:
        - delta_time: Time elapsed since last update (seconds)
        """
        # Update angle based on orbital speed
        angle_change = (self.speed / self.orbit_radius) * delta_time
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
    
    def to_dict(self):
        """Convert satellite to dictionary for JSON serialization"""
        return {
            'satellite_id': self.satellite_id,
            'name': self.name,
            'orbit_radius': self.orbit_radius,
            'speed': self.speed,
            'altitude': self.altitude,
            'inclination': self.inclination,
            'position': self.get_position(),
            'trail': self.trail,
            'color': self.color,
            'collision_risk': self.collision_risk
        }