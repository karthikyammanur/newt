web: cd backend && uvicorn app.main:app --host=0.0.0.0 --port=$PORT
worker: cd backend && python -m app.utils.prefetch_job
