-- Update user password
ALTER USER postgres WITH PASSWORD 'postgres';

-- Grant all privileges
ALTER USER postgres WITH SUPERUSER;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "hstore";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
