import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from pydantic import ValidationError

from schemas import (
    ErrorResponse,
    HealthResponse,
    LanguagesResponse,
    TranslateRequest,
    TranslateResponse,
)
from translator import fetch_languages, translate_text

load_dotenv()

app = Flask(__name__)

FLASK_ENV = os.getenv("FLASK_ENV", "production")

# CORS: allow dev servers; in production frontend is served from same origin
if FLASK_ENV == "development":
    CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])
else:
    CORS(app)

# Path to built frontend files (for production)
FRONTEND_DIST = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist"
)
_has_frontend = os.path.isdir(FRONTEND_DIST)


@app.errorhandler(404)
def not_found(_):
    return jsonify(ErrorResponse(error="Not found").model_dump()), 404


@app.errorhandler(405)
def method_not_allowed(_):
    return jsonify(ErrorResponse(error="Method not allowed").model_dump()), 405


@app.errorhandler(500)
def internal_error(_):
    return jsonify(ErrorResponse(error="Internal server error").model_dump()), 500


@app.route("/health")
def health():
    return jsonify(HealthResponse(status="healthy", version="1.0.0").model_dump())


@app.route("/api/languages")
def get_languages():
    try:
        languages = fetch_languages()
        return jsonify(LanguagesResponse(languages=languages).model_dump())
    except Exception as e:
        app.logger.error(f"Failed to fetch languages: {e}")
        return jsonify(ErrorResponse(error="Failed to load language list").model_dump()), 502


@app.route("/api/translate", methods=["POST"])
def translate():
    try:
        body = request.get_json()
        if not body:
            return jsonify(ErrorResponse(error="Request body is required").model_dump()), 400

        parsed = TranslateRequest(**body)
    except ValidationError as e:
        first_error = e.errors()[0]
        msg = first_error["msg"]
        return jsonify(ErrorResponse(error=msg).model_dump()), 400

    try:
        result = translate_text(
            text=parsed.text,
            target=parsed.target,
            source=parsed.source,
        )
        return jsonify(result)
    except Exception as e:
        app.logger.error(f"Translation failed: {e}")
        return jsonify(ErrorResponse(error=str(e)).model_dump()), 502


# Frontend routes (production only — built Vite output)
if _has_frontend:
    @app.route("/")
    def index():
        return send_from_directory(FRONTEND_DIST, "index.html")

    @app.route("/assets/<path:filename>")
    def serve_assets(filename):
        return send_from_directory(
            os.path.join(FRONTEND_DIST, "assets"), filename
        )

    @app.route("/<path:path>")
    def serve_frontend_fallback(path):
        # Don't swallow API 404s — return JSON error
        if path.startswith("api/"):
            return jsonify(ErrorResponse(error="Not found").model_dump()), 404
        return send_from_directory(FRONTEND_DIST, "index.html")


if __name__ == "__main__":
    debug = FLASK_ENV == "development"
    app.run(host="0.0.0.0", port=5000, debug=debug)
