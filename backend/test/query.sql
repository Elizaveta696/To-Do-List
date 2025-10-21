-- Create a dev user
CREATE USER devuser WITH PASSWORD 'devpass';

-- Create a dev database
CREATE DATABASE task_manager_dev;

-- Give privileges
GRANT ALL PRIVILEGES ON DATABASE task_manager_dev TO devuser;