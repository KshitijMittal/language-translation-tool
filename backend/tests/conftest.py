from unittest.mock import patch

import pytest

from app import app as flask_app


@pytest.fixture
def app():
    flask_app.config["TESTING"] = True
    yield flask_app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def mock_google_translate():
    with patch("translator.requests.get") as mock_get, \
         patch("translator.detect_lang") as mock_detect:
        yield mock_get, mock_detect
