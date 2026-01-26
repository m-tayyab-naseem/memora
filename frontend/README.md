# Memora - Memory Vault Application

A secure, collaborative memory management application built with Next.js and TypeScript. Memora allows users to create private vaults, invite members, and safely preserve photos and videos of cherished moments.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Memory Vaults**: Create and manage private memory vaults
- **Media Management**: Upload and organize photos and videos
- **Secure Storage**: Encrypted file storage with access control
- **Role-Based Access**: Owner, Custodian, and Viewer roles for vault members
- **Clean UI**: Professional, intuitive interface built with shadcn/ui

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **State Management**: React Hooks, SWR for data fetching
- **API Communication**: Fetch API with custom API client
- **Authentication**: JWT-based token management

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd memora
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your API configuration:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /(auth)          # Authentication pages (login, register)
  /(protected)     # Protected routes requiring authentication
    /dashboard     # Main dashboard showing user's vaults
    /vault/[id]    # Vault detail page with media gallery
  /page.tsx        # Root page (redirects to dashboard or login)

/components
  /shared          # Shared components (Header, Sidebar)
  /vault           # Vault-related components
  /media           # Media upload and gallery components
  /ui              # shadcn/ui components

/lib
  /types.ts        # TypeScript type definitions
  /api-client.ts   # API communication client
  /utils.ts        # Utility functions

/hooks
  /use-auth.ts     # Authentication state management hook
```

## Key Components

### Authentication
- **Login Page**: Email/password authentication
- **Register Page**: New user account creation
- **useAuth Hook**: Manages user state and auth operations

### Dashboard
- **Vault Listing**: View all user's vaults
- **Create Vault Dialog**: Create new memory vaults
- **Vault Cards**: Display vault info with quick actions

### Media Management
- **Media Upload**: Upload photos and videos with drag-and-drop
- **Media Gallery**: Grid view of vault's media items
- **Media Card**: Individual media display with delete functionality

## API Integration

The frontend communicates with a Node.js/Express backend API. Key endpoints:

```
POST   /auth/register        # User registration
POST   /auth/login           # User login
GET    /auth/me              # Get current user

GET    /vaults               # List user's vaults
POST   /vaults               # Create new vault
GET    /vaults/:id           # Get vault details
DELETE /vaults/:id           # Delete vault

GET    /vaults/:id/media     # List vault's media
POST   /vaults/:id/media     # Upload media
DELETE /vaults/:id/media/:mediaId  # Delete media item
```

## Styling & Design

The application uses a clean, professional design system with:
- **Color Palette**: Violet primary color with slate neutrals
- **Typography**: Clear hierarchy with Geist font family
- **Layout**: Flexbox-based responsive design
- **Components**: Reusable shadcn/ui components with Tailwind CSS

## Authentication Flow

1. User registers or logs in
2. Backend validates credentials and returns JWT token
3. Token is stored in localStorage
4. Token is included in Authorization header for API requests
5. Protected routes check token validity and redirect if needed

## Data Persistence

The frontend relies on a backend API for all data persistence:
- User accounts and authentication
- Vault creation and management
- Media storage and retrieval

Local storage is used only for JWT token persistence.

## Development Guidelines

- Split components into logical, reusable pieces
- Use TypeScript for type safety
- Follow React best practices (hooks, composition)
- Use Tailwind CSS utility classes for styling
- Implement proper error handling and user feedback
- Add loading states during async operations

## Building for Production

```bash
npm run build
npm run start
```

## License

MIT
