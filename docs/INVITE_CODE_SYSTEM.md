# Invite Code System

This document describes the invite code system implemented for user registration in the Student Management application.

## Overview

The invite code system provides a secure way to control user registration by requiring a valid invite code during the registration process. This prevents unauthorized users from creating accounts.

## Features

- **Invite Code Generation**: Admins can generate new invite codes
- **Invite Code Validation**: Codes are validated during registration
- **One-Time Use**: Each invite code can only be used once
- **Status Tracking**: Track which codes are active vs. used
- **User Association**: Link used codes to the user who registered with them

## How It Works

### 1. Invite Code Generation

Admins can generate invite codes through:
- **Invite Codes Management Page**: Navigate to `/invite-codes` to manage all codes
- **Development Tool**: Use the "Generate First Invite Code" button on the login page for initial setup

### 2. User Registration Process

1. User visits the registration page (`/register`)
2. User fills out the registration form including the invite code field
3. System validates the invite code:
   - Checks if code exists
   - Verifies code is still active (not used)
4. If validation passes:
   - Creates user account in `vvn-user` database
   - **Creates CouchDB user account** in `_users` database for sync authentication
   - Marks invite code as used
   - Associates the code with the new user
5. User is redirected to login page with success message

### 3. Sync Authentication

After registration, when the user logs in:
- **Username/Password**: The same credentials used during registration
- **Sync URLs**: Built with username/password in the URL (Basic Auth)
- **Database Creation**: CouchDB automatically creates user-specific databases when sync starts
- **Permissions**: User can only access their own databases

### 4. Database Structure

#### Invite Codes Database (`vvn-invite`)
```json
{
  "_id": "unique_id",
  "type": "invite_code",
  "code": "ABC12345",
  "status": "active",
  "created_at": "2024-01-01T00:00:00.000Z",
  "created_by": "admin",
  "used_at": null,
  "used_by": null
}
```

#### Users Database (`vvn-user`)
```json
{
  "_id": "unique_id",
  "type": "user",
  "username": "teacher1",
  "password_hash": "hashed_password",
  "email": "teacher@example.com",
  "phone": "+85212345678",
  "country_code": "+852",
  "role": "teacher",
  "display_name": "Teacher Name",
  "settings": {
    "language": "en",
    "timezone": "Asia/Hong_Kong",
    "currency": "USD"
  },
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

#### CouchDB Users Database (`_users`)
```json
{
  "_id": "org.couchdb.user:teacher1",
  "name": "teacher1",
  "password": "hashed_password_by_couchdb",
  "roles": ["teacher"],
  "type": "user"
}
```

## API Endpoints

### GET `/api/auth/invite-codes`
Retrieve all invite codes (for admin management)

### POST `/api/auth/invite-codes`
Generate new invite codes
```json
{
  "count": 5,
  "created_by": "admin"
}
```

### POST `/api/auth/validate-invite-code`
Validate a single invite code
```json
{
  "code": "ABC12345"
}
```

### POST `/api/auth/register`
Register a new user with invite code validation
```json
{
  "username": "teacher1",
  "password": "password123",
  "email": "teacher@example.com",
  "phone": "+85212345678",
  "country_code": "+852",
  "display_name": "Teacher Name",
  "invite_code": "ABC12345",
  "settings": {
    "language": "en",
    "timezone": "Asia/Hong_Kong",
    "currency": "USD"
  }
}
```

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in your project root:

```bash
# CouchDB Connection
COUCHDB_URL=http://localhost:5984

# CouchDB Admin Credentials
COUCHDB_ADMIN_USERNAME=admin
COUCHDB_ADMIN_PASSWORD=your_admin_password
```

### 2. Initial Setup
1. Start the application
2. Navigate to the login page
3. Click "Generate First Invite Code" in the development tools section
4. Note the generated code (e.g., "ABC12345")

### 3. User Registration
1. Share the invite code with the new user
2. User visits `/register`
3. User enters the invite code along with their details
4. User completes registration and can then login

### 4. Ongoing Management
1. Navigate to `/invite-codes` to manage all codes
2. Generate new codes as needed
3. View which codes have been used and by whom

## Security Considerations

- **Code Generation**: Uses cryptographically secure random generation
- **One-Time Use**: Each code can only be used once
- **Validation**: Server-side validation prevents bypassing
- **Database Isolation**: Invite codes stored in separate database
- **Audit Trail**: Tracks when and by whom codes are used

## Error Handling

The system handles various error scenarios:
- Invalid invite code
- Already used invite code
- Missing required fields
- Username already exists
- Database connection issues

## Internationalization

All user-facing messages are internationalized:
- English: `en`
- Traditional Chinese: `zh-Hant`

## Development Notes

- Invite codes are 8 characters long (alphanumeric, uppercase)
- Maximum 10 codes can be generated at once
- Codes are automatically converted to uppercase during validation
- The system creates databases automatically if they don't exist
