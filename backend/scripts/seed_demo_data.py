"""
Seed MongoDB with demo data for AstroShield.

Run from the backend directory:
    python scripts/seed_demo_data.py
"""

import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("MONGO_DB_NAME", "space_traffic_db")


SATELLITES = [
    {"satellite_id": "SAT-101", "name": "Aurora Watch", "altitude": 520, "orbit_radius": 7210, "speed": 7.1, "collision_risk": 0.12, "color": "#29d8ff", "inclination": 21},
    {"satellite_id": "SAT-202", "name": "Orbit Link", "altitude": 780, "orbit_radius": 8420, "speed": 1.18, "collision_risk": 0.08, "color": "#b45cff", "inclination": 47},
    {"satellite_id": "SAT-303", "name": "Geo Shield", "altitude": 1200, "orbit_radius": 9820, "speed": 0.84, "collision_risk": 0.21, "color": "#42b8ff", "inclination": 62},
    {"satellite_id": "SAT-404", "name": "Sentinel Relay", "altitude": 35786, "orbit_radius": 45239, "speed": 3.07, "collision_risk": 0.05, "color": "#ff3d5a", "inclination": 5},
]

DEBRIS = [
    {"debris_id": "DEBRIS-001", "size": "large", "mass": 500, "velocity": 7.8, "risk_level": "HIGH", "orbit_radius": 6900},
    {"debris_id": "DEBRIS-002", "size": "medium", "mass": 10, "velocity": 7.5, "risk_level": "MEDIUM", "orbit_radius": 7100},
    {"debris_id": "DEBRIS-003", "size": "small", "mass": 0.1, "velocity": 7.6, "risk_level": "LOW", "orbit_radius": 7000},
    {"debris_id": "DEBRIS-004", "size": "medium", "mass": 22, "velocity": 7.2, "risk_level": "HIGH", "orbit_radius": 6840},
    {"debris_id": "DEBRIS-005", "size": "small", "mass": 0.4, "velocity": 8.1, "risk_level": "MEDIUM", "orbit_radius": 7350},
]


def upsert_many(collection, key, records):
    for record in records:
        collection.update_one({key: record[key]}, {"$set": record}, upsert=True)


def main():
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
    client.admin.command("ping")
    db = client[DB_NAME]

    upsert_many(db.satellites, "satellite_id", SATELLITES)
    upsert_many(db.debris, "debris_id", DEBRIS)

    now = datetime.now()
    alerts = [
        {
            "alert_id": "demo-alert-1",
            "timestamp": (now - timedelta(minutes=8)).isoformat(),
            "object1": "ISS",
            "object2": "Debris-LEO-042",
            "risk_level": "MEDIUM",
            "probability": 0.34,
            "message": "Potential conjunction detected in low Earth orbit",
        },
        {
            "alert_id": "demo-alert-2",
            "timestamp": (now - timedelta(minutes=26)).isoformat(),
            "object1": "GPS-1",
            "object2": "Debris-MEO-117",
            "risk_level": "LOW",
            "probability": 0.12,
            "message": "Object passing within monitoring threshold",
        },
    ]
    upsert_many(db.alerts, "alert_id", alerts)
    print(f"Seeded {DB_NAME} with demo satellites, debris, and alerts.")


if __name__ == "__main__":
    main()
