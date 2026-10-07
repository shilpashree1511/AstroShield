"""
Real-time update routes.
Uses Server-Sent Events so live updates work without extra WebSocket packages.
"""

import json
import time
from flask import Blueprint, Response, current_app, jsonify, stream_with_context

realtime_bp = Blueprint('realtime', __name__)


def current_state():
    engine = current_app.config.get('simulation_engine')
    if not engine:
        return {'satellites': [], 'debris': [], 'alerts': [], 'stats': {}}
    return engine.get_current_state()


@realtime_bp.route('/state', methods=['GET'])
def get_realtime_state():
    """Return the latest realtime payload as normal JSON."""
    return jsonify(current_state())


@realtime_bp.route('/stream', methods=['GET'])
def stream_realtime_state():
    """Stream simulation state using Server-Sent Events."""
    @stream_with_context
    def event_stream():
        while True:
            payload = json.dumps(current_state())
            yield f"event: simulation_state\ndata: {payload}\n\n"
            time.sleep(2)

    return Response(event_stream(), mimetype='text/event-stream')
