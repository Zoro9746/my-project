# Database Design — BIT Student Health Center System

## Relational Schema Diagram (Prisma ORM)

### Entities & Relationships

1. **User** (`users`)
   - `id`: String (UUID, PK)
   - `email`: String (Unique)
   - `passwordHash`: String
   - `name`: String
   - `role`: Enum (`STUDENT`, `DOCTOR`, `PHARMACIST`, `ADMIN`)
   - `isActive`: Boolean
   - `createdAt`, `updatedAt`

2. **Student** (`students`)
   - `id`: String (UUID, PK)
   - `userId`: String (FK -> User.id, Unique)
   - `rollNo`: String (Unique)
   - `department`: String
   - `bloodGroup`: String
   - `allergies`: String?
   - `emergencyContact`: String

3. **Doctor** (`doctors`)
   - `id`: String (UUID, PK)
   - `userId`: String (FK -> User.id, Unique)
   - `specialization`: String
   - `roomNo`: String
   - `phone`: String

4. **DoctorSchedule** (`doctor_schedules`)
   - `id`: String (UUID, PK)
   - `doctorId`: String (FK -> Doctor.id)
   - `dayOfWeek`: Int (0 = Sun, 1 = Mon, ..., 6 = Sat)
   - `startTime`: String ("09:00")
   - `endTime`: String ("17:00")
   - `slotDuration`: Int (minutes, default 15)
   - `active`: Boolean

5. **Appointment** (`appointments`)
   - `id`: String (UUID, PK)
   - `studentId`: String (FK -> Student.id)
   - `doctorId`: String (FK -> Doctor.id)
   - `date`: DateTime
   - `timeSlot`: String ("09:30")
   - `status`: Enum (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`)
   - `tokenNo`: Int
   - Unique Index: `(doctorId, date, timeSlot)` to prevent double booking.

6. **Visit** (`visits`)
   - `id`: String (UUID, PK)
   - `appointmentId`: String (FK -> Appointment.id, Unique)
   - `studentId`: String (FK -> Student.id)
   - `doctorId`: String (FK -> Doctor.id)
   - `symptoms`: String
   - `diagnosis`: String
   - `notes`: String?
   - `createdAt`: DateTime

7. **Medicine** (`medicines`)
   - `id`: String (UUID, PK)
   - `name`: String (Unique)
   - `category`: String
   - `unit`: String
   - `quantity`: Int
   - `expiryDate`: DateTime
   - `reorderLevel`: Int
   - `isActive`: Boolean

8. **Prescription** (`prescriptions`)
   - `id`: String (UUID, PK)
   - `appointmentId`: String (FK -> Appointment.id)
   - `visitId`: String? (FK -> Visit.id)
   - `status`: Enum (`PENDING_DISPENSE`, `DISPENSED`)
   - `createdAt`, `updatedAt`

9. **PrescriptionItem** (`prescription_items`)
   - `id`: String (UUID, PK)
   - `prescriptionId`: String (FK -> Prescription.id)
   - `medicineId`: String (FK -> Medicine.id)
   - `quantity`: Int
   - `dosageInstructions`: String

10. **StockTransaction** (`stock_transactions`)
    - `id`: String (UUID, PK)
    - `medicineId`: String (FK -> Medicine.id)
    - `type`: Enum (`IN`, `OUT`)
    - `quantity`: Int
    - `performedByUserId`: String (FK -> User.id)
    - `referenceNotes`: String?
    - `createdAt`: DateTime

11. **Notification** (`notifications`)
    - `id`: String (UUID, PK)
    - `userId`: String (FK -> User.id)
    - `title`: String
    - `message`: String
    - `type`: String
    - `isRead`: Boolean
    - `createdAt`: DateTime
