import request from 'supertest';
import { app } from '../index';
import { prisma } from '../config/prisma';
import { generateToken } from '../utils/jwt';

describe('Phase 3 — Patient Records & Prescriptions Integration Tests', () => {
  let studentToken: string;
  let doctorToken: string;
  let studentId: string;
  let doctorId: string;
  let appointmentId: string;
  let medicineId: string;
  let initialMedQuantity: number;
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

    // 1. Create Student User & Profile
    const studentUser = await prisma.user.create({
      data: {
        email: 'prescribe.student@bitsathy.ac.in',
        passwordHash: '$2a$10$e81q3.a2k8l5y7Xb0Wz44u/4rYfD8pXvUeS8x6tH1z0wX1vUeS8x6',
        name: 'Prescription Test Student',
        role: 'STUDENT',
        isActive: true,
        student: {
          create: {
            rollNo: '211PRE01',
            department: 'Information Technology',
            bloodGroup: 'O+',
            emergencyContact: '+91 98765 22222',
          },
        },
      },
      include: { student: true },
    });
    studentId = studentUser.student!.id;

    // Login Student
    const studentLogin = await request(app).post('/api/auth/login').send({
      email: 'prescribe.student@bitsathy.ac.in',
      password: 'StudentPass@123',
    });
    studentToken = studentLogin.body?.data?.token || '';

    // 2. Create Doctor User & Profile
    const doctorUser = await prisma.user.create({
      data: {
        email: 'prescribe.doctor@bitsathy.ac.in',
        passwordHash: '$2a$10$e81q3.a2k8l5y7Xb0Wz44u/4rYfD8pXvUeS8x6tH1z0wX1vUeS8x6',
        name: 'Dr. Consultation Expert',
        role: 'DOCTOR',
        isActive: true,
        doctor: {
          create: {
            specialization: 'General Medicine',
            roomNo: 'HC-301',
            phone: '+91 98765 33333',
          },
        },
      },
      include: { doctor: true },
    });
    doctorId = doctorUser.doctor!.id;

    doctorToken = generateToken({
      userId: doctorUser.id,
      email: doctorUser.email,
      role: 'DOCTOR',
      name: doctorUser.name,
    });

    // 3. Create Active Medicine
    const medicine = await prisma.medicine.create({
      data: {
        name: 'Paracetamol 500mg Test',
        category: 'Analgesics',
        unit: 'Tablets',
        quantity: 100,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
        reorderLevel: 20,
        isActive: true,
      },
    });
    medicineId = medicine.id;
    initialMedQuantity = medicine.quantity;

    // 4. Create Appointment
    const appointment = await prisma.appointment.create({
      data: {
        studentId,
        doctorId,
        date: new Date(tomorrowStr),
        timeSlot: '10:30',
        status: 'CONFIRMED',
        tokenNo: 1,
      },
    });
    appointmentId = appointment.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Should complete consultation, create visit record, and issue prescription with status PENDING_DISPENSE', async () => {
    const res = await request(app)
      .post('/api/consultations')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        appointmentId,
        symptoms: 'High fever, severe headache, sore throat',
        diagnosis: 'Acute Upper Respiratory Tract Infection',
        notes: 'Advised 3 days rest and fluid intake.',
        prescriptionItems: [
          {
            medicineId,
            quantity: 10,
            dosageInstructions: '1 tablet 3 times a day after meals',
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.visit.symptoms).toContain('fever');
    expect(res.body.data.prescription.status).toBe('PENDING_DISPENSE');
    expect(res.body.data.prescription.items.length).toBe(1);
  });

  it('Should verify medicine stock quantity remains UNCHANGED after prescription creation', async () => {
    const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } });
    expect(medicine?.quantity).toBe(initialMedQuantity); // Still 100, not 90
  });

  it('Should reject consultation with invalid/non-existent medicine', async () => {
    // Create new appointment for test
    const appt = await prisma.appointment.create({
      data: {
        studentId,
        doctorId,
        date: new Date(tomorrowStr),
        timeSlot: '11:30',
        status: 'CONFIRMED',
        tokenNo: 2,
      },
    });

    const res = await request(app)
      .post('/api/consultations')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        appointmentId: appt.id,
        symptoms: 'Mild cold',
        diagnosis: 'Common cold',
        prescriptionItems: [
          {
            medicineId: 'non-existent-uuid',
            quantity: 5,
            dosageInstructions: '1 tab daily',
          },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('Should fetch patient medical history including completed visits and prescriptions', async () => {
    const res = await request(app)
      .get(`/api/consultations/patients/${studentId}/history`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.visits.length).toBeGreaterThan(0);
    expect(res.body.data.visits[0].diagnosis).toBe('Acute Upper Respiratory Tract Infection');
    expect(res.body.data.visits[0].prescriptions.length).toBeGreaterThan(0);
  });
});
