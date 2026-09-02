# BIT Student Health Center Management System

A web-based Student Health Center — Patient Appointment Scheduling and Medication Stock Control System built for **Bannari Amman Institute of Technology (BIT)**.

## 🌟 Overview

The BIT Student Health Center Management System is an integrated healthcare web platform facilitating student appointment booking, doctor consultations, digital prescription creation, pharmacist medicine dispensing with atomic inventory management, stock alerts, administrative controls, and system reports.

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router v6
- **Backend**: Node.js, Express.js, TypeScript, Zod, bcryptjs, JSON Web Tokens (JWT)
- **Database**: Relational Normalized Schema powered by **Prisma ORM** (MySQL / SQLite)
- **Authentication**: JWT-based session state with strict server-side Role-Based Access Control (RBAC)

---

## 👥 User Roles & Demo Credentials

The system supports 4 distinct user roles:

| Role | Demo Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@bitsathy.ac.in` | `Admin@123` | User controls, doctor schedules, medicine catalog, system reports |
| **Doctor** | `dr.smith@bitsathy.ac.in` | `Doctor@123` | Patient queue, consultation records, digital prescriptions |
| **Pharmacist** | `pharma@bitsathy.ac.in` | `Pharma@123` | Pending prescriptions, medicine availability check, atomic dispensing |
| **Student** | `7376211cs101@bitsathy.ac.in` | `Student@123` | Self-registration, appointment booking, visit history, prescriptions |

---

## 🛠️ Project Installation & Execution

### 1. Database Setup & Seeding

```bash
cd backend
npm install
npx prisma db push
npx prisma db seed
```

### 2. Run Backend API Server

```bash
cd backend
npm run dev
# Running on http://localhost:5000
```

### 3. Run Frontend Web Application

```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

---

## 🧪 Testing

Run automated integration test suite for Backend Authentication & RBAC:

```bash
cd backend
npm test
```

---

## 📁 Repository Structure

```
d:\HC_Mini\
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── index.ts
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── vite.config.ts
└── docs/
    ├── implementation-status.md
    ├── architecture.md
    ├── database.md
    ├── api.md
    └── testing.md
```
