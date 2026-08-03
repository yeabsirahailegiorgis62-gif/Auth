# Demonstration Script & Evaluator Guide

## Overview

This guide provides a structured 5-minute live demonstration plan for evaluators, investors, or senior technical reviewers. It demonstrates all 10 completed phases of the Collaborative Document Editor in a realistic, multi-user workflow.

---

## Pre-Demo Setup (1 minute)

1. **Start Services**:
   ```bash
   # Terminal 1: Start full docker stack
   docker compose up --build

   # OR for local development:
   # Backend
   npm run dev
   # Frontend (in /frontend)
   npm run dev
   ```
2. **Prepare Two Browser Windows**:
   - **Window 1 (User A - Owner)**: Chrome Incognito or Browser A open to `http://localhost:5173`
   - **Window 2 (User B - Collaborator)**: Firefox or Browser B open to `http://localhost:5173`

---

## 5-Minute Live Demonstration Timeline

### Minute 1: Introduction & Authentication
- **Action**: In Window 1, register a new account as `Alice (alice@example.com)`.
- **Talking Points**:
  - Show responsive auth UI with JWT access/refresh token rotation.
  - Mention security features: Bcrypt hashing, HttpOnly refresh cookies, rate limiting (100 req/15min).

### Minute 2: Document Management & TipTap Rich Editor
- **Action**:
  - Create a new document: `"Q3 Architecture Blueprint"`.
  - Type sample content using Headings (H1/H2), Bold, Lists, Code Blocks, and Alignments.
  - Show automatic debounced autosave ("Saving..." -> "Saved to cloud" indicator).
- **Talking Points**:
  - Built with TipTap v2 on ProseMirror foundation.
  - 1.5-second debounced save engine flushes to PostgreSQL automatically without user manual save.

### Minute 3: Sharing & Role-Based Access Control (RBAC)
- **Action**:
  - In Window 2, register `Bob (bob@example.com)`.
  - In Window 1 (Alice), click **Share** button, search for `bob@example.com`, and assign **EDITOR** role.
  - In Window 2 (Bob), check **"Shared With Me"** tab on Dashboard; click to open document.
- **Talking Points**:
  - Single source of truth permission engine (`PermissionService`) supporting `VIEWER`, `COMMENTER`, `EDITOR`, and `OWNER` roles.
  - Enforced consistently across both REST API endpoints and Socket.IO connection rooms.

### Minute 4: Real-Time Collaboration & Presence Awareness
- **Action**:
  - Place Window 1 and Window 2 side-by-side.
  - Type in Window 1 — witness instant live updates in Window 2 without page refresh.
  - Move mouse cursor in Window 1 — show colored collaborator cursor label appearing in Window 2.
  - Highlight text in Window 1 — show text selection overlay in Window 2.
  - Show collaborator avatar list in header updating dynamically.
- **Talking Points**:
  - Socket.IO v4 collaboration engine with `document:{id}` room isolation.
  - Low-latency WebSocket event propagation with presence awareness store tracking cursors, selections, and typing status.

### Minute 5: Contextual Comments, Revisions & Export
- **Action**:
  - In Window 2 (Bob), select text and click **Add Comment**: `"Please verify database indices."`
  - In Window 1 (Alice), see comment pop up live in sidebar, reply: `"Verified! Index added."`, then click **Resolve**.
  - In Window 1, open **Version History**, click **Create Snapshot** (`v1.0 Ready`), restore a previous revision, and show live content restoration.
  - Click **Download / Export** and export document as Markdown (`.md`).
- **Talking Points**:
  - Contextual text-range anchored discussion threads.
  - Full revision timeline with rollback capabilities broadcasting socket updates to active room members.
  - Document export/import capabilities in HTML, Markdown, and TXT.

---

## Technical Q&A Cheat Sheet for Evaluators

1. **How is state consistency maintained during concurrent edits?**
   - Socket.IO broadcasts updates to room subscribers instantly while scheduling debounced PostgreSQL persistence. Disconnections trigger immediate memory flushes.
2. **How are unauthorized WebSocket updates prevented?**
   - Socket connections pass JWT handshake verification. Room join and update handlers check `PermissionService` before accepting or broadcasting payload changes.
3. **What is the system test coverage?**
   - 100% passing across 9 test suites (44+ tests) covering Auth, Documents, Real-time Collaboration, Presence, RBAC, Comments, Revisions, Productivity, and E2E lifecycle.
