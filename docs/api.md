# API Specification — BIT Student Health Center System

## Base URL
`/api`

## Authentication Headers
`Authorization: Bearer <JWT_TOKEN>`

## Endpoints Summary

### Auth (`/api/auth`)
- `POST /api/auth/register` - Student self-registration
- `POST /api/auth/login` - Authenticate user & receive JWT token + user details
- `GET /api/auth/me` - Fetch currently authenticated user profile
- `POST /api/auth/logout` - Invalidate session / client token clear

### Profile (`/api/users`)
- `GET /api/users/profile` - Get user & profile record
- `PUT /api/users/profile` - Update profile information
- `GET /api/users` - [ADMIN] List all users with filtering
- `PATCH /api/users/:id/status` - [ADMIN] Activate/Deactivate user account

### Appointments (`/api/appointments`) [Phase 2]
- `GET /api/appointments` - List appointments (role filtered)
- `POST /api/appointments` - Book appointment
- `GET /api/appointments/:id` - Get appointment details
- `PATCH /api/appointments/:id/cancel` - Cancel appointment
- `PATCH /api/appointments/:id/reschedule` - Reschedule appointment

### Schedules (`/api/schedules`) [Phase 2]
- `GET /api/schedules/doctor/:doctorId` - Get doctor schedule & slots
- `POST /api/schedules` - [ADMIN/DOCTOR] Create/Update schedule

### Prescriptions & Inventory (`/api/prescriptions`, `/api/medicines`, `/api/stock`) [Phase 3 & 4]
- `POST /api/prescriptions` - Doctor creates prescription
- `GET /api/prescriptions` - List prescriptions
- `POST /api/stock/dispense` - Pharmacist dispenses medicines & auto-deducts stock
- `GET /api/medicines` - List medicines
- `POST /api/medicines` - Add medicine
- `POST /api/stock/in` - Add stock inventory
