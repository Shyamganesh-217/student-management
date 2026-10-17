# Database Setup Guide - PostgreSQL (`student_db`)

This guide explains how to set up the PostgreSQL database `student_db` and execute the schema script.

---

## 1. Prerequisites
- **PostgreSQL 14+** (PostgreSQL 16 or 18 recommended) installed and running.
- Default port: `5432`
- Default superuser: `postgres`

---

## 2. Option A: Setup Using PostgreSQL CLI (`psql`)

### Step 1: Open Terminal (PowerShell / Command Prompt)

### Step 2: Create the Database
```powershell
# Set your postgres password environment variable if needed
$env:PGPASSWORD="your_postgres_password"

# Connect and create database
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE student_db;"
```

*(On Linux / macOS / standard PATH: `createdb -U postgres student_db` or `psql -U postgres -c "CREATE DATABASE student_db;"`)*

### Step 3: Run the Schema Script
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d student_db -f ".\schema.sql"
```

### Step 4: Verify the Table
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d student_db -c "\d students"
```

---

## 3. Option B: Setup Using pgAdmin 4 (GUI)

1. Open **pgAdmin 4** from your Start Menu.
2. Connect to your local PostgreSQL server by entering the master password.
3. In the left browser tree:
   - Right-click on **Databases** -> **Create** -> **Database...**
   - Database name: `student_db`
   - Click **Save**.
4. Select `student_db` in the tree.
5. In the top toolbar, click **Tools** -> **Query Tool**.
6. Open the `schema.sql` file (or copy/paste its contents into the Query Editor).
7. Click the **Execute / Run** button (Play icon / F5).
8. You will see `CREATE TABLE`, `CREATE INDEX` completed successfully.

---

## 4. Schema Details (`students` Table)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Auto-incrementing identifier |
| `name` | `VARCHAR(150)` | `NOT NULL` | Full student or admin name |
| `email` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | Unique email address |
| `password` | `VARCHAR(255)` | `NOT NULL` | BCrypt hash of password |
| `role` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'STUDENT'` | Security role (`STUDENT` or `ADMIN`) |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL, DEFAULT CURRENT_TIMESTAMP` | Registration timestamp |

> [!NOTE]
> The admin account is NOT seeded via plain SQL with hardcoded credentials. Instead, the backend automatically initializes or synchronizes the authorized administrator securely from the backend `.env` variables (`ADMIN_EMAIL` and `ADMIN_PASSWORD`) using BCrypt on application startup.
