# Academic Performance Prediction System (Flask + ML)

Production-ready Flask backend for academic performance prediction, at-risk detection, analytics, and recommendations.

## Features

- JWT authentication with roles: `admin`, `teacher`, `student`
- Student CRUD + bulk CSV upload
- Performance records API
- ML prediction endpoint (Random Forest)
- Automatic risk classification: `Low`, `Medium`, `High`
- Rule-based recommendation engine
- Analytics APIs (class average, top performers, pass/fail ratio, trends)
- JSON report endpoint per student
- PostgreSQL integration with SQLAlchemy + Flask-Migrate

## Tech Stack

- Flask, Flask-SQLAlchemy, Flask-Migrate, Flask-JWT-Extended
- scikit-learn, pandas, numpy, joblib
- PostgreSQL
- Docker (optional)

## Project Structure

```text
backend/
  app/
    __init__.py
    models/
    routes/
    services/
    ml/
    utils/
  config.py
  run.py
  requirements.txt
```

## Setup (Windows PowerShell)

1. Create and activate virtual environment:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Configure environment:

```powershell
Copy-Item .env.example .env
```

4. Create PostgreSQL database:

- Database name: `academic_perf_db`
- Update `DATABASE_URL` in `.env` if needed.

5. Initialize migrations:

```powershell
$env:FLASK_APP = "run.py"
flask db init
flask db migrate -m "initial schema"
flask db upgrade
```

6. Train model:

```powershell
python -m app.ml.train_model --data app/ml/sample_students_dataset.csv
```

7. Run API:

```powershell
python run.py
```

8. Import schema SQL (alternative to migrations):

```powershell
psql -U postgres -d academic_perf_db -f sql/academic_perf_schema.sql
```

9. Import seed data:

```powershell
psql -U postgres -d academic_perf_db -f sql/academic_perf_seed.sql
```

Health endpoint:

- `GET /health`

## API Endpoints

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Students

- `GET /students`
- `POST /students`
- `POST /students/bulk-upload` (CSV)
- `PUT /students/<id>`
- `DELETE /students/<id>`

### Performance

- `POST /performance`
- `GET /performance/<student_id>`

### Prediction

- `POST /predict/<student_id>`
- `GET /predictions`

### Analytics

- `GET /analytics/overview`
- `GET /analytics/at-risk`

### Reports

- `GET /reports/students/<student_id>`

## Postman Collection

- Import: `postman/AcademicPerformanceAPI.postman_collection.json`
- Set collection variables as needed (`baseUrl`, `teacherUsername`, `teacherPassword`, `adminUsername`, `adminPassword`).

## Automated Smoke Test

Run all core endpoint checks in one command:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run_smoke_test.ps1
```

Optional custom base URL:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run_smoke_test.ps1 -BaseUrl http://127.0.0.1:5000
```

## Sample Payloads

Register user:

```json
{
  "username": "teacher1",
  "password": "StrongPass123!",
  "role": "teacher"
}
```

Create student:

```json
{
  "name": "Alice Doe",
  "age": 20,
  "course": "Computer Science"
}
```

Add performance:

```json
{
  "student_id": 1,
  "attendance": 82,
  "quiz_score": 75,
  "assignment_score": 80,
  "study_hours": 10
}
```

Prediction response (example):

```json
{
  "student_id": 1,
  "predicted_grade": "B",
  "risk_level": "Medium",
  "confidence": 0.82,
  "failure_probability": 0.21,
  "recommendations": ["Increase weekly study time by 2-4 hours"]
}
```
## Docker (Optional)

```powershell
docker compose up --build
```

## Notes

- Secure `JWT_SECRET_KEY` before production.
- Add API docs using Swagger/OpenAPI if required.
- Add Celery/Redis for async retraining or alert notifications.

## Copyright (c) 2026 academic_perf_pre_sys. All rights reserved/