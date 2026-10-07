"""
Report API routes.
Provides JSON reports and downloadable PDF summaries for the frontend.
"""

from datetime import datetime
from flask import Blueprint, current_app, jsonify, make_response, request
from database.mongo_db import mongo_db

reports_bp = Blueprint('reports', __name__)


def get_engine():
    return current_app.config.get('simulation_engine')


def escape_pdf_text(value):
    return str(value).replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')


def build_simple_pdf(lines):
    """Build a small single-page PDF without external dependencies."""
    text_commands = ["BT", "/F1 12 Tf", "72 760 Td", "14 TL"]
    for index, line in enumerate(lines):
        command = "Tj" if index == 0 else "'"
        text_commands.append(f"({escape_pdf_text(line)}) {command}")
    text_commands.append("ET")
    stream = "\n".join(text_commands).encode("latin-1", errors="replace")

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n" + stream + b"\nendstream",
    ]

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{index} 0 obj\n".encode("ascii"))
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")

    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    pdf.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
        f"startxref\n{xref_offset}\n%%EOF\n".encode("ascii")
    )
    return bytes(pdf)


@reports_bp.route('/collision', methods=['POST'])
def generate_collision_report():
    payload = request.get_json(silent=True) or {}
    engine = get_engine()
    state = engine.get_current_state() if engine else {'satellites': [], 'debris': [], 'alerts': [], 'stats': {}}

    report = {
        'report_id': f"collision-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        'generated_at': datetime.now().isoformat(),
        'parameters': payload,
        'summary': {
            'satellites_tracked': len(state.get('satellites', [])),
            'debris_tracked': len(state.get('debris', [])),
            'active_alerts': len(state.get('alerts', [])),
            'highest_risk': max([sat.get('collision_risk', 0) for sat in state.get('satellites', [])] or [0])
        },
        'alerts': state.get('alerts', [])
    }
    return jsonify(report), 201


@reports_bp.route('/health', methods=['GET'])
def generate_health_report():
    db = mongo_db.db
    engine = get_engine()
    return jsonify({
        'report_id': f"health-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        'generated_at': datetime.now().isoformat(),
        'api': 'operational',
        'database': 'connected' if db is not None else 'demo-mode',
        'simulation': 'running' if engine and engine.is_running else 'stopped',
        'ai_predictor': 'online' if engine and engine.ai_predictor else 'unavailable'
    })


@reports_bp.route('/<report_id>/pdf', methods=['GET'])
def export_report_pdf(report_id):
    """Return a downloadable PDF report summary."""
    engine = get_engine()
    state = engine.get_current_state() if engine else {'satellites': [], 'debris': [], 'alerts': [], 'stats': {}}
    lines = [
        'AstroShield Report',
        f'Report ID: {report_id}',
        f'Generated: {datetime.now().isoformat()}',
        '',
        f"Satellites tracked: {len(state.get('satellites', []))}",
        f"Debris tracked: {len(state.get('debris', []))}",
        f"Recent alerts: {len(state.get('alerts', []))}",
        f"Simulation status: {'running' if engine and engine.is_running else 'stopped'}",
    ]
    response = make_response(build_simple_pdf(lines))
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'attachment; filename="{report_id}.pdf"'
    return response
