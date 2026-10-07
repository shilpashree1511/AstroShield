"""
AI Collision Prediction Engine
Uses Machine Learning models to predict collision probabilities
"""

import joblib
import numpy as np
import pandas as pd
import os

try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.linear_model import LogisticRegression
    from sklearn.preprocessing import StandardScaler
    SKLEARN_AVAILABLE = True
except Exception:
    RandomForestClassifier = None
    LogisticRegression = None
    StandardScaler = None
    SKLEARN_AVAILABLE = False


class AIPredictor:
    """Machine learning based collision predictor"""
    
    def __init__(self, model_path=None):
        """
        Initialize AI predictor with pre-trained models
        
        Parameters:
        - model_path: Path to saved ML models
        """
        self.random_forest_model = None
        self.logistic_regression_model = None
        self.scaler = StandardScaler() if SKLEARN_AVAILABLE else None
        
        # Feature weights for ensemble prediction
        self.rf_weight = 0.6
        self.lr_weight = 0.4
        
        # Load or train models
        if model_path and os.path.exists(model_path):
            self.load_models(model_path)
        elif SKLEARN_AVAILABLE:
            self.train_models()
        else:
            print("scikit-learn not available; using fallback collision heuristic instead.")
    
    def extract_features(self, satellite1, satellite2):
        """
        Extract features for collision prediction
        
        Features:
        1. Distance between satellites
        2. Relative speed
        3. Orbit angle difference
        4. Altitude difference
        5. Direction similarity
        6. Orbital plane intersection angle
        
        Returns:
        - Feature vector for ML model
        """
        # Calculate distance
        pos1 = satellite1.get_position()
        pos2 = satellite2.get_position()
        
        dx = pos2['x'] - pos1['x']
        dy = pos2['y'] - pos1['y']
        dz = pos2['z'] - pos1['z']
        distance = np.sqrt(dx**2 + dy**2 + dz**2)
        
        # Relative speed
        relative_speed = abs(satellite1.speed - satellite2.speed)
        
        # Orbit angle difference
        orbit_angle_diff = abs(satellite1.inclination - satellite2.inclination)
        
        # Altitude difference
        altitude_diff = abs(satellite1.altitude - satellite2.altitude)
        
        # Direction similarity (dot product of velocity vectors)
        # Simplified direction calculation
        direction1 = np.array([np.cos(satellite1.theta), np.sin(satellite1.theta)])
        direction2 = np.array([np.cos(satellite2.theta), np.sin(satellite2.theta)])
        direction_similarity = np.dot(direction1, direction2)
        
        # Orbital radius ratio
        orbit_radius_ratio = min(satellite1.orbit_radius, satellite2.orbit_radius) / \
                            max(satellite1.orbit_radius, satellite2.orbit_radius)
        
        features = np.array([
            distance,
            relative_speed,
            orbit_angle_diff,
            altitude_diff,
            direction_similarity,
            orbit_radius_ratio,
            satellite1.speed,
            satellite2.speed
        ])
        
        return features.reshape(1, -1)
    
    def train_models(self):
        """Train machine learning models for collision prediction"""
        if not SKLEARN_AVAILABLE:
            print("scikit-learn is unavailable; skipping model training.")
            return

        print("Training AI models for collision prediction...")
        
        # Generate synthetic training data
        np.random.seed(42)
        n_samples = 10000
        
        # Generate features
        distances = np.random.uniform(0, 100, n_samples)
        rel_speeds = np.random.uniform(0, 10, n_samples)
        orbit_angles = np.random.uniform(0, 180, n_samples)
        altitudes = np.random.uniform(0, 1000, n_samples)
        directions = np.random.uniform(-1, 1, n_samples)
        radius_ratios = np.random.uniform(0.5, 1, n_samples)
        speeds1 = np.random.uniform(3, 8, n_samples)
        speeds2 = np.random.uniform(3, 8, n_samples)
        
        # Generate labels (collision risk)
        # High risk when distance is small AND relative speed is low AND orbits are similar
        risk_scores = []
        for i in range(n_samples):
            risk = 0
            if distances[i] < 10:
                risk += 0.6
            if rel_speeds[i] < 2:
                risk += 0.2
            if orbit_angles[i] < 30:
                risk += 0.2
            risk_scores.append(risk)
        
        risk_labels = (np.array(risk_scores) > 0.5).astype(int)
        
        # Prepare feature matrix
        X = np.column_stack([distances, rel_speeds, orbit_angles, altitudes, 
                            directions, radius_ratios, speeds1, speeds2])
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train Random Forest
        self.random_forest_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.random_forest_model.fit(X_scaled, risk_labels)
        
        # Train Logistic Regression
        self.logistic_regression_model = LogisticRegression(
            random_state=42,
            max_iter=1000
        )
        self.logistic_regression_model.fit(X_scaled, risk_labels)
        
        # Calculate accuracies
        rf_accuracy = self.random_forest_model.score(X_scaled, risk_labels)
        lr_accuracy = self.logistic_regression_model.score(X_scaled, risk_labels)
        
        print(f"Random Forest Accuracy: {rf_accuracy:.3f}")
        print(f"Logistic Regression Accuracy: {lr_accuracy:.3f}")
        
        # Save models
        self.save_models('ml-model/collision_predictor.pkl')
    
    def predict_collision_probability(self, satellite1, satellite2):
        """
        Predict collision probability between two satellites
        
        Parameters:
        - satellite1, satellite2: Satellite objects
        
        Returns:
        - Probability of collision (0 to 1)
        """
        if not SKLEARN_AVAILABLE or self.random_forest_model is None or self.logistic_regression_model is None:
            features = self.extract_features(satellite1, satellite2)[0]
            distance = features[0]
            relative_speed = features[1]
            orbit_angle_diff = features[2]
            altitude_diff = features[3]

            probability = 0.0
            if distance < 5:
                probability += 0.7
            elif distance < 20:
                probability += 0.35
            if relative_speed < 2:
                probability += 0.15
            if orbit_angle_diff < 15:
                probability += 0.1
            if altitude_diff < 50:
                probability += 0.1

            probability = min(0.99, max(0.0, probability / 1.2))
            if probability > 0.7:
                risk_level = "HIGH"
            elif probability > 0.3:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"

            return {
                'probability': float(probability),
                'risk_level': risk_level,
                'random_forest_prediction': float(probability),
                'logistic_regression_prediction': float(probability)
            }

        features = self.extract_features(satellite1, satellite2)
        features_scaled = self.scaler.transform(features)
        
        # Get predictions from both models
        rf_prob = self.random_forest_model.predict_proba(features_scaled)[0][1]
        lr_prob = self.logistic_regression_model.predict_proba(features_scaled)[0][1]
        
        # Ensemble prediction
        ensemble_prob = (rf_prob * self.rf_weight + lr_prob * self.lr_weight)
        
        # Apply risk level classification
        if ensemble_prob > 0.7:
            risk_level = "HIGH"
        elif ensemble_prob > 0.3:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        return {
            'probability': float(ensemble_prob),
            'risk_level': risk_level,
            'random_forest_prediction': float(rf_prob),
            'logistic_regression_prediction': float(lr_prob)
        }
    
    def predict_collisions(self, satellites):
        """
        Predict collisions for all satellite pairs        
        Parameters:
        - satellites: List of satellite objects
        
        Returns:
        - Dictionary with satellite IDs and their highest risk scores
        """
        predictions = {}
        
        for i, sat1 in enumerate(satellites):
            max_risk = 0
            for j, sat2 in enumerate(satellites):
                if i != j:
                    prediction = self.predict_collision_probability(sat1, sat2)
                    max_risk = max(max_risk, prediction['probability'])
            predictions[sat1.satellite_id] = max_risk
        
        return predictions
    
    def save_models(self, path):
        """Save trained models to disk"""
        model_dir = os.path.dirname(path)
        if model_dir:
            os.makedirs(model_dir, exist_ok=True)

        models = {
            'random_forest': self.random_forest_model,
            'logistic_regression': self.logistic_regression_model,
            'scaler': self.scaler
        }
        joblib.dump(models, path)
        print(f"Models saved to {path}")
    
    def load_models(self, path):
        """Load trained models from disk"""
        models = joblib.load(path)
        self.random_forest_model = models['random_forest']
        self.logistic_regression_model = models['logistic_regression']
        self.scaler = models['scaler']
        print(f"Models loaded from {path}")
