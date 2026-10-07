"""
External API Integration Service
Integrates with CelesTrak, N2YO, and NASA Open Data APIs
"""

import requests
import json
from datetime import datetime, timedelta
import time
import os

class APIIntegration:
    """Handles external API integrations for satellite data"""
    
    def __init__(self):
        """Initialize API integration service"""
        # API endpoints
        self.celestrak_url = "https://celestrak.org/NORAD/elements/gp.php"
        self.n2yo_url = "https://api.n2yo.com/rest/v1/satellite"
        self.nasa_url = "https://api.nasa.gov/neo/rest/v1/feed"
        
        # API keys (should be loaded from environment variables)
        self.n2yo_api_key = os.getenv("N2YO_API_KEY", "")
        self.nasa_api_key = os.getenv("NASA_API_KEY", "")
        
        # Cache for API responses
        self.cache = {}
        self.cache_duration = 3600  # 1 hour cache

    def get_active_satellites(self, limit=12):
        """
        Fetch active satellite records from CelesTrak.

        Returns frontend-ready satellite objects derived from public GP data.
        """
        limit = max(1, min(int(limit or 12), 100))
        cache_key = f"active_satellites_{limit}"

        if cache_key in self.cache:
            cached_time, cached_data = self.cache[cache_key]
            if (datetime.now() - cached_time).seconds < self.cache_duration:
                return cached_data

        try:
            response = requests.get(
                self.celestrak_url,
                params={'GROUP': 'active', 'FORMAT': 'json'},
                timeout=15,
            )
            response.raise_for_status()
            records = response.json()
            satellites = [self._normalize_celestrak_satellite(record, index) for index, record in enumerate(records[:limit])]
            satellites = [satellite for satellite in satellites if satellite]
            self.cache[cache_key] = (datetime.now(), satellites)
            return satellites
        except Exception as e:
            print(f"Error fetching active satellite data: {e}")
            return []

    def _normalize_celestrak_satellite(self, record, index):
        """Convert a CelesTrak GP JSON record into the frontend satellite shape."""
        try:
            earth_radius_km = 6371
            mean_motion = float(record.get('MEAN_MOTION') or 15)
            inclination = float(record.get('INCLINATION') or 0)
            eccentricity = float(record.get('ECCENTRICITY') or 0)
            period_seconds = 86400 / mean_motion
            mu = 398600.4418
            semi_major_axis = (mu * (period_seconds / (2 * 3.141592653589793)) ** 2) ** (1 / 3)
            altitude = max(160, semi_major_axis - earth_radius_km)
            speed = (mu / semi_major_axis) ** 0.5
            colors = ['#29d8ff', '#b45cff', '#42b8ff', '#ff3d5a', '#00ff88', '#ffd166']

            return {
                'satellite_id': f"SAT-{record.get('NORAD_CAT_ID')}",
                'norad_id': record.get('NORAD_CAT_ID'),
                'name': record.get('OBJECT_NAME') or f"Satellite {record.get('NORAD_CAT_ID')}",
                'altitude': round(altitude, 1),
                'orbit_radius': round(semi_major_axis, 1),
                'speed': round(speed, 2),
                'inclination': round(inclination, 2),
                'collision_risk': round(min(0.35, 0.04 + eccentricity * 3), 3),
                'color': colors[index % len(colors)],
                'source': 'CelesTrak',
                'epoch': record.get('EPOCH'),
            }
        except (TypeError, ValueError):
            return None
    
    def get_tle_data(self, satellite_id):
        """
        Fetch TLE (Two-Line Element) data from CelesTrak
        
        Parameters:
        - satellite_id: NORAD satellite catalog number
        
        Returns:
        - TLE data as dictionary
        """
        cache_key = f"tle_{satellite_id}"
        
        # Check cache
        if cache_key in self.cache:
            cached_time, cached_data = self.cache[cache_key]
            if (datetime.now() - cached_time).seconds < self.cache_duration:
                return cached_data
        
        try:
            params = {
                'CATNR': satellite_id,
                'FORMAT': 'TLE'
            }
            
            response = requests.get(self.celestrak_url, params=params, timeout=10)
            
            if response.status_code == 200:
                lines = response.text.strip().split('\n')
                if len(lines) >= 3:
                    tle_data = {
                        'name': lines[0].strip(),
                        'line1': lines[1].strip(),
                        'line2': lines[2].strip(),
                        'satellite_id': satellite_id,
                        'fetch_time': datetime.now().isoformat()
                    }
                    
                    # Cache the result
                    self.cache[cache_key] = (datetime.now(), tle_data)
                    return tle_data
            
            return None
            
        except Exception as e:
            print(f"Error fetching TLE data: {e}")
            return None
    
    def get_satellite_positions(self, satellite_id, observer_lat=0, observer_lng=0, observer_alt=0):
        """
        Get real-time satellite positions from N2YO API
        
        Parameters:
        - satellite_id: NORAD satellite ID
        - observer_lat, observer_lng, observer_alt: Observer coordinates
        
        Returns:
        - Satellite position data
        """
        if not self.n2yo_api_key:
            # Return mock data if no API key
            return self._get_mock_satellite_position(satellite_id)
        
        cache_key = f"position_{satellite_id}"
        
        # Check cache
        if cache_key in self.cache:
            cached_time, cached_data = self.cache[cache_key]
            if (datetime.now() - cached_time).seconds < 60:  # 1 minute cache for positions
                return cached_data
        
        try:
            url = f"{self.n2yo_url}/positions/{satellite_id}/{observer_lat}/{observer_lng}/{observer_alt}/1"
            params = {'apiKey': self.n2yo_api_key}
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                position_data = {
                    'satellite_id': satellite_id,
                    'positions': data.get('positions', []),
                    'timestamp': datetime.now().isoformat()
                }
                
                # Cache the result
                self.cache[cache_key] = (datetime.now(), position_data)
                return position_data
            
            return self._get_mock_satellite_position(satellite_id)
            
        except Exception as e:
            print(f"Error fetching satellite positions: {e}")
            return self._get_mock_satellite_position(satellite_id)
    
    def _get_mock_satellite_position(self, satellite_id):
        """Generate mock satellite position data for testing"""
        import math
        import random
        
        # Generate a simple circular orbit for mock data
        time_factor = time.time() / 60  # Changes over time
        longitude = (time_factor * 10) % 360
        latitude = math.sin(time_factor) * 90
        
        return {
            'satellite_id': satellite_id,
            'positions': [{
                'satlatitude': latitude,
                'satlongitude': longitude,
                'sataltitude': random.uniform(400, 1000),
                'timestamp': int(time.time())
            }],
            'timestamp': datetime.now().isoformat(),
            'is_mock': True
        }
    
    def get_near_earth_objects(self, start_date=None, end_date=None):
        """
        Fetch Near Earth Objects from NASA API
        
        Parameters:
        - start_date: Start date (YYYY-MM-DD)
        - end_date: End date (YYYY-MM-DD)
        
        Returns:
        - List of near earth objects
        """
        if not self.nasa_api_key:
            return self._get_mock_neo_data()
        
        if not start_date:
            start_date = datetime.now().strftime('%Y-%m-%d')
        if not end_date:
            end_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        
        cache_key = f"neo_{start_date}_{end_date}"
        
        # Check cache
        if cache_key in self.cache:
            cached_time, cached_data = self.cache[cache_key]
            if (datetime.now() - cached_time).seconds < 86400:  # 24 hour cache
                return cached_data
        
        try:
            params = {
                'start_date': start_date,
                'end_date': end_date,
                'api_key': self.nasa_api_key
            }
            
            response = requests.get(self.nasa_url, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                neo_data = {
                    'element_count': data.get('element_count', 0),
                    'near_earth_objects': data.get('near_earth_objects', {}),
                    'fetch_time': datetime.now().isoformat()
                }
                
                # Cache the result
                self.cache[cache_key] = (datetime.now(), neo_data)
                return neo_data
            
            return self._get_mock_neo_data()
            
        except Exception as e:
            print(f"Error fetching NEO data: {e}")
            return self._get_mock_neo_data()
    
    def _get_mock_neo_data(self):
        """Generate mock Near Earth Object data"""
        mock_neo = {
            'element_count': 5,
            'near_earth_objects': {},
            'is_mock': True
        }
        
        current_date = datetime.now().strftime('%Y-%m-%d')
        mock_neo['near_earth_objects'][current_date] = [
            {
                'id': 'neo_1',
                'name': 'Mock Asteroid 1',
                'absolute_magnitude_h': 22.5,
                'estimated_diameter': {
                    'meters': {'estimated_diameter_min': 100, 'estimated_diameter_max': 200}
                },
                'is_potentially_hazardous_asteroid': False,
                'close_approach_data': [{
                    'close_approach_date': current_date,
                    'miss_distance': {'kilometers': '5000000'},
                    'relative_velocity': {'kilometers_per_hour': '50000'}
                }]
            },
            {
                'id': 'neo_2',
                'name': 'Mock Asteroid 2',
                'absolute_magnitude_h': 20.1,
                'estimated_diameter': {
                    'meters': {'estimated_diameter_min': 300, 'estimated_diameter_max': 500}
                },
                'is_potentially_hazardous_asteroid': True,
                'close_approach_data': [{
                    'close_approach_date': current_date,
                    'miss_distance': {'kilometers': '1500000'},
                    'relative_velocity': {'kilometers_per_hour': '75000'}
                }]
            }
        ]
        
        return mock_neo
    
    def get_constellation_data(self, constellation_name):
        """
        Get satellite data for a specific constellation (Starlink, GPS, etc.)
        
        Parameters:
        - constellation_name: Name of satellite constellation
        
        Returns:
        - List of satellites in constellation
        """
        # Known constellations with their satellite IDs
        constellations = {
            'starlink': [44238, 44239, 44240, 44241, 44242],  # Example IDs
            'gps': [37753, 37754, 37755, 37756, 37757],
            'glonass': [39157, 39158, 39159, 39160, 39161],
            'galileo': [40128, 40129, 40130, 40131, 40132]
        }
        
        if constellation_name.lower() not in constellations:
            return []
        
        satellites = []
        for sat_id in constellations[constellation_name.lower()]:
            tle = self.get_tle_data(sat_id)
            if tle:
                satellites.append(tle)
        
        return satellites
    
    def clear_cache(self):
        """Clear the API response cache"""
        self.cache.clear()
        return {'message': 'Cache cleared successfully'}
    
    def get_cache_stats(self):
        """Get cache statistics"""
        return {
            'cache_size': len(self.cache),
            'cached_items': list(self.cache.keys())
        }
