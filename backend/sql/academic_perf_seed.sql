-- Smart Academic Performance Prediction System
-- PostgreSQL seed data script
-- Safe to re-run: users are upserted, sample students/performance/predictions are inserted if missing

BEGIN;

-- Seed users
INSERT INTO users (username, password_hash, role)
VALUES
    (
        'admin_seed',
        'scrypt:32768:8:1$S0KhG3vT7h6TSTdl$f027d4e017b439f125993f329c186c3645d5de1d5cd79c32250c1295093c04101fa32589b688c35fb31e48b289201b356969e3f7c4684450d45e2ae8255d4b9a',
        'admin'
    ),
    (
        'teacher_seed',
        'scrypt:32768:8:1$JWUDvEx6rhK6E4gq$b6e79731ca7be99b004bf0ff9f477fde89ac8e243c6dfb4e5e4dffc04c7065f4cc526135625995e0340f2c25186ca12f42032de4cdca678f68201d3c3d45a438',
        'teacher'
    )
ON CONFLICT (username) DO UPDATE
SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;

-- Seed students
INSERT INTO students (name, age, course)
SELECT 'Alice Johnson', 20, 'Computer Science'
WHERE NOT EXISTS (
    SELECT 1 FROM students WHERE name = 'Alice Johnson' AND course = 'Computer Science'
);

INSERT INTO students (name, age, course)
SELECT 'Brian Santos', 21, 'Information Technology'
WHERE NOT EXISTS (
    SELECT 1 FROM students WHERE name = 'Brian Santos' AND course = 'Information Technology'
);

INSERT INTO students (name, age, course)
SELECT 'Carla Reyes', 19, 'Data Science'
WHERE NOT EXISTS (
    SELECT 1 FROM students WHERE name = 'Carla Reyes' AND course = 'Data Science'
);

-- Seed performance records
INSERT INTO performance (student_id, attendance, quiz_score, assignment_score, study_hours, created_at)
SELECT s.id, 92, 88, 90, 14, NOW()
FROM students s
WHERE s.name = 'Alice Johnson'
  AND NOT EXISTS (
      SELECT 1
      FROM performance p
      WHERE p.student_id = s.id
        AND p.attendance = 92
        AND p.quiz_score = 88
        AND p.assignment_score = 90
        AND p.study_hours = 14
  );

INSERT INTO performance (student_id, attendance, quiz_score, assignment_score, study_hours, created_at)
SELECT s.id, 68, 62, 64, 7, NOW()
FROM students s
WHERE s.name = 'Brian Santos'
  AND NOT EXISTS (
      SELECT 1
      FROM performance p
      WHERE p.student_id = s.id
        AND p.attendance = 68
        AND p.quiz_score = 62
        AND p.assignment_score = 64
        AND p.study_hours = 7
  );

INSERT INTO performance (student_id, attendance, quiz_score, assignment_score, study_hours, created_at)
SELECT s.id, 58, 52, 49, 4, NOW()
FROM students s
WHERE s.name = 'Carla Reyes'
  AND NOT EXISTS (
      SELECT 1
      FROM performance p
      WHERE p.student_id = s.id
        AND p.attendance = 58
        AND p.quiz_score = 52
        AND p.assignment_score = 49
        AND p.study_hours = 4
  );

-- Seed predictions
INSERT INTO predictions (
    student_id,
    predicted_grade,
    risk_level,
    confidence,
    failure_probability,
  recommendations,
  created_at
)
SELECT s.id, 'A', 'Low', 0.93, 0.02, 'Maintain current performance and continue consistent learning habits', NOW()
FROM students s
WHERE s.name = 'Alice Johnson'
  AND NOT EXISTS (
      SELECT 1
      FROM predictions pr
      WHERE pr.student_id = s.id
        AND pr.predicted_grade = 'A'
        AND pr.risk_level = 'Low'
  );

INSERT INTO predictions (
    student_id,
    predicted_grade,
    risk_level,
    confidence,
    failure_probability,
  recommendations,
  created_at
)
SELECT s.id, 'C', 'Medium', 0.81, 0.43, 'Increase weekly study time by 2-4 hours||Improve attendance to above 80%', NOW()
FROM students s
WHERE s.name = 'Brian Santos'
  AND NOT EXISTS (
      SELECT 1
      FROM predictions pr
      WHERE pr.student_id = s.id
        AND pr.predicted_grade = 'C'
        AND pr.risk_level = 'Medium'
  );

INSERT INTO predictions (
    student_id,
    predicted_grade,
    risk_level,
    confidence,
    failure_probability,
  recommendations,
  created_at
)
SELECT s.id, 'Fail', 'High', 0.89, 0.77, 'Schedule a counseling session with the teacher immediately||Improve attendance to above 80%', NOW()
FROM students s
WHERE s.name = 'Carla Reyes'
  AND NOT EXISTS (
      SELECT 1
      FROM predictions pr
      WHERE pr.student_id = s.id
        AND pr.predicted_grade = 'Fail'
        AND pr.risk_level = 'High'
  );

COMMIT;
