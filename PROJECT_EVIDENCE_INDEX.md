# PROJECT EVIDENCE INDEX
## BIT Student Health Center Management System
### Files, Their Locations, and What They Prove for the Academic Report

---

## Section 1: Database Schema Evidence

| File | Absolute Path | Report Section | What It Proves |
| :--- | :--- | :--- | :--- |
| `schema.prisma` | `d:\HC_Mini\backend\prisma\schema.prisma` | Database Design (Ch. 3/4) | Complete 9-table relational schema: User, Student, Doctor, DoctorSchedule, Appointment, Visit, Medicine, Prescription, PrescriptionItem, StockTransaction, Notification. Shows all field types, relationships, and constraints. |
| `seed.ts` | `d:\HC_Mini\backend\prisma\seed.ts` | Demo Data / Testing | Demo credentials, initial medicine catalogue, schedule setup for 2 doctors. |
| `dev.db` | `d:\HC_Mini\backend\prisma\dev.db` | Database Evidence | Live SQLite database file with seeded data (135 KB). |

---

## Section 2: Backend Source Code Evidence

| File | Absolute Path | Report Section | What It Proves |
| :--- | :--- | :--- | :--- |
| `index.ts` | `d:\HC_Mini\backend\src\index.ts` | Architecture | Express app setup, 11 route groups, middleware stack, error handler, health check endpoint. |
| `authMiddleware.ts` | `d:\HC_Mini\backend\src\middleware\authMiddleware.ts` | Security & Auth | JWT verification logic, live user active-status check, req.user injection. |
| `roleMiddleware.ts` | `d:\HC_Mini\backend\src\middleware\roleMiddleware.ts` | Security & RBAC | `requireRole(allowedRoles)` factory function — 403 enforcement. |
| `validateMiddleware.ts` | `d:\HC_Mini\backend\src\middleware\validateMiddleware.ts` | Input Validation | Zod schema validation wrapper used on all request bodies. |
| `authService.ts` | `d:\HC_Mini\backend\src\services\authService.ts` | Auth Logic | Student registration atomic transaction, bcrypt password hashing, JWT generation, login logic. |
| `stockService.ts` | `d:\HC_Mini\backend\src\services\stockService.ts` | Key Innovation | Complete `prisma.$transaction` atomic dispensing algorithm: expiry check → stock check → deduct → log OUT → mark DISPENSED. Also Stock-IN and alert calculation. |
| `appointmentService.ts` | `d:\HC_Mini\backend\src\services\appointmentService.ts` | Appointment Logic | Token number assignment, slot availability computation, double-booking prevention, cancellation, rescheduling. |
| `authController.ts` | `d:\HC_Mini\backend\src\controllers\authController.ts` | API Layer | HTTP request handling for auth endpoints. |
| `stockController.ts` | `d:\HC_Mini\backend\src\controllers\stockController.ts` | API Layer | HTTP request handling for dispense, stock-in, transactions, alerts. |
| `appointmentController.ts` | `d:\HC_Mini\backend\src\controllers\appointmentController.ts` | API Layer | HTTP request handling for booking, listing, cancellation, rescheduling, queue. |

### All Route Files (11 files — all in `d:\HC_Mini\backend\src\routes\`)
| File | Key Routes Defined |
| :--- | :--- |
| `authRoutes.ts` | POST /register, POST /login, GET /me, POST /logout |
| `appointmentRoutes.ts` | POST /, GET /, GET /queue/today, PATCH /:id/cancel, PATCH /:id/reschedule |
| `consultationRoutes.ts` | POST /, GET /patients/search, GET /my-history, GET /patients/:studentId/history |
| `stockRoutes.ts` | POST /dispense, POST /in, GET /transactions, GET /alerts |
| `adminRoutes.ts` | GET /analytics, GET/PATCH /users/:id/status, POST /users/:id/reset-password, GET/PUT /doctors/:id |
| `medicineRoutes.ts` | GET /, POST /, PUT /:id, PATCH /:id/toggle |
| `prescriptionRoutes.ts` | POST /, GET / |
| `notificationRoutes.ts` | GET /, PATCH /:id/read, PATCH /read-all |
| `reportRoutes.ts` | GET / |
| `doctorScheduleRoutes.ts` | GET /schedules, POST /schedules, PUT /schedules/:id, DELETE /schedules/:id, GET /available-slots |
| `userRoutes.ts` | GET /profile, PUT /profile, GET / |

---

## Section 3: Frontend Source Code Evidence

