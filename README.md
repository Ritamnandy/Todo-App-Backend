# Todo App Backend

A TypeScript, Express, MongoDB, and Redis backend for a Todo application. It supports email/password registration with OTP email verification, Google OAuth login, JWT cookie authentication, todo lists, sub-todos, avatar upload through Cloudinary, rate limiting, compression, and background email jobs with BullMQ.

## Tech Stack

- Node.js with TypeScript
- Express 5
- MongoDB with Mongoose
- Redis with ioredis
- BullMQ for email background jobs
- JWT authentication
- Passport Google OAuth 2.0
- Multer and Cloudinary for avatar uploads
- Nodemailer and Mailgen for emails
- Docker Compose for local MongoDB and Redis

## Project Structure

```text
.
└── server
    ├── Dockerfile
    ├── docker-compose.yml
    ├── package.json
    ├── tsconfig.json
    └── src
        ├── app.ts
        ├── index.ts
        ├── constants.ts
        ├── config
        │   └── env.config.ts
        ├── controllers
        │   ├── todo.controllers.ts
        │   └── user.controllers.ts
        ├── db
        │   ├── connect.db.ts
        │   └── redis.db.ts
        ├── jobs
        │   ├── queue.jobs.ts
        │   └── worker.jobs.ts
        ├── middlewares
        │   ├── auth.middlewares.ts
        │   └── multer.middlewares.ts
        ├── models
        │   ├── sub_todo.models.ts
        │   ├── todo.models.ts
        │   └── user.models.ts
        ├── passport
        │   └── oauth.ts
        ├── routes
        │   ├── todo.routes.ts
        │   └── user.routes.ts
        ├── utils
        │   ├── apierror.ts
        │   ├── apiresponse.ts
        │   ├── asynchandler.ts
        │   ├── cloudinary.upload.ts
        │   └── mail.ts
        └── validators
            ├── auth
            │   └── user.validators.ts
            └── validate.ts
```

## Folder Description

- `src/index.ts`: Application entry point. Loads environment variables, connects MongoDB, and starts the Express server.
- `src/app.ts`: Express app configuration, middleware setup, rate limiting, Passport setup, and route mounting.
- `src/config`: Environment loading configuration.
- `src/controllers`: Request handlers for authentication, users, todos, and sub-todos.
- `src/db`: MongoDB and Redis connection setup.
- `src/jobs`: BullMQ queue and worker for sending verification emails.
- `src/middlewares`: JWT authentication and file upload middleware.
- `src/models`: Mongoose schemas for users, todos, and sub-todos.
- `src/passport`: Google OAuth strategy configuration.
- `src/routes`: API route definitions.
- `src/utils`: Shared helpers for responses, errors, async handlers, mail, and Cloudinary uploads.
- `src/validators`: Request validation rules and validation error middleware.

## Main Features

- Register users with `firstname`, `lastname`, `email`, and `password`.
- Send a 6-digit verification code by email.
- Store verification OTPs in Redis with a 5-minute expiry.
- Verify email and issue access/refresh tokens.
- Login with email/password after verification.
- Login/signup with Google OAuth.
- Store JWTs in `httpOnly` cookies.
- Refresh access tokens.
- Upload user avatars to Cloudinary.
- Create, update, complete, and delete todo titles.
- Create, update, complete, and delete sub-todos.
- Fetch all todos for the current user with nested sub-todos.

## Prerequisites

- Node.js 22 or newer is recommended because the Dockerfile uses `node:22-alpine`.
- npm
- MongoDB
- Redis
- Gmail app password or another Gmail-compatible app password setup
- Cloudinary account
- Google OAuth credentials, if Google login is enabled

## Environment Variables

Create `server/.env`:

```env
PORT=5000
CORS_ORIGIN=http://localhost:3000
SESSION_SECRET=your_session_secret

MONGODB_URL=mongodb://localhost:27017

REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

JWT_TOKEN_SECRET=your_access_token_secret
JWT_TOKEN_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d

EMAIL=your_email@gmail.com
APP_PASSWORD=your_gmail_app_password

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
```

## Installation

```bash
cd server
npm install
```

## Run Locally

Start MongoDB and Redis with Docker Compose:

```bash
cd server
docker compose up -d
```

If the external Docker volumes do not exist yet, create them first:

```bash
docker volume create redis-data
docker volume create mongodb-data
```

Run the development server:

```bash
npm run dev
```

The server runs on:

```text
http://localhost:5000
```

or the value provided in `PORT`.

## Build and Start

```bash
cd server
npm run build
npm start
```

`npm start` runs `nodemon dist/index.js`, so build the TypeScript project before starting.

## Docker

Build the backend image from the `server` folder:

```bash
docker build -t todo-app-backend .
```

Run the image:

```bash
docker run -p 8000:8000 --env-file .env todo-app-backend
```

The Dockerfile exposes port `8000`, but the app still reads `PORT` from the environment. Set `PORT=8000` when running the container.

## API Base URLs

```text
Auth:  /api/v1/auth
Todos: /api/v1/todos
```

See [API_DOCS.md](./API_DOCS.md) for full endpoint documentation.

## Authentication

Private routes require a valid access token. The server can read it from:

- `accessToken` cookie
- `Authorization` header

Successful login, email verification, refresh, and Google OAuth responses set `accessToken` and `refreshToken` as `httpOnly` cookies.

## Response Format

Success responses follow this shape:

```json
{
  "statusCode": 200,
  "message": "Success message",
  "success": true,
  "data": [],
  "error": null
}
```

Error responses follow this shape:

```json
{
  "status": 400,
  "message": "Error message",
  "error": [],
  "data": null,
  "success": false
}
```

## Notes

- `POST /api/v1/auth/forget-password` is currently a placeholder and returns plain text.
- Email verification codes expire after 5 minutes.
- The app applies a rate limit of 100 requests per IP every 5 minutes.
- Avatar uploads are temporarily stored in `src/public/temp/` before uploading to Cloudinary.
