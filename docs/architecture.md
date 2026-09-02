# System Architecture — BIT Student Health Center System

## 1. High-Level Architecture

The **BIT Student Health Center System** is designed as a decoupled, multi-tiered enterprise Web Application:

```
+-------------------------------------------------------------------+
|                        Client Layer (SPA)                         |
| React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Axios |
+-------------------------------------------------------------------+
                                 |  HTTPS / REST APIs + JWT Auth
                                 v
+-------------------------------------------------------------------+
|                       Application Layer (API)                     |
| Node.js + Express.js + TypeScript + Zod + RBAC Middleware         |
+-------------------------------------------------------------------+
                                 |  Prisma ORM Client
                                 v
+-------------------------------------------------------------------+
|                        Data Layer (Storage)                       |
| Relational Database (Prisma ORM with MySQL / SQLite)              |
+-------------------------------------------------------------------+
```

## 2. Component Design

### Frontend Architecture
- **State Management**: React Context (`AuthContext`, `ToastContext`) + React Hooks.
- **Routing**: `react-router-dom` with `ProtectedRoute` wrappers validating user JWT session & role capabilities (`STUDENT`, `DOCTOR`, `PHARMACIST`, `ADMIN`).
- **UI Architecture**: Atomic reusable design system built with custom CSS utilities & Tailwind CSS.

### Backend Architecture
- **Layered Structure**: Controller -> Service -> ORM / Database.
- **Security**: JWT tokens signed with SHA-256 HMAC; Passwords hashed using bcrypt; CORS & Helmet security headers.
- **Validation**: Zod schema validation middleware sanitizing all inbound payloads.
- **Transactions**: Atomic Prisma transactions (`prisma.$transaction`) for inventory deductions and appointment booking locks.
