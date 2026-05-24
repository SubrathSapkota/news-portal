# AI News Platform

A monorepo for an AI-powered news generation platform.

## Structure

```
/frontend   → React + Vite + Tailwind CSS
/backend    → FastAPI + MongoDB + LangGraph
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`

## Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Runs on `http://localhost:8000`

## Environment Variables

Copy `.env.example` to `.env` in the backend directory and fill in your values:

```
MONGO_URI=mongodb://localhost:27017
DB_NAME=news_ai
GROQ_API_KEY=your_groq_api_key
```
backend:
uvicorn main:app --reload --port 8000

