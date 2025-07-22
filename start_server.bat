@echo off
echo Starting FastAPI server for testing...
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
