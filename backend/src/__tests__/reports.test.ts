import request from 'supertest';
import { app } from '../index';
import { prisma } from '../config/prisma';
import { generateToken } from '../utils/jwt';
import { NotificationService } from '../services/notificationService';

describe('Phase 6 — Notifications & Reporting Engine Integration Tests', () => {
  let adminToken: string;
  let studentToken: string;
  let studentUserId: string;

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
        email: 'report.admin@bitsathy.ac.in',
        passwordHash: 'dummy',
        name: 'Report Admin',
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

    // 2. Create Student User
    const studentUser = await prisma.user.create({
      data: {
        email: 'report.student@bitsathy.ac.in',
        passwordHash: 'dummy',
        name: 'Report Student',
        role: 'STUDENT',
        isActive: true,
        student: {
          create: {
            rollNo: '211RPT01',
            department: 'Civil',
            bloodGroup: 'AB+',
            emergencyContact: '+91 99999 88888',
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
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Should create notification and retrieve user notifications list with unread count', async () => {
    await NotificationService.createNotification({
      userId: studentUserId,
      title: 'Test Notification Title',
      message: 'This is a test notification message for student.',
      type: 'SYSTEM',
    });

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.unreadCount).toBe(1);
    expect(res.body.data.notifications.length).toBe(1);
    expect(res.body.data.notifications[0].title).toBe('Test Notification Title');
  });

  it('Should mark single notification as read', async () => {
    const listRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);

    const notifId = listRes.body.data.notifications[0].id;

    const readRes = await request(app)
      .patch(`/api/notifications/${notifId}/read`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(readRes.status).toBe(200);
    expect(readRes.body.data.isRead).toBe(true);
  });

  it('Should fetch appointment summary report for admin', async () => {
    const res = await request(app)
      .get('/api/reports/appointments')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalAppointments).toBeDefined();
  });

  it('Should fetch medication consumption report for admin', async () => {
    const res = await request(app)
      .get('/api/reports/medications')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.medicinesConsumedCount).toBeDefined();
  });

  it('Should fetch stock and expiry audit report', async () => {
    const res = await request(app)
      .get('/api/reports/stock-alerts')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalActiveMedicines).toBeDefined();
  });

  it('Should fetch patient visit history report', async () => {
    const res = await request(app)
      .get('/api/reports/visits')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalVisits).toBeDefined();
  });
});
