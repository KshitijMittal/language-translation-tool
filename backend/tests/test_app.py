import json


class TestHealth:
    def test_health_returns_200(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["status"] == "healthy"
        assert data["version"] == "1.0.0"


class TestLanguages:
    def test_get_languages_returns_sorted_list(self, client):
        resp = client.get("/api/languages")
        assert resp.status_code == 200
        data = resp.get_json()
        assert "languages" in data
        assert data["languages"]["en"] == "English"
        assert data["languages"]["hi"] == "Hindi"
        assert data["languages"]["fr"] == "French"
        keys = list(data["languages"].keys())
        assert keys == sorted(keys)


class TestTranslate:
    def test_translate_with_source(self, client, mock_google_translate):
        mock_get, mock_detect = mock_google_translate
        mock_get.return_value.status_code = 200
        # Google Translate response format: [[["translated","original",null,null,N]],null,"detected_lang",...]
        mock_get.return_value.json.return_value = [
            [["Bonjour", "Hello", None, None, 10]],
            None,
            "en",
        ]

        resp = client.post(
            "/api/translate",
            content_type="application/json",
            data=json.dumps({"text": "Hello", "target": "fr", "source": "en"}),
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["translatedText"] == "Bonjour"
        assert "detectedLanguage" not in data
        mock_detect.assert_not_called()

    def test_translate_auto_detect(self, client, mock_google_translate):
        mock_get, mock_detect = mock_google_translate
        mock_detect.return_value = "en"
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [
            [["Bonjour", "Hello", None, None, 10]],
            None,
            "en",
        ]

        resp = client.post(
            "/api/translate",
            content_type="application/json",
            data=json.dumps({"text": "Hello", "target": "fr"}),
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["translatedText"] == "Bonjour"
        assert data["detectedLanguage"] == "en"
        mock_detect.assert_called_once_with("Hello")

    def test_translate_missing_text_returns_400(self, client):
        resp = client.post(
            "/api/translate",
            content_type="application/json",
            data=json.dumps({"target": "fr"}),
        )
        assert resp.status_code == 400

    def test_translate_empty_text_returns_400(self, client):
        resp = client.post(
            "/api/translate",
            content_type="application/json",
            data=json.dumps({"text": "", "target": "fr"}),
        )
        assert resp.status_code == 400

    def test_translate_handles_api_error(self, client, mock_google_translate):
        mock_get, _ = mock_google_translate
        mock_get.side_effect = Exception("API error")

        resp = client.post(
            "/api/translate",
            content_type="application/json",
            data=json.dumps({"text": "Hello", "target": "fr"}),
        )
        assert resp.status_code == 502

    def test_translate_handles_bad_status(self, client, mock_google_translate):
        mock_get, _ = mock_google_translate
        mock_get.return_value.status_code = 503

        resp = client.post(
            "/api/translate",
            content_type="application/json",
            data=json.dumps({"text": "Hello", "target": "fr"}),
        )
        assert resp.status_code == 502
        data = resp.get_json()
        assert "503" in data["error"]

    def test_translate_handles_empty_response(self, client, mock_google_translate):
        mock_get, _ = mock_google_translate
        mock_get.return_value.status_code = 200
        # Empty segments array
        mock_get.return_value.json.return_value = [[], None, "en"]

        resp = client.post(
            "/api/translate",
            content_type="application/json",
            data=json.dumps({"text": "Hello", "target": "fr"}),
        )
        assert resp.status_code == 502
