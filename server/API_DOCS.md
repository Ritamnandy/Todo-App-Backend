# API Documentation

Base URL:

```text
http://localhost:5000
```

Auth routes are mounted under:

```text
/api/v1/auth
```

Todo routes are mounted under:

```text
/api/v1/todos
```

## Authentication

Protected endpoints require a valid access token. Send it using one of these options:

```http
Cookie: accessToken=<token>
```

or:

```http
Authorization: Bearer <token>
```

The API also sets `accessToken` and `refreshToken` as `httpOnly` cookies after login, email verification, token refresh, and Google OAuth login.

## Common Response Shapes

Success:

```json
{
  "statusCode": 200,
  "message": "User logged in successfully",
  "success": true,
  "data": [
    "User logged in successfully",
    {}
  ],
  "error": null
}
```

Error:

```json
{
  "status": 400,
  "message": "All fields are required",
  "error": [
    "All fields are required"
  ],
  "data": null,
  "success": false
}
```

Validation error:

```json
{
  "status": 422,
  "message": "Recived data is not valid",
  "error": [
    {
      "field": "email must be a valid email"
    }
  ],
  "data": null,
  "success": false
}
```

## Auth Endpoints

### Register User

```http
POST /api/v1/auth/register
```

Creates a new email/password user and sends a verification code to the user's email.

Request body:

```json
{
  "firstname": "Ritam",
  "lastname": "Nandy",
  "email": "ritam@example.com",
  "password": "password123"
}
```

Success response:

```json
{
  "statusCode": 201,
  "message": "User created successfully",
  "success": true,
  "data": [
    "User created successfully, check your email to verify your account"
  ],
  "error": null
}
```

Possible errors:

- `400`: Required fields missing, empty fields, or user already exists.
- `422`: Validation failed.
- `500`: User could not be created.

### Resend Verification Code

```http
POST /api/v1/auth/resend-verification-code
```

Sends a new 6-digit email verification code. The code expires after 5 minutes.

Request body:

```json
{
  "email": "ritam@example.com"
}
```

Success response:

```json
{
  "statusCode": 200,
  "message": "Email sent successfully",
  "success": true,
  "data": [
    "Email sent successfully, check your email to verify your account"
  ],
  "error": null
}
```

Possible errors:

- `400`: Email is missing or empty.
- `404`: User not found.

### Verify Email

```http
POST /api/v1/auth/verify-email
```

Verifies the email OTP, marks the user as verified, and returns token pair data. Also sets `accessToken` and `refreshToken` cookies.

Request body:

```json
{
  "email": "ritam@example.com",
  "code": "123456"
}
```

Success response:

```json
{
  "statusCode": 200,
  "message": "User verified successfully",
  "success": true,
  "data": [
    "User verified successfully",
    {
      "accessToken": "<access-token>",
      "refreshToken": "<refresh-token>",
      "user": {
        "_id": "<user-id>",
        "firstname": "ritam",
        "lastname": "nandy",
        "email": "ritam@example.com",
        "isVerified": true,
        "avatar": "",
        "loginType": "EMAIL_PASSWORD",
        "createdAt": "2026-06-24T00:00:00.000Z",
        "updatedAt": "2026-06-24T00:00:00.000Z"
      }
    }
  ],
  "error": null
}
```

Possible errors:

- `400`: Fields missing, user already verified, invalid code, or expired code.
- `404`: User not found.
- `500`: Token generation failed.

### Login

```http
POST /api/v1/auth/login
```

Logs in a verified email/password user. Also sets `accessToken` and `refreshToken` cookies.

Request body:

```json
{
  "email": "ritam@example.com",
  "password": "password123"
}
```

Success response:

```json
{
  "statusCode": 200,
  "message": "User logged in successfully",
  "success": true,
  "data": [
    "User logged in successfully",
    {
      "accessToken": "<access-token>",
      "refreshToken": "<refresh-token>",
      "user": {
        "_id": "<user-id>",
        "firstname": "ritam",
        "lastname": "nandy",
        "email": "ritam@example.com",
        "avatar": "",
        "loginType": "EMAIL_PASSWORD",
        "createdAt": "2026-06-24T00:00:00.000Z",
        "updatedAt": "2026-06-24T00:00:00.000Z"
      }
    }
  ],
  "error": null
}
```

Possible errors:

- `400`: Required fields missing, user not verified, or invalid credentials.
- `404`: User not found.
- `422`: Validation failed.
- `500`: Token generation failed.

### Refresh Access Token

```http
POST /api/v1/auth/refresh-access-token
```

Generates a fresh access token and refresh token.

Request body:

