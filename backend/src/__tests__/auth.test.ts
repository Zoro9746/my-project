import request from 'supertest';
import { app } from '../index';
import { prisma } from '../config/prisma';

describe('Authentication & Authorization Integration Tests', () => {
  const testStudent = {
    email: 'test.student@bitsathy.ac.in',
    password: 'TestPassword@123',
    name: 'Test Student',
    rollNo: '211TEST99',
    department: 'Information Technology',
    bloodGroup: 'A+',
    emergencyContact: '+91 99999 88888',
  };

  let studentToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Ensure test environment is seeded or clear
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

    // Create Admin for RBAC test
    const adminUser = await request(app).post('/api/auth/register').send({
      ...testStudent,
      email: 'test.admin@bitsathy.ac.in',
      rollNo: '211ADM01',
    });

    // Manually elevate role to ADMIN for testing
    await prisma.user.update({
      where: { email: 'test.admin@bitsathy.ac.in' },
      data: { role: 'ADMIN' },
    });

    const adminLoginRes = await request(app).post('/api/auth/login').send({
      email: 'test.admin@bitsathy.ac.in',
      password: 'TestPassword@123',
    });
    adminToken = adminLoginRes.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Should successfully register a new student', async () => {
    const res = await request(app).post('/api/auth/register').send(testStudent);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testStudent.email);
    expect(res.body.data.token).toBeDefined();
    studentToken = res.body.data.token;
  });

  it('Should reject duplicate student registration with same email or rollNo', async () => {
    const res = await request(app).post('/api/auth/register').send(testStudent);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('Should login student with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testStudent.email,
      password: testStudent.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('STUDENT');
  });

  it('Should reject login with invalid password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testStudent.email,
      password: 'WrongPassword!',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Should fetch authenticated profile using valid JWT token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(testStudent.email);
    expect(res.body.data.student.rollNo).toBe(testStudent.rollNo);
  });

  it('Should enforce RBAC: deny Student access to Admin-only user list', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Should grant Admin access to Admin-only user list', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
