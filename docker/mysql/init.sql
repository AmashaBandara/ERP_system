-- Docker entrypoint init: creates the database with utf8mb4 collation.
-- Tables are created by Knex migrations (npm run db:migrate).

CREATE DATABASE IF NOT EXISTS waikkal_erp
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
