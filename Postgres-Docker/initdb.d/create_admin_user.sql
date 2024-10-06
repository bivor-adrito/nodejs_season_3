-- create_admin_user.sql

-- Create the admin role
CREATE ROLE admin WITH LOGIN PASSWORD 'admin';

-- Grant the admin user the ability to create databases and roles
ALTER ROLE admin CREATEDB;
ALTER ROLE admin CREATEROLE;

-- Grant admin all privileges on the 'market' database
GRANT ALL PRIVILEGES ON DATABASE market TO admin;