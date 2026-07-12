# Project Plan

## Overview

A web-based language translation tool with text-to-speech, history, and dark mode. Built as a portfolio project to demonstrate full-stack development skills with React/TypeScript and Python/Flask.

## Current Status — v1.0

- ✅ Text translation (130+ languages, auto-detect support)
- ✅ Text-to-speech with wave animation
- ✅ Translation history (localStorage, last 20 entries)
- ✅ Copy to clipboard
- ✅ Language swap
- ✅ Dark mode
- ✅ Responsive desktop + mobile layout
- ✅ Keyboard shortcut (Ctrl+Enter)
- ✅ Google Translate API backend (no key required)
- ✅ Chunked translation for long texts
- ✅ CI pipeline (GitHub Actions)
- ✅ Docker build
- ✅ 9 backend tests, TypeScript-clean frontend

## Architecture

```
Browser → Flask (Gunicorn) → Google Translate API
              ↓
         frontend/dist/ (static files)
```

In production, Flask serves both the API and the built React frontend from the same domain. In development, Vite's proxy forwards API calls to Flask.

## Next Steps (v1.1+)

- [ ] **Deploy** to Render.com for public access
- [ ] Add rate limiting / caching to reduce API calls
- [ ] Add user accounts and server-side history
- [ ] Add document translation (PDF, DOCX upload)
- [ ] Add multiple translation provider support (DeepL, Azure)
- [ ] Add PWA support for offline usage
- [ ] Add accessibility audit and ARIA improvements
