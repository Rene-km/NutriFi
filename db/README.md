# Database

This directory contains the database configuration and schema definitions for the project using Drizzle ORM with the PostgresSQL database from Supbabase.

## Overview

This module provides:
- Database connection setup
- Schema definitions using Drizzle ORM
- Migration configuration

## Files

- **`index.tsx`** - Database connection initialization. Exports a configured Drizzle instance connected to PostgreSQL.
- **`schema.tsx`** - Database schema definitions. File is used to define schema for the database tables.
- **`drizzle.config.ts`** - Drizzle configuration for migrations and schema management. Contains information about database connection. Configured to use PostgreSQL and migrations are output to `./drizzle`.


## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Create a `.env` file in the parent or current directory or ensure `DATABASE_URL` is set in the environment
   - Format: `DATABASE_URL="postgresql://postgres.lmpapgcnyukbwhhfiecn:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`

## Usage

Import the database instance and schema:

```typescript
import { db } from './db/index';
import { users } from './db/schema';
```

## Dependencies

- **drizzle-orm** - TypeScript ORM for SQL databases
- **postgres** - PostgreSQL client for Node.js
- **drizzle-kit** - CLI tool for migrations and schema management
- **dotenv** - Environment variable management


## Migrations

You can generate migrations using drizzle-kit generate command and then run them using the drizzle-kit migrate command.
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```
