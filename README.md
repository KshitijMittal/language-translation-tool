# Language Translation Tool

A modern, full-stack translation web application built with React, TypeScript, and Flask. Translates text between **130+ languages** using Google Translate — no API key required, no rate limits, no configuration.

![Tech Stack](https://img.shields.io/badge/Frontend-React_19_·_TypeScript_·_Tailwind_CSS_·_Vite-3178C6?logo=react)
![Tech Stack](https://img.shields.io/badge/Backend-Python_·_Flask_·_Pydantic-3776AB?logo=python)
![Build](https://img.shields.io/github/actions/workflow/status/your-username/language-translation-tool/ci.yml?branch=main&label=CI)

---

## Features

- **Translate text** between 130+ languages with auto-detection or manual source selection
- **Real-time translation** via the Google Translate API — free, no API key needed
- **Text-to-speech** with sound wave animation for translated output
- **Translation history** — last 20 entries stored locally in your browser
- **Copy to clipboard** with visual confirmation
- **Swap languages** instantly with one click
- **Dark mode** — manually toggle or follows system preference
- **Responsive design** — works on desktop, tablet, and mobile
- **Keyboard shortcuts** — `Ctrl+Enter` to translate

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 4 | UI framework and styling |
| **State** | React Query (@tanstack/react-query) | API caching and mutation state |
| **Backend** | Python, Flask, Pydantic | REST API and request validation |
| **Translation** | Google Translate API (unofficial endpoint) | Text translation + auto-detection |
| **Language detection** | `langdetect` | Server-side language auto-detection |
| **Production server** | Gunicorn | WSGI server for production |

---

## Project Structure

```
language-translation-tool/
├── backend/
│   ├── app.py                 # Flask application (API + static file serving)
│   ├── translator.py          # Google Translate API client + text splitting
│   ├── schemas.py             # Pydantic request/response validation
│   ├── tests/
│   │   ├── conftest.py        # Pytest fixtures and mocks
│   │   └── test_app.py        # 9 tests covering all endpoints
│   ├── .env.example           # Environment variable template
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/        # React components (8 total)
│   │   ├── hooks/             # Custom hooks (useLanguages, useTranslation, useHistory, useTheme)
│   │   ├── services/          # API client
│   │   └── types.ts           # TypeScript type definitions
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── .gitignore
├── Dockerfile                 # Multi-stage container build
└── README.md
```

---

## Local Development

### Prerequisites

- **Node.js** 22+ and **npm**
- **Python** 3.10+
- **Git**

### 1. Clone and set up the backend

```bash
cd backend
python -m venv .venv           # Create virtual environment

# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt

# Optional: create .env for development mode
echo FLASK_ENV=development > .env

python app.py
```

The backend starts on **http://localhost:5000**.

### 2. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:5173** — open this in your browser.

> **Note:** During development, Vite proxies `/api` and `/health` requests to the Flask backend on port 5000.

### 3. Run tests

```bash
# Backend tests (9 tests)
cd backend
pytest tests/ -v

# Frontend type check
cd frontend
npx tsc --noEmit
```

---

## Deployment

### Deploy to Render (recommended)

Render is a cloud platform that makes deployment straightforward with a generous free tier.

#### Step 1: Push your code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/language-translation-tool.git
git push -u origin main
```

#### Step 2: Create a Render Web Service

1. Log in to [render.com](https://render.com) (sign up with GitHub)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:

| Setting | Value |
|---|---|
| **Name** | `language-translation-tool` |
| **Environment** | `Python 3` |
| **Build Command** | `pip install -r backend/requirements.txt && cd frontend && npm install && npm run build` |
| **Start Command** | `gunicorn --chdir backend app:app` |
| **Plan** | `Free` |

5. Click **Create Web Service**

#### Step 3: Wait for the build

Render will automatically:
1. Install Python dependencies
2. Install Node.js dependencies
3. Build the React frontend (`frontend/dist/`)
4. Start the Flask server with Gunicorn

Your app will be live at `https://language-translation-tool.onrender.com` (the name you chose + `.onrender.com`).

> **Note:** Free-tier Render services spin down after 15 minutes of inactivity. The first request after idle takes ~10 seconds to wake up. This is normal.

### Deploy with Docker

```bash
docker build -t translation-tool .
docker run -p 8000:8000 translation-tool
```

---

## API Reference

The backend exposes three endpoints:

### `GET /health`
Returns service health status.

```json
{ "status": "healthy", "version": "1.0.0" }
```

### `GET /api/languages`
Returns supported languages as a code-to-name dictionary.

```json
{ "languages": { "en": "English", "fr": "French", "es": "Spanish", ... } }
```

### `POST /api/translate`
Translates text from one language to another.

**Request:**
```json
{
  "text": "Hello world",
  "target": "fr",
  "source": "en"     // optional — omit for auto-detect
}
```

**Response:**
```json
{
  "translatedText": "Bonjour le monde",
  "detectedLanguage": "en"     // only present when source was auto-detected
}
```

---

## Design Decisions

| Decision | Rationale |
|---|---|
| **Google Translate API** (unofficial) | No API key needed, no daily limits, higher accuracy than MyMemory, handles larger text chunks (1800 bytes vs 400 bytes) |
| **Text chunking** | Long texts are split at paragraph boundaries, then at sentence boundaries, ensuring each API call stays within URL length limits |
| **localStorage for history** | Zero infrastructure — works offline, survives page refreshes, no database needed for a personal tool |
| **Inline `<style>` for wave animation** | Bypasses Tailwind CSS pipeline issues with custom keyframe animations |
| **React Query mutations** | Automatic retry, error tracking, and loading state management without manual state handling |

---

## Future Possibilities

- User accounts and server-side history
- Document translation (PDF, DOCX)
- Translation memory for frequently used phrases
- Integration with other translation providers (DeepL, Azure)