| File | Absolute Path | Report Section | What It Proves |
| :--- | :--- | :--- | :--- |
| `App.tsx` | `d:\HC_Mini\frontend\src\App.tsx` | Frontend Architecture | Complete routing table: 20+ routes across all 4 roles, ProtectedRoute, LayoutShell, DashboardRouter role dispatch. |
| `tailwind.config.js` | `d:\HC_Mini\frontend\tailwind.config.js` | Design System | BIT custom color token scale (`bit-500: #635BFF`, `bit-bg: #f3f4f8`). |
| `index.css` | `d:\HC_Mini\frontend\src\index.css` | Design System | Global CSS and Tailwind directives. |
| `index.html` | `d:\HC_Mini\frontend\index.html` | Frontend Entry | Vite HTML shell with app root. |

### Frontend Pages (all in `d:\HC_Mini\frontend\src\pages\`)
| Page File | Role | Functionality |
| :--- | :--- | :--- |
| `auth/Login.tsx` | Public | Login form with role-based redirect |
| `auth/StudentRegister.tsx` | Public | Student self-registration form |
| `dashboard/StudentDashboard.tsx` | STUDENT | Appointment summary, health stats overview |
| `dashboard/DoctorDashboard.tsx` | DOCTOR | Queue summary, patient count, today's appointments |
| `dashboard/PharmacistDashboard.tsx` | PHARMACIST | Pending prescriptions, low-stock summary |
| `dashboard/AdminDashboard.tsx` | ADMIN | System analytics cards |
| `student/BookAppointment.tsx` | STUDENT | Doctor selection, date + slot picker, booking |
| `student/StudentAppointments.tsx` | STUDENT | List + cancel + reschedule appointments |
| `student/MedicalHistory.tsx` | STUDENT | Past visits, diagnoses, notes |
| `student/StudentPrescriptions.tsx` | STUDENT | Active + dispensed prescriptions |
| `doctor/DoctorQueue.tsx` | DOCTOR | Today's appointment queue by token |
| `doctor/DoctorScheduleManager.tsx` | DOCTOR/ADMIN | Schedule CRUD per day |
| `doctor/DoctorConsultation.tsx` | DOCTOR | Record symptoms, diagnosis, create prescription |
| `pharmacy/PharmacistDispense.tsx` | PHARMACIST | Pending prescriptions list, dispense action |
| `pharmacy/InventoryManager.tsx` | PHARMACIST | Medicine list, stock-in, add new medicines |
| `pharmacy/StockAlerts.tsx` | PHARMACIST | Low-stock + near-expiry + expired alerts |
| `pharmacy/StockTransactions.tsx` | PHARMACIST | Audit log of IN/OUT stock movements |
| `admin/AdminUserManagement.tsx` | ADMIN | User list, activate/deactivate, password reset |
| `admin/AdminDoctorManagement.tsx` | ADMIN | Doctor roster, room/specialization update |
| `admin/AdminMedicineControl.tsx` | ADMIN | Master medicine catalogue management |
| `reports/ReportsCenter.tsx` | ADMIN/DOCTOR/PHARMACIST | Date-range reports + CSV export |
| `profile/ProfilePage.tsx` | All | View and update own profile |

---

## Section 4: Test Files Evidence

| File | Absolute Path | Test Count | What It Verifies |
| :--- | :--- | :--- | :--- |
| `auth.test.ts` | `d:\HC_Mini\backend\src\__tests__\auth.test.ts` | 7 tests | Registration, duplicate rejection, login, wrong password, JWT profile, RBAC 403, RBAC 200 |
| `appointment.test.ts` | `d:\HC_Mini\backend\src\__tests__\appointment.test.ts` | 14 tests | Booking, token assignment, double-book, cancel, reschedule, queue |
| `prescription.test.ts` | `d:\HC_Mini\backend\src\__tests__\prescription.test.ts` | N tests | Prescription creation, stock-not-deducted verification |
| `inventory.test.ts` | `d:\HC_Mini\backend\src\__tests__\inventory.test.ts` | 5 tests | Dispense 50→40, re-dispense rejection, expired rejection, Stock-IN 40→60, alert count |
| `admin.test.ts` | `d:\HC_Mini\backend\src\__tests__\admin.test.ts` | N tests | Analytics, user management |
| `reports.test.ts` | `d:\HC_Mini\backend\src\__tests__\reports.test.ts` | N tests | Reporting endpoints |