```json
{
  "refreshToken": "<refresh-token>"
}
```

Success response:

```json
{
  "statusCode": 200,
  "message": "Access token refreshed successfully",
  "success": true,
  "data": [
    "Access token refreshed successfully",
    {
      "accessToken": "<new-access-token>",
      "refreshToken": "<new-refresh-token>"
    }
  ],
  "error": null
}
```

Possible errors:

- `401`: Refresh token missing, invalid, or user not found.
- `500`: Token generation failed.

### Logout

```http
POST /api/v1/auth/logout
```

Protected: Yes

Clears the user's refresh token and removes auth cookies.

Success response:

```json
{
  "statusCode": 200,
  "message": "User logged out successfully",
  "success": true,
  "data": [
    "User logged out successfully"
  ],
  "error": null
}
```

Possible errors:

- `401`: Unauthorized request.

### Set Avatar

```http
POST /api/v1/auth/set-avatar
```

Protected: Yes

Uploads a user avatar to Cloudinary.

Content type:

```text
multipart/form-data
```

Form fields:

```text
avatar: image file
```

Success response:

```json
{
  "statusCode": 200,
  "message": "Image uploaded successfully",
  "success": true,
  "data": [
    "Image uploaded successfully",
    {
      "avatar": "https://res.cloudinary.com/example/image/upload/avatar.jpg"
    }
  ],
  "error": null
}
```

Possible errors:

- `400`: Image is missing.
- `401`: Unauthorized request.
- `500`: Image upload failed.

### Get Current User

```http
GET /api/v1/auth/current-user
```

Protected: Yes

Returns the authenticated user's profile.

Success response:

```json
{
  "statusCode": 200,
  "message": "User found successfully",
  "success": true,
  "data": [
    "User found successfully",
    {
      "user": {
        "_id": "<user-id>",
        "firstname": "ritam",
        "lastname": "nandy",
        "email": "ritam@example.com",
        "isVerified": true,
        "avatar": "",
        "loginType": "EMAIL_PASSWORD",
        "createdAt": "2026-06-24T00:00:00.000Z",
        "updatedAt": "2026-06-24T00:00:00.000Z"
      }
    }
  ],
  "error": null
}
```

Possible errors:

- `401`: Unauthorized request.

### Get All Todos

```http
GET /api/v1/auth/get-all-todo
```

Protected: Yes

Returns the authenticated user's todos with nested sub-todos.

Success response:

```json
{
  "statusCode": 200,
  "message": "Todo found successfully",
  "success": true,
  "data": [
    "Todo found successfully",
    {
      "todos": [
        {
          "_id": "<user-id>",
          "todo": [
            {
              "_id": "<todo-id>",
              "title": "Today",
              "color": "#ff0000",
              "isCompleted": false,
              "subtodo": [
                {
                  "_id": "<sub-todo-id>",
                  "content": "Read docs",
                  "isCompleted": false
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "error": null
}
```

Possible errors:

- `401`: Unauthorized request.
- `404`: Todo not found.

### Google OAuth Login

Start Google login:

```http
GET /api/v1/auth/google
```

OAuth callback:

```http
GET /api/v1/auth/google/callback
```

The callback creates or finds the user, generates tokens, sets auth cookies, and returns the logged-in user response.

Possible errors:

- Redirects to `/login` on Passport authentication failure.
- `401`: User not found.
- `500`: Token generation failed or user lookup failed.

### Forget Password

```http
POST /api/v1/auth/forget-password
```

Current implementation status: placeholder.

Response:

```text
forget password
```

## Todo Endpoints

All todo endpoints are protected.

### Add Todo Title

```http
POST /api/v1/todos/add-todo-title
```

Request body:

```json
{
  "title": "Today",
  "color": "#ff0000"
}
```

Success response:

```json
{
  "statusCode": 201,
  "message": "Todo created successfully",
  "success": true,
  "data": [
    "Todo created successfully",
    {
      "todo": {
        "_id": "<todo-id>",
        "title": "Today",
        "color": "#ff0000",
        "isCompleted": false,
        "createdBy": "<user-id>",
        "createdAt": "2026-06-24T00:00:00.000Z",
        "updatedAt": "2026-06-24T00:00:00.000Z"
      }
    }
  ],
  "error": null
}
```

Possible errors:

- `400`: Title or color missing.
- `401`: Unauthorized request.
- `500`: Todo not created.

### Update Todo Title

```http
PATCH /api/v1/todos/update-todo-title/:id
```

Path params:

- `id`: Todo ID.

Request body:

```json
{
  "title": "Work",
  "color": "#00ff00"
}
```

You can send `title`, `color`, or both.

