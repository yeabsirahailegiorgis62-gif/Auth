# Auth System

A Node.js/Express authentication service with PostgreSQL, Prisma, JWT, and session-based refresh tokens.

## Project purpose

This project provides a backend authentication foundation for registering users, logging in, issuing access and refresh tokens, and protecting routes with JWT middleware.

## Architecture

- Express app entrypoint in src/app.js and src/server.js
- Route handlers in src/routes/
- Controller logic in src/controllers/
- Prisma client setup in src/config/database.js
- JWT helpers in src/utils/jwt.js
- Protected route middleware in src/middleware/auth.middleware.js

## Technology stack

- Node.js
- Express
- PostgreSQL
- Prisma ORM
- JWT (jsonwebtoken)
- bcrypt
- zod
- Helmet, CORS, rate limiting

## Folder structure

- src/app.js - Express app setup
- src/server.js - HTTP server startup
- src/routes/ - API routes
- src/controllers/ - Business logic
- src/middleware/ - Auth middleware
- src/config/ - Database configuration
- prisma/ - Prisma schema and migrations
- tests/ - API regression tests

## Installation

```bash
npm install
```

## Environment

Create a .env file with:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/auth_system"
JWT_SECRET="your_access_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
```

## Run locally

```bash
npm run dev
```

## API endpoints

### Auth

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- POST /api/auth/logout-all

### Protected route

- GET /api/user/profile

## Testing

```bash
npm test
```

## Example curl commands

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Secret123!"}'

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Secret123!"}'

curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'

curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'

curl -X POST http://localhost:5000/api/auth/logout-all \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
