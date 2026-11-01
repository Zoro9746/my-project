import request from 'supertest';
import { app } from '../index';
import { prisma } from '../config/prisma';
import { generateToken } from '../utils/jwt';

describe('Phase 4 — Medication Stock Control Integration Tests', () => {
  let pharmacistToken: string;
  let pharmacistId: string;
  let studentId: string;
  let doctorId: string;
  let medicineId: string;
  let expiredMedId: string;
  let prescriptionId: string;
  const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  beforeAll(async () => {
    // Clear and seed clean test database state
    await prisma.notification.deleteMany({});
    await prisma.stockTransaction.deleteMany({});
    await prisma.prescriptionItem.deleteMany({});
    await prisma.prescription.deleteMany({});
    await prisma.visit.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.doctorSchedule.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.doctor.deleteMany({});
    await prisma.medicine.deleteMany({});
    await prisma.user.deleteMany({});

    // 1. Create Pharmacist User
    const pharmaUser = await prisma.user.create({
      data: {
        email: 'pharma.test@bitsathy.ac.in',
        passwordHash: '$2a$10$e81q3.a2k8l5y7Xb0Wz44u/4rYfD8pXvUeS8x6tH1z0wX1vUeS8x6',
        name: 'Pharma Tester',
        role: 'PHARMACIST',
        isActive: true,
      },
    });
    pharmacistId = pharmaUser.id;
    pharmacistToken = generateToken({
      userId: pharmaUser.id,
      email: pharmaUser.email,
      role: 'PHARMACIST',
      name: pharmaUser.name,
    });

    // 2. Create Student
    const studentUser = await prisma.user.create({
      data: {
        email: 'stock.student@bitsathy.ac.in',
        passwordHash: 'dummy',
        name: 'Stock Student',
        role: 'STUDENT',
        isActive: true,
        student: {
          create: {
            rollNo: '211STK01',
            department: 'ECE',
            bloodGroup: 'B+',
            emergencyContact: '+91 99999 44444',
          },
        },
      },
      include: { student: true },
    });
    studentId = studentUser.student!.id;

    // 3. Create Doctor
    const doctorUser = await prisma.user.create({
      data: {
        email: 'stock.doctor@bitsathy.ac.in',
        passwordHash: 'dummy',
        name: 'Dr. Stock Doctor',
        role: 'DOCTOR',
        isActive: true,
        doctor: {
          create: {
            specialization: 'General',
            roomNo: 'HC-401',
            phone: '+91 99999 55555',
          },
        },
      },
      include: { doctor: true },
    });
    doctorId = doctorUser.doctor!.id;

    // 4. Create Active Medicine (Stock: 50, Reorder: 20)
    const activeMed = await prisma.medicine.create({
      data: {
        name: 'Amoxicillin 500mg Test',
        category: 'Antibiotics',
        unit: 'Capsules',
        quantity: 50,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
        reorderLevel: 20,
        isActive: true,
      },
    });
    medicineId = activeMed.id;

    // 5. Create Expired Medicine (Stock: 30)
    const expiredMed = await prisma.medicine.create({
      data: {
        name: 'Expired Test Medicine',
        category: 'Test',
        unit: 'Tablets',
        quantity: 30,
        expiryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        reorderLevel: 5,
        isActive: true,
      },
    });
    expiredMedId = expiredMed.id;

    // 6. Create Appointment & Visit & Prescription (PENDING_DISPENSE)
    const appt = await prisma.appointment.create({
      data: {
        studentId,
        doctorId,
        date: new Date(tomorrowStr),
        timeSlot: '09:00',
        status: 'COMPLETED',
        tokenNo: 1,
      },
    });

    const visit = await prisma.visit.create({
      data: {
        appointmentId: appt.id,
        studentId,
        doctorId,
        symptoms: 'Fever',
        diagnosis: 'Infection',
      },
    });

    const prescription = await prisma.prescription.create({
      data: {
        appointmentId: appt.id,
        visitId: visit.id,
        status: 'PENDING_DISPENSE',
        items: {
          create: [
            {
              medicineId,
              quantity: 10,
              dosageInstructions: '1 capsule 2x daily',
            },
          ],
        },
      },
    });
    prescriptionId = prescription.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Should successfully dispense prescription, deduct stock (50 -> 40), and mark status DISPENSED', async () => {
    const res = await request(app)
      .post('/api/stock/dispense')
      .set('Authorization', `Bearer ${pharmacistToken}`)
      .send({ prescriptionId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('DISPENSED');

    // Verify stock deduction in database
    const med = await prisma.medicine.findUnique({ where: { id: medicineId } });
    expect(med?.quantity).toBe(40); // 50 - 10

    // Verify Stock OUT audit transaction logged
    const tx = await prisma.stockTransaction.findFirst({
      where: { medicineId, type: 'OUT' },
    });
    expect(tx).toBeDefined();
    expect(tx?.quantity).toBe(10);
  });

  it('Should reject duplicate dispensing attempt for already DISPENSED prescription', async () => {
    const res = await request(app)
      .post('/api/stock/dispense')
      .set('Authorization', `Bearer ${pharmacistToken}`)
      .send({ prescriptionId });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already been dispensed');
  });

  it('Should reject dispensing if medicine is expired', async () => {
    // Create new appointment & prescription with expired medicine
    const appt = await prisma.appointment.create({
      data: {
        studentId,
        doctorId,
        date: new Date(tomorrowStr),
        timeSlot: '09:30',
        status: 'COMPLETED',
        tokenNo: 2,
      },
    });

    const visit = await prisma.visit.create({
      data: {
        appointmentId: appt.id,
        studentId,
        doctorId,
        symptoms: 'Cold',
        diagnosis: 'Test',
      },
    });

    const expiredPrescription = await prisma.prescription.create({
      data: {
        appointmentId: appt.id,
        visitId: visit.id,
        status: 'PENDING_DISPENSE',
        items: {
          create: [
            {
              medicineId: expiredMedId,
              quantity: 5,
              dosageInstructions: '1 tab',
            },
          ],
        },
      },
    });

    const res = await request(app)
      .post('/api/stock/dispense')
      .set('Authorization', `Bearer ${pharmacistToken}`)
      .send({ prescriptionId: expiredPrescription.id });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('expired');
  });

  it('Should successfully execute Stock-IN inward addition (40 -> 60)', async () => {
    const res = await request(app)
      .post('/api/stock/in')
      .set('Authorization', `Bearer ${pharmacistToken}`)
      .send({
        medicineId,
        quantity: 20,
        referenceNotes: 'Received new batch from supplier',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const med = await prisma.medicine.findUnique({ where: { id: medicineId } });
    expect(med?.quantity).toBe(60); // 40 + 20
  });

  it('Should calculate low-stock and near-expiry alerts correctly', async () => {
    // Create low-stock medicine (Qty: 5, Reorder: 15)
    await prisma.medicine.create({
      data: {
        name: 'Cetirizine Low Stock Test',
        category: 'Antihistamine',
        unit: 'Tablets',
        quantity: 5,
        expiryDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
        reorderLevel: 15,
        isActive: true,
      },
    });

    const res = await request(app)
      .get('/api/stock/alerts')
      .set('Authorization', `Bearer ${pharmacistToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary.lowStockCount).toBeGreaterThan(0);
    expect(res.body.data.summary.expiredCount).toBeGreaterThan(0);
  });
});
