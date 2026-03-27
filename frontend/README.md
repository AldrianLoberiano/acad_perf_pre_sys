# Academic Performance Frontend

Next.js + TypeScript frontend for the Flask backend APIs.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand
- React Hook Form + Zod
- Recharts

## Setup

1. Install dependencies

```powershell
cd frontend
npm install
```

2. Configure API URL

```powershell
Copy-Item .env.local.example .env.local
```

3. Start frontend

```powershell
npm run dev
```

Frontend URL:

- http://127.0.0.1:3000

## Notes

- Ensure backend API is running at `http://127.0.0.1:5000`.
- Login defaults (if seeded):
  - username: `teacher_seed`
  - password: `TeacherPass123!`
