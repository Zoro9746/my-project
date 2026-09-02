import request from 'supertest';
import { app } from '../index';
import { prisma } from '../config/prisma';

describe('Phase 2 — Appointment Scheduling Integration Tests', () => {
  let studentToken: string;
  let doctorToken: string;
  let doctorId: string;
  let appointmentId: string;
  const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  beforeAll(async () => {
    // Clear and seed fresh test database state
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

    // Register Student
    const studentRes = await request(app).post('/api/auth/register').send({
      email: 'appoint.student@bitsathy.ac.in',
      password: 'StudentPass@123',
      name: 'Appoint Student',
      rollNo: '211APP01',
      department: 'CSE',
      bloodGroup: 'B+',
      emergencyContact: '+91 98765 00000',
    });
    studentToken = studentRes.body.data.token;

    // Create Doctor User & Profile
    const doctorUser = await prisma.user.create({
      data: {
        email: 'appoint.doctor@bitsathy.ac.in',
        passwordHash: '$2a$10$e81q3.a2k8l5y7Xb0Wz44u/4rYfD8pXvUeS8x6tH1z0wX1vUeS8x6', // dummy hash
        name: 'Dr. Test Specialist',
        role: 'DOCTOR',
        isActive: true,
        doctor: {
          create: {
            specialization: 'Cardiology',
            roomNo: 'HC-201',
            phone: '+91 99999 11111',
          },
        },
      },
      include: { doctor: true },
    });

    doctorId = doctorUser.doctor!.id;

    // Login Doctor
    const docLogin = await request(app).post('/api/auth/login').send({
      email: 'appoint.doctor@bitsathy.ac.in',
      password: 'DoctorPass@123', // fallback or direct login
    });
    doctorToken = docLogin.body?.data?.token || '';

    // Create Doctor Schedule for all days of week
    for (let day = 0; day <= 6; day++) {
      await prisma.doctorSchedule.create({
        data: {
          doctorId,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 15,
          active: true,
        },
      });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Should list doctors directory', async () => {
    const res = await request(app)
      .get('/api/doctors')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('Should compute doctor availability slots for target date', async () => {
    const res = await request(app)
      .get(`/api/doctors/${doctorId}/availability?date=${tomorrowStr}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isWorkingDay).toBe(true);
    expect(res.body.data.slots.length).toBeGreaterThan(0);
    expect(res.body.data.slots[0].timeSlot).toBe('09:00');
  });

  it('Should successfully book an appointment & assign daily Token #1', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        doctorId,
        date: tomorrowStr,
        timeSlot: '09:30',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokenNo).toBe(1);
    expect(res.body.data.status).toBe('CONFIRMED');

    appointmentId = res.body.data.id;
  });

  it('Should reject duplicate booking attempt on the same slot', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        doctorId,
        date: tomorrowStr,
        timeSlot: '09:30',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already booked');
  });

  it('Should reject booking for past date', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        doctorId,
        date: '2020-01-01',
        timeSlot: '10:00',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('past');
  });

  it('Should reschedule appointment to a new available time slot', async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/reschedule`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        newDate: tomorrowStr,
        newTimeSlot: '11:00',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.timeSlot).toBe('11:00');
  });

  it('Should cancel appointment and free up the time slot', async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/cancel`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CANCELLED');
  });
});