Success response:

```json
{
  "statusCode": 200,
  "message": "Todo updated successfully",
  "success": true,
  "data": [
    "Todo updated successfully",
    {
      "todo": {}
    }
  ],
  "error": null
}
```

Possible errors:

- `400`: Todo ID missing or update fields missing.
- `404`: Todo not found.

### Complete Todo Title

```http
PATCH /api/v1/todos/complete-todo-title/:id
```

Path params:

- `id`: Todo ID.

Request body:

```json
{
  "isCompleted": true
}
```

Success response:

```json
{
  "statusCode": 200,
  "message": "Todo completed successfully",
  "success": true,
  "data": [
    "Todo completed successfully",
    {
      "todo": {}
    }
  ],
  "error": null
}
```

Possible errors:

- `400`: Todo ID or `isCompleted` missing.
- `404`: Todo not found.

### Delete Todo Title

```http
DELETE /api/v1/todos/delete-todo-title/:id
```

Path params:

- `id`: Todo ID.

Success response:

```json
{
  "statusCode": 200,
  "message": "Todo deleted successfully",
  "success": true,
  "data": [
    "Todo deleted successfully"
  ],
  "error": null
}
```

Possible errors:

- `400`: Todo ID missing.
- `401`: Unauthorized request.

## Sub-Todo Endpoints

All sub-todo endpoints are protected.

### Add Sub-Todo

```http
POST /api/v1/todos/add-sub-todo/:id
```

Path params:

- `id`: Parent todo ID.

Request body:

```json
{
  "content": "Read docs"
}
```

Success response:

```json
{
  "statusCode": 201,
  "message": "Sub todo created successfully",
  "success": true,
  "data": [
    "Sub todo created successfully",
    {
      "subTodo": {
        "_id": "<sub-todo-id>",
        "content": "Read docs",
        "isCompleted": false,
        "todo": "<todo-id>",
        "createdBy": "<user-id>",
        "createdAt": "2026-06-24T00:00:00.000Z",
        "updatedAt": "2026-06-24T00:00:00.000Z"
      }
    }
  ],
  "error": null
}
```

Possible errors:

- `400`: Todo ID or content missing.
- `401`: Unauthorized request.
- `500`: Sub-todo not created.

### Update Sub-Todo

```http
PATCH /api/v1/todos/update-sub-todo/:id
```

Path params:

- `id`: Sub-todo ID.

Request body:

```json
{
  "content": "Read API docs"
}
```

Success response:

```json
{
  "statusCode": 200,
  "message": "Sub todo updated successfully",
  "success": true,
  "data": [
    "Sub todo updated successfully",
    {
      "subTodo": {}
    }
  ],
  "error": null
}
```

Possible errors:

- `400`: Content missing.
- `404`: Sub-todo not found.

### Complete Sub-Todo

```http
PATCH /api/v1/todos/complete-sub-todo/:id
```

Path params:

- `id`: Sub-todo ID.

Request body:

```json
{
  "isCompleted": true
}
```

Success response:

```json
{
  "statusCode": 200,
  "message": "Sub todo completed successfully",
  "success": true,
  "data": [
    "Sub todo completed successfully",
    {
      "subTodo": {}
    }
  ],
  "error": null
}
```

Possible errors:

- `400`: `isCompleted` missing.
- `404`: Sub-todo not found.

### Delete Sub-Todo

```http
DELETE /api/v1/todos/delete-sub-todo/:id
```

Path params:

- `id`: Sub-todo ID.

Success response:

```json
{
  "statusCode": 200,
  "message": "Sub todo deleted successfully",
  "success": true,
  "data": [
    "Sub todo deleted successfully"
  ],
  "error": null
}
```

Possible errors:

- `400`: Sub-todo ID missing.

## Data Models

### User

```json
{
  "firstname": "string",
  "lastname": "string",
  "email": "string",
  "password": "string",
  "googleId": "string",
  "isVerified": "boolean",
  "avatar": "string",
  "loginType": "EMAIL_PASSWORD | GOOGLE",
  "refreshToken": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Todo

```json
{
  "title": "string",
  "color": "string",
  "isCompleted": "boolean",
  "createdBy": "User ObjectId",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### SubTodo

```json
{
  "content": "string",
  "isCompleted": "boolean",
  "todo": "Todo ObjectId",
  "createdBy": "User ObjectId",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Rate Limit

The server allows 100 requests per IP every 5 minutes. When the limit is exceeded, the API returns:

```json
{
  "status": 429,
  "message": "Too many requests",
  "error": [
    "Too many requests"
  ],
  "data": null,
  "success": false
}
```
