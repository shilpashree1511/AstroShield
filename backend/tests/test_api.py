import os
import sys
import unittest
from contextlib import nullcontext
from unittest.mock import patch

CURRENT_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, '..'))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import app


class AstroShieldAPITestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.config['TESTING'] = True
        cls.client = app.test_client()

    def test_health(self):
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['status'], 'healthy')

    def test_demo_satellite_analytics(self):
        response = self.client.get('/api/satellites/analytics')
        self.assertEqual(response.status_code, 200)
        self.assertIn('total_satellites', response.get_json())

    def test_demo_debris_statistics(self):
        response = self.client.get('/api/debris/statistics')
        self.assertEqual(response.status_code, 200)
        self.assertIn('total_debris', response.get_json())

    def test_ai_metrics(self):
        response = self.client.get('/api/ai/metrics')
        self.assertEqual(response.status_code, 200)
        self.assertIn('accuracy', response.get_json())

    def test_ai_predictions(self):
        response = self.client.get('/api/ai/predictions')
        self.assertEqual(response.status_code, 200)
        self.assertIn('predictions', response.get_json())

    def test_simulation_speed_validation(self):
        response = self.client.post('/api/simulation/speed', json={'speed': 'fast'})
        self.assertEqual(response.status_code, 400)

    def test_simulation_speed_update(self):
        response = self.client.post('/api/simulation/speed', json={'speed': 2})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['speed'], 2.0)

    def test_report_pdf(self):
        response = self.client.get('/api/reports/test-report/pdf')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, 'application/pdf')
        self.assertTrue(response.data.startswith(b'%PDF'))

    def test_realtime_state(self):
        response = self.client.get('/api/realtime/state')
        self.assertEqual(response.status_code, 200)
        self.assertIn('satellites', response.get_json())

    def test_demo_login_works_without_database(self):
        import routes.auth as auth_module

        original_db = auth_module.mongo_db._db
        auth_module.mongo_db._db = None
        try:
            response = self.client.post('/api/auth/login', json={
                'username': 'admin',
                'password': 'admin123'
            })
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.get_json()['message'], 'Demo login successful')
        finally:
            auth_module.mongo_db._db = original_db

    def test_db_init_handles_connection_failure(self):
        class DummyApp:
            def app_context(self):
                return nullcontext()

        with patch('database.mongo_db.mongo_db.connect', side_effect=RuntimeError('DB unavailable')):
            try:
                from database.mongo_db import init_db
                init_db(DummyApp())
            except RuntimeError:
                self.fail('init_db should not crash startup when MongoDB is unavailable')


if __name__ == '__main__':
    unittest.main()
