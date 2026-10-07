"""
Seed MongoDB with real active satellite records from CelesTrak.

Run from the project root:
    python backend/scripts/seed_external_satellites.py
"""

import os
import sys

from dotenv import load_dotenv


BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

load_dotenv(os.path.join(BACKEND_DIR, '.env'))

from database.mongo_db import mongo_db  # noqa: E402
from services.api_integration import APIIntegration  # noqa: E402


def main():
    limit = int(os.getenv('SATELLITE_SEED_LIMIT', '24'))
    satellites = APIIntegration().get_active_satellites(limit)
    if not satellites:
        print('No satellites fetched from CelesTrak.')
        return 1

    db = mongo_db.connect()
    if db is None:
        print('MongoDB connection failed.')
        return 1

    for satellite in satellites:
        db.satellites.update_one(
            {'satellite_id': satellite['satellite_id']},
            {'$set': satellite},
            upsert=True,
        )

    print(f'Seeded {len(satellites)} real satellites from CelesTrak.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
