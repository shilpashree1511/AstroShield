"""
Collision Detection Service
Calculates distances between space objects and predicts collision risks
"""

import math
import numpy as np

class CollisionDetector:
    """Handles collision detection between satellites and debris"""
    
    def __init__(self, safe_distance_km=10.0):
        """
        Initialize collision detector
        
        Parameters:
        - safe_distance_km: Minimum safe distance in kilometers
        """
        self.safe_distance = safe_distance_km
        self.warning_distance = safe_distance_km * 5
        self.critical_distance = safe_distance_km * 2
    
    def calculate_distance(self, object1, object2):
        """
        Calculate Euclidean distance between two space objects
        
        Formula: d = sqrt((x2-x1)^2 + (y2-y1)^2 + (z2-z1)^2)
        
        Parameters:
        - object1: First object (satellite or debris)
        - object2: Second object
        
        Returns:
        - Distance in kilometers
        """
        pos1 = object1.get_position()
        pos2 = object2.get_position()
        
        dx = pos2['x'] - pos1['x']
        dy = pos2['y'] - pos1['y']
        dz = pos2['z'] - pos1['z']
        
        distance = math.sqrt(dx**2 + dy**2 + dz**2)
        return distance
    
    def calculate_collision_risk(self, satellite1, satellite2):
        """
        Calculate collision risk probability between two satellites
        
        Risk factors:
        - Current distance
        - Relative velocity
        - Orbital plane intersection
        - Size of objects
        
        Returns:
        - Risk probability between 0 and 1
        """
        # Calculate current distance
        distance = self.calculate_distance(satellite1, satellite2)
        
        # Base risk from distance
        if distance <= self.safe_distance:
            distance_risk = 1.0
        elif distance >= self.warning_distance:
            distance_risk = 0.0
        else:
            distance_risk = 1 - (distance - self.safe_distance) / (self.warning_distance - self.safe_distance)
        
        # Calculate relative velocity
        v1 = satellite1.speed
        v2 = satellite2.speed
        velocity_diff = abs(v1 - v2)
        velocity_risk = min(1.0, velocity_diff / 10.0)  # Normalize velocity difference
        
        # Orbital plane similarity risk
        inclination_diff = abs(satellite1.inclination - satellite2.inclination)
        orbit_risk = 1 - (inclination_diff / 180)  # Higher risk for similar inclinations
        
        # Combined risk score
        risk = (
            distance_risk * 0.6 +  # Distance is most important
            velocity_risk * 0.2 +
            orbit_risk * 0.2
        )
        
        return min(1.0, max(0.0, risk))
    
    def check_debris_collision(self, satellite, debris):
        """
        Calculate collision risk between satellite and debris
        
        Parameters:
        - satellite: Satellite object
        - debris: Debris object
        
        Returns:
        - Risk probability between 0 and 1
        """
        distance = self.calculate_distance(satellite, debris)
        
        # Distance-based risk
        if distance <= self.safe_distance:
            distance_risk = 1.0
        elif distance >= self.warning_distance:
            distance_risk = 0.0
        else:
            distance_risk = 1 - (distance - self.safe_distance) / (self.warning_distance - self.safe_distance)
        
        # Size-based risk for debris
        size_risk_multiplier = {
            'small': 0.5,
            'medium': 1.0,
            'large': 1.5
        }
        
        size_risk = size_risk_multiplier.get(debris.size, 1.0)
        
        # Combined risk
        risk = min(1.0, distance_risk * size_risk)
        
        return risk
    
    def predict_future_collision(self, satellite1, satellite2, time_ahead=60):
        """
        Predict future collision risk based on orbital projections
        
        Parameters:
        - satellite1, satellite2: Satellite objects
        - time_ahead: Time to predict ahead in seconds
        
        Returns:
        - Minimum distance in future and risk score
        """
        # Store original positions
        original_positions = []
        
        # Simulate future positions
        future_distances = []
        
        for t in range(0, time_ahead, 5):  # Check every 5 seconds
            # Simulate position updates
            temp_sat1 = self._simulate_position(satellite1, t)
            temp_sat2 = self._simulate_position(satellite2, t)
            
            distance = self.calculate_distance(temp_sat1, temp_sat2)
            future_distances.append(distance)
        
        min_distance = min(future_distances) if future_distances else float('inf')
        
        if min_distance <= self.safe_distance:
            future_risk = 1.0
        elif min_distance <= self.critical_distance:
            future_risk = 0.7
        elif min_distance <= self.warning_distance:
            future_risk = 0.3
        else:
            future_risk = 0.0
        
        return {
            'min_distance': min_distance,
            'risk': future_risk,
            'time_to_collision': future_distances.index(min_distance) * 5 if min_distance < float('inf') else None
        }
    
    def _simulate_position(self, obj, time_elapsed):
        """
        Simulate object position after given time
        
        This is a simplified simulation for prediction purposes
        """
        # Create a copy of the object for simulation
        class SimulatedObject:
            pass
        
        sim_obj = SimulatedObject()
        
        if hasattr(obj, 'satellite_id'):  # It's a satellite
            sim_obj.speed = obj.speed
            sim_obj.orbit_radius = obj.orbit_radius
            sim_obj.inclination = obj.inclination
            sim_obj.theta = obj.theta + (obj.speed / obj.orbit_radius) * time_elapsed
            
            # Calculate position
            sim_obj.x = sim_obj.orbit_radius * math.cos(sim_obj.theta) * math.cos(math.radians(sim_obj.inclination))
            sim_obj.y = sim_obj.orbit_radius * math.sin(sim_obj.theta) * math.cos(math.radians(sim_obj.inclination))
            sim_obj.z = sim_obj.orbit_radius * math.sin(math.radians(sim_obj.inclination))
            
            def get_position():
                return {'x': sim_obj.x, 'y': sim_obj.y, 'z': sim_obj.z}
            
            sim_obj.get_position = get_position
        
        return sim_obj