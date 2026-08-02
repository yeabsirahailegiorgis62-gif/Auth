# CollabWrite Studio - Enterprise Real-Time Collaborative Document Platform

> A production-grade, distributed real-time collaborative document platform inspired by Google Docs and Notion. Built with Node.js, Express.js, Prisma ORM, PostgreSQL, Socket.IO, React, TipTap, and Tailwind CSS.

---

## Architecture Overview

CollabWrite Studio utilizes a Clean Architecture pattern with clear separation between Repositories, Services, Controllers, Socket handlers, and Frontend React components.

```
                  ┌──────────────────────────────────────────────┐
                  │            React + Vite Frontend             │
                  │   TipTap Editor | Socket.IO Client | Tailwind│
                  └──────────────────────┬───────────────────────┘
                                         │
                        ┌────────────────┴────────────────┐
                        │ REST HTTP API & Socket.IO Engine│
                        └────────────────┬────────────────┘
                                         │
      ┌──────────────────────────────────┼──────────────────────────────────┐
      │                                  │                                  │
┌─────┴──────────────┐       ┌───────────┴──────────┐       ┌───────────────┴────┐
│ Auth & Security    │       │ Document & Revisions │       │ Presence & Comments│
│ JWT | OAuth | RBAC │       │ Autosave | Snapshots │       │ Avatars | Cursors  │
└─────┬──────────────┘       └───────────┬──────────┘       └───────────────┬────┘
      │                                  │                                  │
      └──────────────────────────────────┼──────────────────────────────────┘
                                         │
                           ┌─────────────┴────────────┐
                           │      Prisma ORM          │
                           └─────────────┬────────────┘
                                         │
                           ┌─────────────┴────────────┐
                           │   PostgreSQL Database    │
                           └──────────────────────────┘
```

---

## Core Features & Modules

### 1. Authentication & Security (Phase 1)
- Enterprise JWT Access & Refresh Token rotation stored in HttpOnly cookies.
- Google OAuth2.0 Single Sign-On integration.
- Rate limiting, Helmet security headers, CORS protection, and account lockout after repeated failed attempts.

### 2. Document Management & CRUD (Phase 2)
- UUID document indexing with ownership tracking and timestamps.
- Clean Architecture REST endpoints under `/api/documents`.

### 3. Rich Text Editing (Phase 3)
- TipTap editor supporting Headings, Bold, Italic, Underline, Strike, Bullet Lists, Numbered Lists, Code Blocks, Hyperlinks, and Formatting reset.

### 4. Real-Time Collaboration Engine (Phase 4)
- Socket.IO bi-directional state synchronization engine.
- Instant remote content updates across browsers without page reloads.

### 5. Presence & Live Awareness (Phase 5)
- Active Collaborator avatars with deterministic user brand colors.
- Live user mouse cursor overlays (`LiveCursorsOverlay.jsx`) and animated typing indicators.

### 6. Fine-Grained Authorization & Sharing (Phase 6)
- Role-Based Access Control (RBAC): `OWNER`, `EDITOR`, `COMMENTER`, `VIEWER`.
- Real-time permission changes broadcast live over WebSockets (`permission:changed`, `access:revoked`).

### 7. Threaded Comments & Annotations (Phase 7)
- Contextual text selection commenting, nested replies, edit/delete, and resolve/reopen thread lifecycle.

### 8. Autosave & Document Version History (Phase 8)
- 2-second debounced background persistence with status indicator (`Saving...`, `Saved x ago`, `Retrying...`).
- Non-destructive version history timeline and restoration creating new sequential revisions.

### 9. Search, Productivity & Notifications (Phase 9)
- Permission-aware PostgreSQL full-text document search (`GET /api/search?q=query`).
- Bookmarking Favorites ⭐, soft-delete Trash system 🗑️ with restore capability.
- Platform Activity Log feed and Notification bell dropdown.
- Global Command Palette (`Ctrl + K`) and Keyboard Shortcuts modal (`Ctrl + /`).

### 10. Hardening, Profiles, Export/Import & Docker (Phase 10)
- Light / Dark / System theme switching with `localStorage` persistence.
- User profile settings (display name, bio, avatar).
- Document Export (HTML, Markdown `.md`, Plain Text `.txt`) and Import (`.md`, `.txt`).
- Docker containerization (`Dockerfile` and `docker-compose.yml`).

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register`: Create user account.
- `POST /api/auth/login`: Authenticate and receive JWT tokens.
- `POST /api/auth/refresh`: Refresh access token.
- `POST /api/auth/logout`: Revoke session.

### Documents
- `GET /api/documents`: List user documents.
- `POST /api/documents`: Create document.
- `GET /api/documents/:id`: Fetch document by UUID.
- `PATCH /api/documents/:id`: Update title/content.
- `DELETE /api/documents/:id`: Move to trash.
- `POST /api/documents/:id/restore`: Restore from trash.

### Revisions & Revisions
- `GET /api/documents/:id/revisions`: Timeline snapshots.
- `POST /api/documents/:id/revisions/snapshot`: Create manual checkpoint.
- `POST /api/documents/:id/revisions/:revisionId/restore`: Restore version.

### Comments
- `GET /api/documents/:id/comments`: Fetch threads.
- `POST /api/documents/:id/comments`: Create thread.
- `POST /api/documents/:id/comments/:threadId/reply`: Reply to thread.

### Search & Productivity
- `GET /api/search?q=query`: Permission-aware search.
- `POST /api/documents/:id/favorite`: Toggle favorite.
- `GET /api/activity`: Activity feed.
- `GET /api/notifications`: Notifications feed.

---

## Getting Started

### Prerequisites
- Node.js >= v20
- PostgreSQL >= v14
- Docker & Docker Compose (optional for containerized setup)

### Environment Setup (`.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/auth_system?schema=public"
JWT_SECRET="collabwrite_super_secret_jwt_key_2026"
JWT_REFRESH_SECRET="collabwrite_super_secret_refresh_jwt_key_2026"
```

### Quick Installation & Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

2. **Database Sync & Generate Prisma Client**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Run Backend & Frontend**:
   ```bash
   # Terminal 1: Backend Server
   npm run dev

   # Terminal 2: Frontend Vite Dev Server
   cd frontend && npm run dev
   ```

4. **Run Automated Test Suite (39 Integration Tests)**:
   ```bash
   npm test
   ```

5. **Run Containerized Stack with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

---

## License
MIT License. Developed for Portfolio & Enterprise Demonstration.
