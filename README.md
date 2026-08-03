# CollabWrite Studio - Enterprise Real-Time Collaborative Document Platform

> A production-grade, distributed real-time collaborative document platform inspired by Google Docs and Notion. Built with Node.js, Express.js, Prisma ORM, PostgreSQL, Socket.IO v4, React 18, TipTap v2, and Tailwind CSS.

---

## 🚀 Quick Links & Documentation

- **Swagger / OpenAPI Documentation**: `http://localhost:5000/api/docs`
- **System Health & Telemetry**: `http://localhost:5000/health`
- **[System Architecture Guide](file:///home/yeabsira-hailegiorgis/Documents/2nd%20Project/auth-system/docs/ARCHITECTURE.md)** (`docs/ARCHITECTURE.md`)
- **[Database Schema & Indexing Guide](file:///home/yeabsira-hailegiorgis/Documents/2nd%20Project/auth-system/docs/DATABASE.md)** (`docs/DATABASE.md`)
- **[5-Minute Evaluator Demo Script](file:///home/yeabsira-hailegiorgis/Documents/2nd%20Project/auth-system/docs/DEMO_GUIDE.md)** (`docs/DEMO_GUIDE.md`)

---

## Architecture Overview

CollabWrite Studio utilizes a Clean Layered Architecture with strict separation between Repositories, Services, Controllers, Socket handlers, RBAC Guard, and Frontend React components.

```
                  ┌──────────────────────────────────────────────┐
                  │            React 18 + Vite Frontend          │
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
                           │      Prisma ORM 7        │
                           └─────────────┬────────────┘
                                         │
                           ┌─────────────┴────────────┐
                           │   PostgreSQL 15 Database │
                           └──────────────────────────┘
```

---

## System Test Suite Status (45/45 Passing)

| Test Suite File | Scenarios | Status | Description |
|---|---|---|---|
| `tests/auth.test.js` | 5/5 | ✅ PASS | Registration, login, JWT rotation, session revocation |
| `tests/documents.test.js` | 5/5 | ✅ PASS | Document CRUD, soft-delete, title & content lifecycle |
| `tests/collaboration.test.js` | 4/4 | ✅ PASS | Socket.IO room isolation, debounced saves, state sync |
| `tests/presence.test.js` | 4/4 | ✅ PASS | Collaborator join/leave, live cursors, typing timers |
| `tests/sharing.test.js` | 7/7 | ✅ PASS | RBAC rules for VIEWER, COMMENTER, EDITOR, OWNER |
| `tests/comments.test.js` | 6/6 | ✅ PASS | Contextual threads, text anchor ranges, replies, resolve |
| `tests/revisions.test.js` | 4/4 | ✅ PASS | Manual snapshots, timeline, version restoration |
| `tests/productivity.test.js` | 5/5 | ✅ PASS | Full-text search, favorites, activity log, notifications |
| `tests/e2e.test.js` | 5/5 | ✅ PASS | End-to-end full user journey verification |
| **Total** | **45/45** | **✅ 100%** | **All 9 test suites passing with 0 failures** |

---

## Core Features & Completed Modules

### 1. Authentication & Security (Phase 1)
- Enterprise JWT Access & Refresh Token rotation stored in HttpOnly cookies.
- Google OAuth 2.0 Single Sign-On integration via Passport.js.
- Rate limiting, Helmet security headers, CORS protection, and account lockout after repeated failed attempts.

### 2. Document Management & CRUD (Phase 2)
- UUID document indexing with ownership tracking and timestamps.
- Clean Architecture REST endpoints under `/api/documents`.

### 3. Rich Text Editing (Phase 3)
- TipTap v2 editor supporting Headings, Bold, Italic, Underline, Strike, Bullet Lists, Numbered Lists, Code Blocks, Hyperlinks, and Formatting reset.

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
- 1.5-second debounced background persistence with status indicator (`Saving...`, `Saved x ago`, `Retrying...`).
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
- Multi-stage Docker containerization (`Dockerfile`, `frontend/Dockerfile`, and `docker-compose.yml`).

### 11. Quality Assurance, Deployment & Final Delivery (Phase 11)
- Winston structured JSON logging across all backend components.
- Interactive OpenAPI / Swagger UI served at `/api/docs`.
- Advanced System Telemetry & Health endpoint (`GET /health`) checking DB query ping, memory usage, uptime.
- Comprehensive technical documentation (`docs/ARCHITECTURE.md`, `docs/DATABASE.md`, `docs/DEMO_GUIDE.md`).

---

## Quick Installation & Running Options

### Option A: Running with Docker Compose (Recommended)

1. **Start Full Stack (PostgreSQL + Backend API + React Frontend)**:
   ```bash
   docker compose up --build
   ```
2. **Access Application**:
   - **Frontend UI**: `http://localhost:80`
   - **Backend API**: `http://localhost:5000`
   - **Swagger Docs**: `http://localhost:5000/api/docs`

---

### Option B: Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

2. **Configure Environment (`.env`)**:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/auth_system?schema=public"
   JWT_SECRET="collabwrite_super_secret_jwt_key_2026"
   JWT_REFRESH_SECRET="collabwrite_super_secret_refresh_jwt_key_2026"
   FRONTEND_URL="http://localhost:5173"
   ```

3. **Database Sync & Generate Prisma Client**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Run Application Dev Servers**:
   ```bash
   # Terminal 1: Backend Server
   npm run dev

   # Terminal 2: Frontend Vite Dev Server
   cd frontend && npm run dev
   ```

5. **Run System Integration & End-to-End Test Suite**:
   ```bash
   npm test
   ```

---

## License
MIT License. Developed for Portfolio & Enterprise Evaluation.
