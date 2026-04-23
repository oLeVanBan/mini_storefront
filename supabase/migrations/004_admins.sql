-- Migration 004: Admin users table
-- Replaces env-based ADMIN_USERNAME / ADMIN_PASSWORD_HASH with DB-backed admins table.
-- Password is stored as bcrypt hash (cost=12). Never store plain-text passwords.

CREATE TABLE IF NOT EXISTS admins (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  username      text        NOT NULL UNIQUE,
  password_hash text        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Seed default admin: username=admin, password=admin123
-- Change this password immediately in production!
INSERT INTO admins (username, password_hash) VALUES (
  'admin',
  '$2b$12$bmCbfoMN1Rw93aQn1JLFW.gEUNhOQxliQ50TXe4NI9c0MyFdw4Kfy'
) ON CONFLICT (username) DO NOTHING;

-- No RLS on admins — only service_role (server-side) may query this table.
-- Never expose admins table to anon or authenticated roles.
