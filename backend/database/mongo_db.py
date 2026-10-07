"""
MongoDB Database Configuration and Connection Manager
Handles all database operations for the space traffic management system
"""

from pymongo import MongoClient
from flask import current_app
import os
import time

class MongoDB:
    """MongoDB connection manager class"""
    
    _instance = None
    _client = None
    _db = None
    _last_failed_connect = 0
    _retry_after_seconds = 10
    
    def __new__(cls):
        """Singleton pattern implementation"""
        if cls._instance is None:
            cls._instance = super(MongoDB, cls).__new__(cls)
        return cls._instance
    
    def connect(self, app=None):
        """Establish connection to MongoDB database"""
        if self._db is None and self._last_failed_connect:
            elapsed = time.time() - self._last_failed_connect
            if elapsed < self._retry_after_seconds:
                return None

        try:
            # Connection string - update with your MongoDB URI
            mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
            is_srv_uri = mongo_uri.startswith('mongodb+srv://')
            timeout_ms = 5000 if is_srv_uri else 1000
            client_options = {
                'serverSelectionTimeoutMS': timeout_ms,
                'connectTimeoutMS': timeout_ms,
                'socketTimeoutMS': timeout_ms,
            }
            if not is_srv_uri:
                client_options['directConnection'] = True

            self._client = MongoClient(mongo_uri, **client_options)
            self._client.admin.command('ping')
            self._db = self._client[os.getenv('MONGO_DB_NAME', 'space_traffic_db')]
            
            # Create indexes for better performance
            self._db.satellites.create_index([('satellite_id', 1)], unique=True)
            self._db.alerts.create_index([('timestamp', -1)])
            self._db.users.create_index([('username', 1)], unique=True)
            
            print("Successfully connected to MongoDB")
            return self._db
        except Exception as e:
            print(f"Failed to connect to MongoDB: {e}")
            self._client = None
            self._db = None
            self._last_failed_connect = time.time()
            return None
    
    @property
    def db(self):
        """Get database instance"""
        if self._db is None:
            self.connect()
        return self._db
    
    def get_collection(self, collection_name):
        """Get specific collection from database"""
        if self._db is None:
            self.connect()
        return self._db[collection_name]

# Global database instance
mongo_db = MongoDB()

def init_db(app):
    """Initialize database with Flask app context"""
    try:
        with app.app_context():
            db = mongo_db.connect()
            if db is None:
                print("MongoDB unavailable; continuing without database initialization.")
                return

            # Create initial collections if they don't exist
            collections = ['satellites', 'debris', 'alerts', 'analytics', 'users', 'collision_history']
            for collection in collections:
                if collection not in db.list_collection_names():
                    db.create_collection(collection)
            print("Database initialized successfully")
    except Exception as exc:
        print(f"Database initialization skipped: {exc}")
