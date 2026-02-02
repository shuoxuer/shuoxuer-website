# Badminton AI Coach (羽毛球 AI 智能私教平台)

Based on Design Document v2.0.

## Project Structure

- `frontend/`: Next.js 14 Web Application
- `backend/`: FastAPI Python Server

## Prerequisites

- Node.js 18+
- Python 3.10+
- Google Gemini API Key

## Setup & Run

### Backend

1. Navigate to `backend/`
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create `.env` file in `backend/` and add your API key:
   ```
   GOOGLE_API_KEY=your_api_key_here
   ```
4. Run server:
   ```bash
   uvicorn app.main:app --reload
   ```
   API Docs available at: `http://localhost:8000/docs`

### Frontend

1. Navigate to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`

## Features Implemented

- **Virtual Coach Matrix**: Architecture for Hu (Technique), Li (Strategy), and An (Support).
- **Video Studio UI**: Interface for uploading and analyzing videos.
- **Dark Mode**: Professional "stadium" atmosphere UI.
- **Tech Stack**: Next.js (App Router), Tailwind CSS, FastAPI, Google Gemini integration ready.
