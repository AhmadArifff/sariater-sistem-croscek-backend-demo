-- Add guest role support for existing databases.

DO $$
BEGIN
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE users
        ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'staff', 'guest'));
END $$;
