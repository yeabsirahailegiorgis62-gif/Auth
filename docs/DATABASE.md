# Database Schema & Performance Specification

## Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Session : "owns"
    User ||--o{ Document : "owns"
    User ||--o{ DocumentShare : "invited_to"
    User ||--o{ Revision : "created_by"
    User ||--o{ CommentThread : "created_thread"
    User ||--o{ Comment : "authored"
    User ||--o{ Favorite : "bookmarked"
    User ||--o{ ActivityLog : "performed"
    User ||--o{ Notification : "received"

    Document ||--o{ DocumentShare : "has_collaborators"
    Document ||--o{ Revision : "has_history"
    Document ||--o{ CommentThread : "has_discussions"
    Document ||--o{ Favorite : "favorited_by"
    Document ||--o{ ActivityLog : "tracked_in"
    Document ||--o{ Notification : "references"

    CommentThread ||--o{ Comment : "contains"

    User {
        int id PK
        string email UK
        string name
        string passwordHash
        string googleId
        string avatarUrl
        string bio
        int failedLoginAttempts
        datetime lockedUntil
        datetime createdAt
        datetime updatedAt
    }

    Session {
        int id PK
        int userId FK
        string refreshTokenHash UK
        string device
        string ipAddress
        datetime createdAt
        datetime expiresAt
    }

    Document {
        string id PK
        string title
        string content
        int ownerId FK
        boolean isArchived
        datetime createdAt
        datetime updatedAt
        datetime lastOpenedAt
    }

    DocumentShare {
        string id PK
        string documentId FK
        int userId FK
        string role
        int invitedById FK
        datetime createdAt
        datetime updatedAt
    }

    Revision {
        string id PK
        string documentId FK
        int authorId FK
        string content
        int version
        datetime createdAt
    }

    CommentThread {
        string id PK
        string documentId FK
        int createdBy FK
        string selectedText
        int fromPos
        int toPos
        boolean resolved
        int resolvedById FK
        datetime resolvedAt
        datetime createdAt
        datetime updatedAt
    }

    Comment {
        string id PK
        string threadId FK
        int authorId FK
        string content
        boolean edited
        datetime createdAt
        datetime updatedAt
    }

    Favorite {
        string id PK
        int userId FK
        string documentId FK
        datetime createdAt
    }

    ActivityLog {
        string id PK
        int userId FK
        string documentId FK
        string action
        json metadata
        datetime createdAt
    }

    Notification {
        string id PK
        int userId FK
        string documentId FK
        string type
        string message
        boolean read
        datetime createdAt
    }
```

---

## Data Schema & Table Reference

### 1. `User`
Stores authenticated platform accounts.
- **Primary Key**: `id` (`Int`, auto-increment)
- **Unique Constraints**: `email`
- **Security Fields**: `passwordHash`, `failedLoginAttempts`, `lockedUntil`
- **Profile Fields**: `avatarUrl`, `bio`

### 2. `Session`
Stores active refresh token hashes for session management.
- **Primary Key**: `id` (`Int`, auto-increment)
- **Foreign Keys**: `userId` -> `User(id)` (`ON DELETE CASCADE`)
- **Unique Constraints**: `refreshTokenHash`

### 3. `Document`
Core workspace document entity.
- **Primary Key**: `id` (`UUID` string)
- **Foreign Keys**: `ownerId` -> `User(id)` (`ON DELETE CASCADE`)
- **Metadata Fields**: `isArchived` (soft delete), `lastOpenedAt`

### 4. `DocumentShare`
Role-Based Access Control junction table.
- **Primary Key**: `id` (`UUID` string)
- **Foreign Keys**:
  - `documentId` -> `Document(id)` (`ON DELETE CASCADE`)
  - `userId` -> `User(id)` (`ON DELETE CASCADE`)
  - `invitedById` -> `User(id)` (`ON DELETE SET NULL`)
- **Unique Constraints**: `[documentId, userId]` (prevents duplicate permissions)
- **Roles**: `VIEWER`, `COMMENTER`, `EDITOR`, `OWNER`

### 5. `Revision`
Snapshot version history tracking.
- **Primary Key**: `id` (`UUID` string)
- **Foreign Keys**: `documentId` -> `Document(id)` (`ON DELETE CASCADE`), `authorId` -> `User(id)`

### 6. `CommentThread` & `Comment`
Threaded contextual annotations.
- `CommentThread` contains range metadata (`selectedText`, `fromPos`, `toPos`) and resolution state.
- `Comment` contains actual nested messages linked to `CommentThread(id)`.

### 7. `Favorite`, `ActivityLog`, `Notification`
Productivity extensions supporting document bookmarking, user activity timeline logging, and notifications.

---

## Indexing & Performance Strategy

The database includes explicit indexes on all foreign key lookups and frequent filter criteria to maintain `<10ms` query response times under high workload:

| Model | Index Target | Query Optimization Target |
|---|---|---|
| `Session` | `[userId]` | Fast session validation during token refresh |
| `Document` | `[ownerId]` | User dashboard owned documents queries |
| `Document` | `[isArchived]` | Trash tab vs active documents filter |
| `Document` | `[updatedAt]`, `[lastOpenedAt]` | Sorting recent documents timeline |
| `DocumentShare` | `[userId]`, `[documentId]` | Fast RBAC access permission lookups |
| `Revision` | `[documentId]` | Fetching revision timeline for document |
| `CommentThread` | `[documentId]`, `[resolved]` | Fetching active/resolved discussions |
| `Favorite` | `[userId]`, `[documentId]` | Bookmarked documents lookup |
| `ActivityLog` | `[userId]`, `[createdAt]` | Pagination of user audit activity feed |
| `Notification` | `[userId]`, `[read]` | Unread notification counter badge |

---

## Cascade & Data Integrity Rules
- **Cascading Deletes**: When a `Document` is permanently deleted, all associated `DocumentShare`, `Revision`, `CommentThread`, `Favorite`, `ActivityLog`, and `Notification` rows are automatically cleaned up (`ON DELETE CASCADE`).
- **Orphan Prevention**: Foreign keys explicitly prevent orphan comments, unlinked revisions, or invalid user references.
