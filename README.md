# German AI Tutor

A simple web app to help learners practice German with:

- **AI Teacher**: gives mini-lessons, pronunciation and grammar tips.
- **AI Translator**: translates English sentences into beginner German (dictionary-based fallback).

## Run locally

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

## Endpoints

- `POST /api/teacher` with `{ "message": "...", "topic": "greetings|travel|food|grammar" }`
- `POST /api/translate` with `{ "text": "..." }`
- `GET /health`
