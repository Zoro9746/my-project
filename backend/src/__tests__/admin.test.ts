import request from 'supertest';
import { app } from '../index';
import { prisma } from '../config/prisma';
import { generateToken } from '../utils/jwt';

describe('Phase 5 — Admin Panel & Analytics Integration Tests', () => {
  let adminToken: string;
  let studentToken: string;
  let studentUserId: string;
  let doctorId: string;

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

    // 1. Create Admin User
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin.test@bitsathy.ac.in',
        passwordHash: '$2a$10$e81q3.a2k8l5y7Xb0Wz44u/4rYfD8pXvUeS8x6tH1z0wX1vUeS8x6',
        name: 'Admin Tester',
        role: 'ADMIN',
        isActive: true,
      },
    });

    adminToken = generateToken({
      userId: adminUser.id,
      email: adminUser.email,
      role: 'ADMIN',
      name: adminUser.name,
    });

    // 2. Create Target Student User
    const studentUser = await prisma.user.create({
      data: {
        email: 'admin.student@bitsathy.ac.in',
        passwordHash: '$2a$10$e81q3.a2k8l5y7Xb0Wz44u/4rYfD8pXvUeS8x6tH1z0wX1vUeS8x6',
        name: 'Admin Target Student',
        role: 'STUDENT',
        isActive: true,
        student: {
          create: {
            rollNo: '211ADM01',
            department: 'Computer Science',
            bloodGroup: 'O+',
            emergencyContact: '+91 99999 11111',
          },
        },
      },
      include: { student: true },
    });
    studentUserId = studentUser.id;

    studentToken = generateToken({
      userId: studentUser.id,
      email: studentUser.email,
      role: 'STUDENT',
      name: studentUser.name,
    });

    // 3. Create Doctor User & Profile
    const doctorUser = await prisma.user.create({
      data: {
        email: 'admin.doctor@bitsathy.ac.in',
        passwordHash: 'dummy',
        name: 'Dr. Admin Target',
        role: 'DOCTOR',
        isActive: true,
        doctor: {
          create: {
            specialization: 'Pediatrics',
            roomNo: 'HC-105',
            phone: '+91 99999 22222',
          },
        },
      },
      include: { doctor: true },
    });
    doctorId = doctorUser.doctor!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Should fetch admin analytics overview metrics', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.users.totalStudents).toBeGreaterThan(0);
    expect(res.body.data.users.totalDoctors).toBeGreaterThan(0);
  });

  it('Should search and filter system users by role', async () => {
    const res = await request(app)
      .get('/api/admin/users?role=STUDENT&search=211ADM01')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].student.rollNo).toBe('211ADM01');
  });

  it('Should toggle user active/inactive status successfully', async () => {
    // Deactivate student
    const deactivateRes = await request(app)
      .patch(`/api/admin/users/${studentUserId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });

    expect(deactivateRes.status).toBe(200);
    expect(deactivateRes.body.data.isActive).toBe(false);

    // Reactivate student
    const reactivateRes = await request(app)
      .patch(`/api/admin/users/${studentUserId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: true });

    expect(reactivateRes.status).toBe(200);
    expect(reactivateRes.body.data.isActive).toBe(true);
  });

  it('Should reset user password by admin', async () => {
    const res = await request(app)
      .post(`/api/admin/users/${studentUserId}/reset-password`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ newPassword: 'NewAdminSecretPass@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('Should update doctor specialization and room number', async () => {
    const res = await request(app)
      .put(`/api/admin/doctors/${doctorId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        specialization: 'Senior Cardiology Specialist',
        roomNo: 'HC-999',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.specialization).toBe('Senior Cardiology Specialist');
    expect(res.body.data.roomNo).toBe('HC-999');
  });

  it('Should reject non-admin users attempting to access admin endpoints (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
