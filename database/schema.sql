-- ==========================================================
-- Student Authentication & Management Database Schema
-- Database: student_db
-- ==========================================================

-- Drop table if it already exists (useful for clean reinstalls)
DROP TABLE IF EXISTS students CASCADE;

-- Create students table
CREATE TABLE students (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup by email during authentication
CREATE INDEX idx_students_email ON students(email);

-- Index for filtering by role (e.g. for admin stats and queries)
CREATE INDEX idx_students_role ON students(role);

-- Verification query
COMMENT ON TABLE students IS 'Stores registered students and authorized administrator accounts';
COMMENT ON COLUMN students.id IS 'Primary key, auto-incrementing identity';
COMMENT ON COLUMN students.name IS 'Full legal name of the student or administrator';
COMMENT ON COLUMN students.email IS 'Unique email address used for login';
COMMENT ON COLUMN students.password IS 'BCrypt hashed password (never stored in plain text)';
COMMENT ON COLUMN students.role IS 'Security role: STUDENT or ADMIN';
COMMENT ON COLUMN students.created_at IS 'Timestamp when the record was created';
