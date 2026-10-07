"""
Smoke check core AstroShield API endpoints.

Run after starting the backend:
    python scripts/smoke_check.py
"""

import sys
import requests

BASE_URL = "http://127.0.0.1:5000/api"

CHECKS = [
    ("health", "GET", "/health", None),
    ("satellite analytics", "GET", "/satellites/analytics", None),
    ("debris statistics", "GET", "/debris/statistics", None),
    ("active alerts", "GET", "/alerts/active", None),
    ("ai metrics", "GET", "/ai/metrics", None),
    ("ai predictions", "GET", "/ai/predictions", None),
    ("external mock position", "GET", "/external/positions/25544", None),
    ("health report", "GET", "/reports/health", None),
    ("simulation speed", "POST", "/simulation/speed", {"speed": 1.5}),
]


def main():
    failed = False
    for label, method, path, payload in CHECKS:
        try:
            response = requests.request(method, f"{BASE_URL}{path}", json=payload, timeout=15)
            ok = 200 <= response.status_code < 300
            print(f"{label}: {response.status_code}")
            failed = failed or not ok
        except requests.RequestException as exc:
            print(f"{label}: failed ({exc})")
            failed = True

    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
