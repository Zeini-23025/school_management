# User API — Quick curl tests

This document contains a set of curl examples to test the user-related API endpoints in this project.

Prerequisites
- Start the Django development server from the project root (workspace root):

```bash
# activate your virtualenv first if not already active
source venv/bin/activate
# run the server (from project root)
python backend/manage.py runserver
```

- The examples below use `http://127.0.0.1:8000` as the base URL. Adjust if you run the server on a different host/port.
- jq is handy for pretty JSON output (optional): `sudo apt install jq` or `pip install jq`.

Endpoints covered
- POST /api/users/register/      — create a new user (open)
- POST /api/token/               — obtain JWT access + refresh tokens
- POST /api/token/refresh/       — refresh access token using refresh token
- GET  /api/users/               — list users (admin-only)

Notes on admin access
- Listing users is protected with `IsAdminUser`. Create a Django superuser (or make an existing user staff/superuser) to test the GET /api/users/ endpoint.

Create a superuser (one-time manual step)
```bash
# from project root (or adjust to full python path in your venv)
venv/bin/python backend/manage.py createsuperuser --username admin --email admin@example.com
# follow prompts to set a password
```

1) Register a regular user

```bash
curl -i -X POST http://127.0.0.1:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"s3cret","first_name":"Alice","role":"student"}'
```

Expected: HTTP 201 with created user JSON (id, username, ...). Example body:

```json
{
  "id": 2,
  "username": "alice",
  "email": "alice@example.com",
  "first_name": "Alice",
  "last_name": "",
  "role": "student"
}
```

2) Obtain JWT tokens (user)

```bash
curl -i -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"s3cret"}'
```

Expected: HTTP 200 JSON with `access` and `refresh` tokens:

```json
{
  "access": "<JWT_ACCESS_TOKEN>",
  "refresh": "<JWT_REFRESH_TOKEN>"
}
```

3) Refresh access token

```bash
curl -i -X POST http://127.0.0.1:8000/api/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh":"<JWT_REFRESH_TOKEN>"}'
```

Expected: HTTP 200 with new access token:

```json
{ "access": "<NEW_JWT_ACCESS_TOKEN>" }
```

4) Try accessing the protected users list as a normal user (should fail)

```bash
curl -i -X GET http://127.0.0.1:8000/api/users/ \
  -H "Authorization: Bearer <JWT_ACCESS_TOKEN>"
```

Expected: HTTP 403 Forbidden (because normal users are not admin/staff).

5) Access the users list as admin

- Obtain tokens for the admin user (created earlier via `createsuperuser`):

```bash
curl -i -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<admin_password>"}' | jq
```

- Use the returned `access` token to call the list endpoint:

```bash
curl -i -X GET http://127.0.0.1:8000/api/users/ \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" | jq
```

Expected: HTTP 200 with a JSON array of users.

Notes and troubleshooting
- If you get 401 Unauthorized from token endpoints, verify username/password and that the server is running.
- If you get 500 / import errors when running the server, ensure you installed the project requirements inside the venv:

```bash
venv/bin/pip install -r backend/requirements.txt
```

- If you allow role assignment at registration but want to prevent users from self-assigning privileged roles (e.g. `admin`), remove `role` from the public `RegisterSerializer` and only allow admins to set roles.

Happy testing — tell me if you want these examples as a smoke test script (bash) instead of curl snippets.