**Total Verified: 35/35 tests passing (confirmed by npm test run)**

---

## Section 5: Configuration & Build Evidence

| File | Absolute Path | What It Shows |
| :--- | :--- | :--- |
| `package.json` (backend) | `d:\HC_Mini\backend\package.json` | All backend runtime + dev dependencies with exact versions |
| `package.json` (frontend) | `d:\HC_Mini\frontend\package.json` | All frontend runtime + dev dependencies with exact versions |
| `jest.config.js` | `d:\HC_Mini\backend\jest.config.js` | ts-jest preset, node env, test file pattern |
| `.env.example` | `d:\HC_Mini\backend\.env.example` | Environment variable names: PORT, NODE_ENV, DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN |
| `vite.config.ts` | `d:\HC_Mini\frontend\vite.config.ts` | Vite React plugin config |
| `tsconfig.json` (backend) | `d:\HC_Mini\backend\tsconfig.json` | TypeScript compiler config |
| `tsconfig.json` (frontend) | `d:\HC_Mini\frontend\tsconfig.json` | TypeScript compiler config |
| `tailwind.config.js` | `d:\HC_Mini\frontend\tailwind.config.js` | BIT custom color token system |
| `dist/` (frontend) | `d:\HC_Mini\frontend\dist\` | Vite production build output (proves build success) |
| `dist/` (backend) | `d:\HC_Mini\backend\dist\` | TypeScript compiled JS output |

---

## Section 6: Documentation Files

| File | Absolute Path | Contents |
| :--- | :--- | :--- |
| `architecture.md` | `d:\HC_Mini\docs\architecture.md` | 3-tier architecture diagram (ASCII), component design notes |
| `api.md` | `d:\HC_Mini\docs\api.md` | API endpoint summary table |
| `database.md` | `d:\HC_Mini\docs\database.md` | Database design notes |
| `implementation-status.md` | `d:\HC_Mini\docs\implementation-status.md` | Phase-by-phase feature completion table (38 items, all COMPLETED) |
| `testing.md` | `d:\HC_Mini\docs\testing.md` | Testing overview notes |
| `README.md` | `d:\HC_Mini\README.md` | Project overview |

---

## Section 7: Images and Diagrams Available

| File | Location | Description |
| :--- | :--- | :--- |
| `tech_stack.png` | `d:\HC_Mini\tech_stack.png` | Tech stack visual diagram |
| `tech_stack_grid.png` | `d:\HC_Mini\tech_stack_grid.png` | Tech stack grid layout image |
| `tech_stack.png` (copy) | `d:\HC_Mini\docs\tech_stack.png` | Same image in docs folder |
| `tech_stack_grid.png` (copy) | `d:\HC_Mini\docs\tech_stack_grid.png` | Same grid image in docs folder |

---

## Section 8: Missing Visual Evidence

The following items would strengthen the academic report but are **NOT currently available**:

| Missing Evidence | Type | Report Section |
| :--- | :--- | :--- |
| ER Diagram (visual) | Diagram | Database Design |
| System Architecture Diagram (visual) | Diagram | Architecture |
| DFD Level 0 (Context Diagram) | Diagram | System Design |
| DFD Level 1 (Detailed Data Flow) | Diagram | System Design |
| Use Case Diagram | Diagram | Functional Requirements |
| Frontend UI Screenshots (per page) | Screenshots | UI Design |
| Test Run Console Output Screenshot | Screenshot | Testing |
| Sequence Diagrams (dispensing flow, login flow) | Diagram | System Design |

---

## Section 9: What to Upload to Claude for Report Writing

For the most complete academic report, upload the following:

**Must Upload**:
1. `d:\HC_Mini\PROJECT_REPORT_HANDOFF.md` — This full source document
2. `d:\HC_Mini\backend\prisma\schema.prisma` — For database design chapter
3. `d:\HC_Mini\docs\implementation-status.md` — For project status chapter

**Recommended**:
4. `d:\HC_Mini\tech_stack.png` — As figure for technology section
5. `d:\HC_Mini\tech_stack_grid.png` — As figure for technology section
6. `d:\HC_Mini\backend\src\services\stockService.ts` — For detailed algorithm chapter

**Optional (for depth)**:
7. `d:\HC_Mini\backend\src\__tests__\inventory.test.ts` — For test case evidence
8. `d:\HC_Mini\backend\src\__tests__\auth.test.ts` — For test case evidence
9. `d:\HC_Mini\docs\architecture.md` — Architecture supplement
