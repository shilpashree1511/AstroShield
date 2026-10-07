"""
Smoke-test the Flask API without needing a separate running server.

Run from the project root:
    python backend/scripts/smoke_api.py
"""

import os
import sys
from datetime import datetime


BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import app  # noqa: E402


def request(client, method, path, token=None, json=None):
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    return getattr(client, method.lower())(path, headers=headers, json=json)


def main():
    client = app.test_client()
    checks = []

    login = request(
        client,
        'POST',
        '/api/auth/login',
        json={'username': 'admin', 'password': 'admin123'},
    )
    token = (login.get_json(silent=True) or {}).get('access_token')
    checks.append(('POST /api/auth/login', login.status_code, login.status_code == 200 and bool(token)))

    public_checks = [
        ('GET', '/api/health'),
        ('GET', '/api/satellites/'),
        ('GET', '/api/satellites/analytics'),
        ('GET', '/api/satellites/SAT-101/trajectory'),
        ('GET', '/api/debris/'),
        ('GET', '/api/debris/statistics'),
        ('GET', '/api/debris/risky'),
        ('GET', '/api/alerts/'),
        ('GET', '/api/alerts/active'),
        ('GET', '/api/alerts/statistics'),
        ('GET', '/api/ai/metrics'),
        ('GET', '/api/ai/features'),
        ('GET', '/api/ai/predictions'),
        ('GET', '/api/realtime/state'),
        ('GET', '/api/simulation/state'),
        ('GET', '/api/reports/health'),
        ('GET', '/api/reports/demo/pdf'),
        ('GET', '/api/external/cache'),
        ('GET', '/api/external/constellation/starlink'),
    ]
    for method, path in public_checks:
        response = request(client, method, path)
        checks.append((f'{method} {path}', response.status_code, response.status_code < 400))

    suffix = datetime.now().strftime('%Y%m%d%H%M%S%f')
    protected_checks = [
        ('GET', '/api/auth/profile', None),
        ('POST', '/api/simulation/speed', {'speed': 1}),
        ('POST', '/api/satellites/', {'name': f'Smoke Test Satellite {suffix}', 'orbit_radius': 7100, 'speed': 7.4}),
        ('POST', '/api/debris/', {'size': 'small', 'orbit_radius': 7050}),
    ]
    for method, path, body in protected_checks:
        response = request(client, method, path, token=token, json=body)
        checks.append((f'{method} {path}', response.status_code, response.status_code < 400))

    failures = [check for check in checks if not check[2]]
    for label, status, passed in checks:
        print(f"{'PASS' if passed else 'FAIL'} {status:>3} {label}")

    if failures:
        print(f"\n{len(failures)} API checks failed.")
        return 1

    print(f"\nAll {len(checks)} API checks passed.")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
