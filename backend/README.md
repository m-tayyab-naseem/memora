# Memora Backend API

A collaborative web platform backend for preserving shared memories.

## Features

- User authentication with JWT
- Vault creation and management
- Role-based access control (Owner, Contributor, Viewer)
- Image and video uploads to S3-compatible storage
- Immutable media entries
- Comment threads on media
- Comprehensive audit logging

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- AWS S3 (or compatible) for media storage

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- S3-compatible storage account

### Installation

1. Clone/extract the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your MongoDB URI and S3 credentials

5. Start the server:
   ```bash
   npm run dev
   ```

The server will run on http://localhost:5000

## API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

### Vault Endpoints

- `POST /api/v1/vaults` - Create vault
- `GET /api/v1/vaults` - List user's vaults
- `GET /api/v1/vaults/:id` - Get vault details
- `PATCH /api/v1/vaults/:id` - Update vault
- `DELETE /api/v1/vaults/:id` - Delete vault

### Member Endpoints

- `POST /api/v1/vaults/:vaultId/members` - Add member
- `GET /api/v1/vaults/:vaultId/members` - List members
- `PATCH /api/v1/vaults/:vaultId/members/:userId` - Update member role
- `DELETE /api/v1/vaults/:vaultId/members/:userId` - Remove member

### Media Endpoints

- `POST /api/v1/media/:vaultId/upload` - Upload media
- `GET /api/v1/media/:vaultId` - List media
- `GET /api/v1/media/:vaultId/:mediaId` - Get media details

### Comment Endpoints

- `POST /api/v1/comments/:mediaId` - Add comment
- `GET /api/v1/comments/:mediaId` - Get comments

### Audit Endpoints

- `GET /api/v1/audit/:vaultId` - Get audit logs

## Project Structure

```
src/
├── config/         # Configuration files
├── models/         # Mongoose models
├── controllers/    # Route controllers
├── services/       # Business logic
├── middleware/     # Express middleware
├── routes/         # API routes
├── utils/          # Utility functions
└── server.js       # Entry point
```

## Testing

Run tests:
```bash
npm test
```

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT