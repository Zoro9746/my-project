import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Password hashes
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const doctorPassword = await bcrypt.hash('Doctor@123', 10);
  const pharmaPassword = await bcrypt.hash('Pharma@123', 10);
  const studentPassword = await bcrypt.hash('Student@123', 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bitsathy.ac.in' },
    update: {
      passwordHash: adminPassword,
      isActive: true,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@bitsathy.ac.in',
      name: 'System Administrator',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // 2. Create Doctors
  const doctorUser1 = await prisma.user.upsert({
    where: { email: 'dr.smith@bitsathy.ac.in' },
    update: {
      passwordHash: doctorPassword,
      isActive: true,
      role: 'DOCTOR',
    },
    create: {
      email: 'dr.smith@bitsathy.ac.in',
      name: 'Dr. K. Smith, M.D.',
      passwordHash: doctorPassword,
      role: 'DOCTOR',
      isActive: true,
      doctor: {
        create: {
          specialization: 'General Medicine & Primary Care',
          roomNo: 'HC-101',
          phone: '+91 98765 43210',
        },
      },
    },
    include: { doctor: true },
  });

  const doctorUser2 = await prisma.user.upsert({
    where: { email: 'dr.priya@bitsathy.ac.in' },
    update: {
      passwordHash: doctorPassword,
      isActive: true,
      role: 'DOCTOR',
    },
    create: {
      email: 'dr.priya@bitsathy.ac.in',
      name: 'Dr. R. Priya, M.S.',
      passwordHash: doctorPassword,
      role: 'DOCTOR',
      isActive: true,
      doctor: {
        create: {
          specialization: 'Dermatology & Student Wellness',
          roomNo: 'HC-102',
          phone: '+91 98765 43211',
        },
      },
    },
    include: { doctor: true },
  });
  console.log('✅ Doctors created:', doctorUser1.email, doctorUser2.email);

  // Clear existing schedules for seed doctors to avoid duplicate constraints
  if (doctorUser1.doctor) {
    await prisma.doctorSchedule.deleteMany({ where: { doctorId: doctorUser1.doctor.id } });
    for (let day = 1; day <= 6; day++) {
      await prisma.doctorSchedule.create({
        data: {
          doctorId: doctorUser1.doctor.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 15,
          active: true,
        },
      });
    }
  }

  if (doctorUser2.doctor) {
    await prisma.doctorSchedule.deleteMany({ where: { doctorId: doctorUser2.doctor.id } });
    for (let day = 1; day <= 6; day++) {
      await prisma.doctorSchedule.create({
        data: {
          doctorId: doctorUser2.doctor.id,
          dayOfWeek: day,
          startTime: '10:00',
          endTime: '16:00',
          slotDuration: 20,
          active: true,
        },
      });
    }
  }

  // 3. Create Pharmacist
  const pharmacist = await prisma.user.upsert({
    where: { email: 'pharma@bitsathy.ac.in' },
    update: {
      passwordHash: pharmaPassword,
      isActive: true,
      role: 'PHARMACIST',
    },
    create: {
      email: 'pharma@bitsathy.ac.in',
      name: 'S. Kumar (Senior Pharmacist)',
      passwordHash: pharmaPassword,
      role: 'PHARMACIST',
      isActive: true,
    },
  });
  console.log('✅ Pharmacist user created:', pharmacist.email);

  // 4. Create Students
  const studentUser1 = await prisma.user.upsert({
    where: { email: '7376211cs101@bitsathy.ac.in' },
    update: {
      passwordHash: studentPassword,
      isActive: true,
      role: 'STUDENT',
    },
    create: {
      email: '7376211cs101@bitsathy.ac.in',
      name: 'A. Rahul',
      passwordHash: studentPassword,
      role: 'STUDENT',
      isActive: true,
      student: {
        create: {
          rollNo: '211CS101',
          department: 'Computer Science and Engineering',
          bloodGroup: 'B+',
          allergies: 'Penicillin allergy',
          emergencyContact: '+91 91234 56789 (Father)',
        },
      },
    },
    include: { student: true },
  });

  const studentUser2 = await prisma.user.upsert({
    where: { email: '7376211ec202@bitsathy.ac.in' },
    update: {
      passwordHash: studentPassword,
      isActive: true,
      role: 'STUDENT',
    },
    create: {
      email: '7376211ec202@bitsathy.ac.in',
      name: 'M. Sneha',
      passwordHash: studentPassword,
      role: 'STUDENT',
      isActive: true,
      student: {
        create: {
          rollNo: '211EC202',
          department: 'Electronics and Communication Engineering',
          bloodGroup: 'O+',
          allergies: 'Dust allergy',
          emergencyContact: '+91 98765 12345 (Mother)',
        },
      },
    },
    include: { student: true },
  });
  console.log('✅ Students created:', studentUser1.email, studentUser2.email);

  // 5. Seed Essential Medicines
  const medicines = [
    {
      name: 'Paracetamol 500mg',
      category: 'Analgesics & Antipyretics',
      unit: 'Tablets',
      quantity: 120,
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
      reorderLevel: 30,
    },
    {
      name: 'Amoxicillin 500mg',
      category: 'Antibiotics',
      unit: 'Capsules',
      quantity: 65,
      expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      reorderLevel: 25,
    },
    {
      name: 'Cetirizine 10mg',
      category: 'Antihistamines',
      unit: 'Tablets',
      quantity: 8, // Low Stock Trigger
      expiryDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
      reorderLevel: 25,
    },
    {
      name: 'Azithromycin 250mg',
      category: 'Antibiotics',
      unit: 'Tablets',
      quantity: 38,
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Near Expiry (15 days)
      reorderLevel: 15,
    },
    {
      name: 'ORS Electrolyte Sachet',
      category: 'Rehydration Solutions',
      unit: 'Sachets',
      quantity: 185,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      reorderLevel: 50,
    },
    {
      name: 'Ibuprofen 400mg',
      category: 'Analgesics & Antipyretics',
      unit: 'Tablets',
      quantity: 90,
      expiryDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000),
      reorderLevel: 20,
    },
    {
      name: 'Pantoprazole 40mg',
      category: 'Antacids & GI',
      unit: 'Tablets',
      quantity: 60,
      expiryDate: new Date(Date.now() + 210 * 24 * 60 * 60 * 1000),
      reorderLevel: 15,
    },
    {
      name: 'Vitamin C 500mg',
      category: 'Vitamins & Supplements',
      unit: 'Tablets',
      quantity: 200,
      expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
      reorderLevel: 40,
    },
  ];

  const medMap: Record<string, string> = {};
  for (const med of medicines) {
    const createdMed = await prisma.medicine.upsert({
      where: { name: med.name },
      update: {
        quantity: med.quantity,
        expiryDate: med.expiryDate,
        reorderLevel: med.reorderLevel,
        isActive: true,
      },
      create: { ...med, isActive: true },
    });
    medMap[med.name] = createdMed.id;

    await prisma.stockTransaction.create({
      data: {
        medicineId: createdMed.id,
        type: 'IN',
        quantity: med.quantity,
        performedByUserId: pharmacist.id,
        referenceNotes: 'Initial Seed Inventory Stock',
      },
    });
  }
  console.log('✅ Medicines & initial stock seeded!');

  // ─────────────────────────────────────────────────────────────
  // 6. Fetch student & doctor profile records
  // ─────────────────────────────────────────────────────────────
  const student1 = await prisma.student.findUnique({ where: { userId: studentUser1.id } });
  const student2 = await prisma.student.findUnique({ where: { userId: studentUser2.id } });
  const doctor1  = await prisma.doctor.findUnique({ where: { userId: doctorUser1.id } });
  const doctor2  = await prisma.doctor.findUnique({ where: { userId: doctorUser2.id } });

  if (!student1 || !student2 || !doctor1 || !doctor2) {
    throw new Error('Student or Doctor profile not found after upsert.');
  }

  // Helper: create a past date (days ago at a fixed time)
  const daysAgo = (n: number, hour = 10, minute = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  // Helper: date only (start of day) for appointment.date
  const dateOnly = (d: Date) => {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy;
  };

  // ─────────────────────────────────────────────────────────────
  // 7. PAST VISIT 1 — Rahul, 18 days ago, Dr. Smith
  //    Fever + Throat infection → Paracetamol + Amoxicillin → DISPENSED
  // ─────────────────────────────────────────────────────────────
  const appt1Date = daysAgo(18, 10, 0);
  const existingAppt1 = await prisma.appointment.findFirst({
    where: { studentId: student1.id, doctorId: doctor1.id, timeSlot: '10:00', date: { gte: dateOnly(appt1Date), lt: new Date(dateOnly(appt1Date).getTime() + 86400000) } },
  });
  const appt1 = existingAppt1 ?? await prisma.appointment.create({
    data: {
      studentId: student1.id,
      doctorId: doctor1.id,
      date: appt1Date,
      timeSlot: '10:00',
      status: 'COMPLETED',
      tokenNo: 1,
    },
  });

  const existingVisit1 = await prisma.visit.findUnique({ where: { appointmentId: appt1.id } });
  const visit1 = existingVisit1 ?? await prisma.visit.create({
    data: {
      appointmentId: appt1.id,
      studentId: student1.id,
      doctorId: doctor1.id,
      symptoms: 'High fever (102°F), severe sore throat, body ache, fatigue for 2 days',
      diagnosis: 'Acute Pharyngitis with Viral Fever',
      notes: 'Advised rest for 3 days. Stay hydrated. Return if fever persists beyond 3 days. No known drug interactions. Penicillin allergy noted — Amoxicillin avoided, Azithromycin prescribed instead.',
    },
  });

  const existingPrx1 = await prisma.prescription.findUnique({ where: { appointmentId: appt1.id } });
  const prx1 = existingPrx1 ?? await prisma.prescription.create({
    data: {
      appointmentId: appt1.id,
      visitId: visit1.id,
      status: 'DISPENSED',
      items: {
        create: [
          { medicineId: medMap['Paracetamol 500mg'], quantity: 15, dosageInstructions: '1 tablet every 8 hours for 5 days. Take after food.' },
          { medicineId: medMap['Azithromycin 250mg'], quantity: 6, dosageInstructions: '1 tablet daily for 5 days (penicillin allergy — using Azithromycin). Take after food.' },
          { medicineId: medMap['Vitamin C 500mg'], quantity: 10, dosageInstructions: '1 tablet daily for 10 days to boost immunity.' },
        ],
      },
    },
  });

  // Stock OUT for dispensed prescription 1
  if (!existingPrx1) {
    await prisma.stockTransaction.createMany({
      data: [
        { medicineId: medMap['Paracetamol 500mg'], type: 'OUT', quantity: 15, performedByUserId: pharmacist.id, referenceNotes: `Dispensed for Prescription #${prx1.id.slice(0, 8)} — A. Rahul` },
        { medicineId: medMap['Azithromycin 250mg'], type: 'OUT', quantity: 6,  performedByUserId: pharmacist.id, referenceNotes: `Dispensed for Prescription #${prx1.id.slice(0, 8)} — A. Rahul` },
        { medicineId: medMap['Vitamin C 500mg'],   type: 'OUT', quantity: 10, performedByUserId: pharmacist.id, referenceNotes: `Dispensed for Prescription #${prx1.id.slice(0, 8)} — A. Rahul` },
      ],
    });
    // Notify student
    await prisma.notification.create({
      data: { userId: studentUser1.id, title: 'Prescription Dispensed', message: 'Your prescription from Dr. K. Smith has been dispensed. Please collect your medicines from the pharmacy.', type: 'INFO' },
    });
  }
  console.log('✅ Past Visit 1 (Rahul — Fever, 18 days ago) seeded.');

  // ─────────────────────────────────────────────────────────────
  // 8. PAST VISIT 2 — Sneha, 12 days ago, Dr. Priya
  //    Skin rash → Cetirizine → DISPENSED
  // ─────────────────────────────────────────────────────────────
  const appt2Date = daysAgo(12, 10, 0);
  const existingAppt2 = await prisma.appointment.findFirst({
    where: { studentId: student2.id, doctorId: doctor2.id, timeSlot: '10:00', date: { gte: dateOnly(appt2Date), lt: new Date(dateOnly(appt2Date).getTime() + 86400000) } },
  });
  const appt2 = existingAppt2 ?? await prisma.appointment.create({
    data: {
      studentId: student2.id,
      doctorId: doctor2.id,
      date: appt2Date,
      timeSlot: '10:00',
      status: 'COMPLETED',
      tokenNo: 1,
    },
  });

  const existingVisit2 = await prisma.visit.findUnique({ where: { appointmentId: appt2.id } });
  const visit2 = existingVisit2 ?? await prisma.visit.create({
    data: {
      appointmentId: appt2.id,
      studentId: student2.id,
      doctorId: doctor2.id,
      symptoms: 'Itchy red rash on forearms and neck, watery eyes, sneezing. Started after outdoor lab session.',
      diagnosis: 'Allergic Contact Dermatitis — Dust & Pollen Triggered',
      notes: 'Avoid dust exposure. Use mask during outdoor activities. Apply calamine lotion topically. Review in 7 days if not improving.',
    },
  });

  const existingPrx2 = await prisma.prescription.findUnique({ where: { appointmentId: appt2.id } });
  const prx2 = existingPrx2 ?? await prisma.prescription.create({
    data: {
      appointmentId: appt2.id,
      visitId: visit2.id,
      status: 'DISPENSED',
      items: {
        create: [
          { medicineId: medMap['Cetirizine 10mg'], quantity: 7, dosageInstructions: '1 tablet at night for 7 days. Avoid driving after taking.' },
          { medicineId: medMap['Vitamin C 500mg'], quantity: 7, dosageInstructions: '1 tablet daily for 7 days.' },
        ],
      },
    },
  });

  if (!existingPrx2) {
    await prisma.stockTransaction.createMany({
      data: [
        { medicineId: medMap['Cetirizine 10mg'], type: 'OUT', quantity: 7, performedByUserId: pharmacist.id, referenceNotes: `Dispensed for Prescription #${prx2.id.slice(0, 8)} — M. Sneha` },
        { medicineId: medMap['Vitamin C 500mg'], type: 'OUT', quantity: 7, performedByUserId: pharmacist.id, referenceNotes: `Dispensed for Prescription #${prx2.id.slice(0, 8)} — M. Sneha` },
      ],
    });
    await prisma.notification.create({
      data: { userId: studentUser2.id, title: 'Prescription Dispensed', message: 'Your prescription from Dr. R. Priya has been dispensed. Please collect your medicines from the pharmacy.', type: 'INFO' },
    });
  }
  console.log('✅ Past Visit 2 (Sneha — Allergic Rash, 12 days ago) seeded.');

  // ─────────────────────────────────────────────────────────────
  // 9. PAST VISIT 3 — Rahul, 5 days ago, Dr. Smith
  //    Stomach ache → Pantoprazole + ORS → DISPENSED
  // ─────────────────────────────────────────────────────────────
  const appt3Date = daysAgo(5, 11, 15);
  const existingAppt3 = await prisma.appointment.findFirst({
    where: { studentId: student1.id, doctorId: doctor1.id, timeSlot: '11:15', date: { gte: dateOnly(appt3Date), lt: new Date(dateOnly(appt3Date).getTime() + 86400000) } },
  });
  const appt3 = existingAppt3 ?? await prisma.appointment.create({
    data: {
      studentId: student1.id,
      doctorId: doctor1.id,
      date: appt3Date,
      timeSlot: '11:15',
      status: 'COMPLETED',
      tokenNo: 3,
    },
  });

  const existingVisit3 = await prisma.visit.findUnique({ where: { appointmentId: appt3.id } });
  const visit3 = existingVisit3 ?? await prisma.visit.create({
    data: {
      appointmentId: appt3.id,
      studentId: student1.id,
      doctorId: doctor1.id,
      symptoms: 'Stomach cramps, nausea, loose stools (2 episodes). Ate from canteen last night.',
      diagnosis: 'Acute Gastroenteritis — Mild',
      notes: 'Likely food-borne infection. Advised ORS frequently. Bland diet for 2 days. No spicy or oily food. Rest. Revisit if vomiting or blood in stool.',
    },
  });

  const existingPrx3 = await prisma.prescription.findUnique({ where: { appointmentId: appt3.id } });
  const prx3 = existingPrx3 ?? await prisma.prescription.create({
    data: {
      appointmentId: appt3.id,
      visitId: visit3.id,
      status: 'DISPENSED',
      items: {
        create: [
          { medicineId: medMap['Pantoprazole 40mg'], quantity: 4, dosageInstructions: '1 tablet before breakfast and dinner for 2 days.' },
          { medicineId: medMap['ORS Electrolyte Sachet'], quantity: 8, dosageInstructions: 'Dissolve 1 sachet in 200ml water. Drink after each loose stool, at least 4–6 per day.' },
        ],
      },
    },
  });

  if (!existingPrx3) {
    await prisma.stockTransaction.createMany({
      data: [
        { medicineId: medMap['Pantoprazole 40mg'],    type: 'OUT', quantity: 4, performedByUserId: pharmacist.id, referenceNotes: `Dispensed for Prescription #${prx3.id.slice(0, 8)} — A. Rahul` },
        { medicineId: medMap['ORS Electrolyte Sachet'], type: 'OUT', quantity: 8, performedByUserId: pharmacist.id, referenceNotes: `Dispensed for Prescription #${prx3.id.slice(0, 8)} — A. Rahul` },
      ],
    });
    await prisma.notification.create({
      data: { userId: studentUser1.id, title: 'Prescription Dispensed', message: 'Your prescription for Gastroenteritis from Dr. K. Smith has been dispensed.', type: 'INFO' },
    });
  }
  console.log('✅ Past Visit 3 (Rahul — Gastroenteritis, 5 days ago) seeded.');

  // ─────────────────────────────────────────────────────────────
  // 10. PAST VISIT 4 — Sneha, 3 days ago, Dr. Smith
  //     Headache + Cold → Paracetamol + Ibuprofen → DISPENSED
  // ─────────────────────────────────────────────────────────────
  const appt4Date = daysAgo(3, 9, 30);
  const existingAppt4 = await prisma.appointment.findFirst({
    where: { studentId: student2.id, doctorId: doctor1.id, timeSlot: '09:30', date: { gte: dateOnly(appt4Date), lt: new Date(dateOnly(appt4Date).getTime() + 86400000) } },
  });
  const appt4 = existingAppt4 ?? await prisma.appointment.create({
    data: {
      studentId: student2.id,
      doctorId: doctor1.id,
      date: appt4Date,
      timeSlot: '09:30',
      status: 'COMPLETED',
      tokenNo: 2,
    },
  });

  const existingVisit4 = await prisma.visit.findUnique({ where: { appointmentId: appt4.id } });
  const visit4 = existingVisit4 ?? await prisma.visit.create({
    data: {
      appointmentId: appt4.id,
      studentId: student2.id,
      doctorId: doctor1.id,
      symptoms: 'Persistent headache since morning, mild fever (99.5°F), runny nose, sneezing. Possible seasonal cold.',
      diagnosis: 'Common Cold with Tension Headache',
      notes: 'Seasonal viral infection. Adequate hydration, rest. No antibiotics required at this stage. Return if fever worsens.',
    },
  });

  const existingPrx4 = await prisma.prescription.findUnique({ where: { appointmentId: appt4.id } });
  const prx4 = existingPrx4 ?? await prisma.prescription.create({
    data: {
      appointmentId: appt4.id,
      visitId: visit4.id,
      status: 'DISPENSED',
      items: {
        create: [
          { medicineId: medMap['Paracetamol 500mg'], quantity: 6,  dosageInstructions: '1 tablet every 8 hours as needed for fever or headache. Max 3 per day.' },
          { medicineId: medMap['Ibuprofen 400mg'],   quantity: 6,  dosageInstructions: '1 tablet every 8 hours after food for 2 days for headache relief.' },
          { medicineId: medMap['Vitamin C 500mg'],   quantity: 5,  dosageInstructions: '1 tablet daily for 5 days.' },
        ],
      },
    },
  });

  if (!existingPrx4) {
    await prisma.stockTransaction.createMany({
      data: [
        { medicineId: medMap['Paracetamol 500mg'], type: 'OUT', quantity: 6, performedByUserId: pharmacist.id, referenceNotes: `Dispensed for Prescription #${prx4.id.slice(0, 8)} — M. Sneha` },
        { medicineId: medMap['Ibuprofen 400mg'],   type: 'OUT', quantity: 6, performedByUserId: pharmacist.id, referenceNotes: `Dispensed for Prescription #${prx4.id.slice(0, 8)} — M. Sneha` },
        { medicineId: medMap['Vitamin C 500mg'],   type: 'OUT', quantity: 5, performedByUserId: pharmacist.id, referenceNotes: `Dispensed for Prescription #${prx4.id.slice(0, 8)} — M. Sneha` },
      ],
    });
    await prisma.notification.create({
      data: { userId: studentUser2.id, title: 'Prescription Dispensed', message: 'Your prescription for Common Cold has been dispensed. Please collect from the pharmacy.', type: 'INFO' },
    });
  }
  console.log('✅ Past Visit 4 (Sneha — Cold & Headache, 3 days ago) seeded.');

  // ─────────────────────────────────────────────────────────────
  // 11. PENDING APPOINTMENT — Rahul, TODAY, 10:15, Dr. Smith
  //     Booked but not yet consulted → PENDING
  // ─────────────────────────────────────────────────────────────
  const todayDate = new Date();
  todayDate.setHours(10, 15, 0, 0);
  const existingTodayAppt = await prisma.appointment.findFirst({
    where: { studentId: student1.id, doctorId: doctor1.id, timeSlot: '10:15', date: { gte: dateOnly(todayDate), lt: new Date(dateOnly(todayDate).getTime() + 86400000) } },
  });
  if (!existingTodayAppt) {
    await prisma.appointment.create({
      data: {
        studentId: student1.id,
        doctorId: doctor1.id,
        date: todayDate,
        timeSlot: '10:15',
        status: 'PENDING',
        tokenNo: 1,
      },
    });
    await prisma.notification.create({
      data: { userId: studentUser1.id, title: 'Appointment Booked', message: 'Your appointment with Dr. K. Smith is confirmed for today at 10:15 AM. Token No: 1. Please arrive 10 minutes early.', type: 'INFO' },
    });
  }
  console.log('✅ Today\'s pending appointment (Rahul — Token 1, 10:15 AM) seeded.');

  // ─────────────────────────────────────────────────────────────
  // 12. PENDING APPOINTMENT — Sneha, TODAY, 10:20, Dr. Priya
  //     Booked for follow-up → PENDING
  // ─────────────────────────────────────────────────────────────
  const snehaApptDate = new Date();
  snehaApptDate.setHours(10, 20, 0, 0);
  const existingSnehaAppt = await prisma.appointment.findFirst({
    where: { studentId: student2.id, doctorId: doctor2.id, timeSlot: '10:20', date: { gte: dateOnly(snehaApptDate), lt: new Date(dateOnly(snehaApptDate).getTime() + 86400000) } },
  });
  if (!existingSnehaAppt) {
    await prisma.appointment.create({
      data: {
        studentId: student2.id,
        doctorId: doctor2.id,
        date: snehaApptDate,
        timeSlot: '10:20',
        status: 'PENDING',
        tokenNo: 1,
      },
    });
    await prisma.notification.create({
      data: { userId: studentUser2.id, title: 'Follow-up Appointment Booked', message: 'Your follow-up appointment with Dr. R. Priya is confirmed for today at 10:20 AM. Token No: 1.', type: 'INFO' },
    });
  }
  console.log('✅ Today\'s pending follow-up appointment (Sneha — Token 1, 10:20 AM) seeded.');

  // ─────────────────────────────────────────────────────────────
  // 13. UPCOMING APPOINTMENT — Rahul, 2 days from now, 09:15
  // ─────────────────────────────────────────────────────────────
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 2);
  futureDate.setHours(9, 15, 0, 0);
  const existingFutureAppt = await prisma.appointment.findFirst({
    where: { studentId: student1.id, doctorId: doctor1.id, timeSlot: '09:15', date: { gte: dateOnly(futureDate), lt: new Date(dateOnly(futureDate).getTime() + 86400000) } },
  });
  if (!existingFutureAppt) {
    await prisma.appointment.create({
      data: {
        studentId: student1.id,
        doctorId: doctor1.id,
        date: futureDate,
        timeSlot: '09:15',
        status: 'CONFIRMED',
        tokenNo: 2,
      },
    });
    await prisma.notification.create({
      data: { userId: studentUser1.id, title: 'Upcoming Appointment Reminder', message: `Your appointment with Dr. K. Smith is scheduled for ${futureDate.toDateString()} at 09:15 AM. Token No: 2.`, type: 'INFO' },
    });
  }
  console.log('✅ Future confirmed appointment (Rahul — 2 days ahead) seeded.');

  // ─────────────────────────────────────────────────────────────
  // 14. CANCELLED APPOINTMENT — Sneha, 7 days ago (she cancelled)
  // ─────────────────────────────────────────────────────────────
  const cancelDate = daysAgo(7, 14, 0);
  const existingCancelAppt = await prisma.appointment.findFirst({
    where: { studentId: student2.id, doctorId: doctor1.id, timeSlot: '14:00', date: { gte: dateOnly(cancelDate), lt: new Date(dateOnly(cancelDate).getTime() + 86400000) } },
  });
  if (!existingCancelAppt) {
    await prisma.appointment.create({
      data: {
        studentId: student2.id,
        doctorId: doctor1.id,
        date: cancelDate,
        timeSlot: '14:00',
        status: 'CANCELLED',
        tokenNo: 4,
      },
    });
  }
  console.log('✅ Cancelled appointment (Sneha — 7 days ago) seeded.');

  // ─────────────────────────────────────────────────────────────
  // 15. PENDING DISPENSE — Rahul's latest visit has a prescription NOT YET dispensed
  //     (Doctor completed consultation today, pharmacist hasn't dispensed yet)
  // ─────────────────────────────────────────────────────────────
  // We'll create a "completed earlier today" appointment for Sneha at a past slot
  const pendingVisitDate = daysAgo(0, 9, 0); // today 9 AM
  const pendingApptTimeSlot = '09:00';
  const existingPendingAppt = await prisma.appointment.findFirst({
    where: { studentId: student2.id, doctorId: doctor1.id, timeSlot: pendingApptTimeSlot, date: { gte: dateOnly(pendingVisitDate), lt: new Date(dateOnly(pendingVisitDate).getTime() + 86400000) } },
  });
  if (!existingPendingAppt) {
    const pendingAppt = await prisma.appointment.create({
      data: {
        studentId: student2.id,
        doctorId: doctor1.id,
        date: pendingVisitDate,
        timeSlot: pendingApptTimeSlot,
        status: 'COMPLETED',
        tokenNo: 2,
      },
    });
    const pendingVisit = await prisma.visit.create({
      data: {
        appointmentId: pendingAppt.id,
        studentId: student2.id,
        doctorId: doctor1.id,
        symptoms: 'Mild fever (100°F), sore throat, difficulty swallowing. Recurring symptoms after last cold.',
        diagnosis: 'Recurrent Pharyngitis',
        notes: 'Course of antibiotics prescribed. Patient allergic to dust — keep environment clean. Follow-up after 5 days.',
      },
    });
    await prisma.prescription.create({
      data: {
        appointmentId: pendingAppt.id,
        visitId: pendingVisit.id,
        status: 'PENDING_DISPENSE',
        items: {
          create: [
            { medicineId: medMap['Amoxicillin 500mg'],  quantity: 10, dosageInstructions: '1 capsule every 8 hours for 5 days. Complete full course. Take after food.' },
            { medicineId: medMap['Paracetamol 500mg'], quantity: 9,  dosageInstructions: '1 tablet every 8 hours as needed for fever. Max 3 per day.' },
            { medicineId: medMap['ORS Electrolyte Sachet'], quantity: 4, dosageInstructions: '1 sachet in 200ml water, twice daily to stay hydrated.' },
          ],
        },
      },
    });
    await prisma.notification.create({
      data: {
        userId: studentUser2.id,
        title: 'Prescription Ready for Collection',
        message: 'Dr. K. Smith has issued your prescription. Please visit the pharmacy to collect your medicines.',
        type: 'INFO',
      },
    });
    console.log('✅ Pending dispense prescription (Sneha — today) seeded — visible in pharmacist queue!');
  }

  // ─────────────────────────────────────────────────────────────
  // 16. Stock-IN top-up event (pharmacist restocked Cetirizine)
  // ─────────────────────────────────────────────────────────────
  const cetirizineMed = await prisma.medicine.findUnique({ where: { name: 'Cetirizine 10mg' } });
  const alreadyRestocked = await prisma.stockTransaction.findFirst({
    where: { medicineId: cetirizineMed?.id, type: 'IN', referenceNotes: { contains: 'Emergency Restock' } },
  });
  if (cetirizineMed && !alreadyRestocked) {
    await prisma.stockTransaction.create({
      data: {
        medicineId: cetirizineMed.id,
        type: 'IN',
        quantity: 50,
        performedByUserId: pharmacist.id,
        referenceNotes: 'Emergency Restock — Cetirizine running low. Supplier: MedPlus Campus Vendor.',
      },
    });
    await prisma.medicine.update({
      where: { id: cetirizineMed.id },
      data: { quantity: { increment: 50 } },
    });
    console.log('✅ Cetirizine emergency restock (Stock-IN +50) seeded.');
  }

  // ─────────────────────────────────────────────────────────────
  // 17. TOMORROW's APPOINTMENTS
  // ─────────────────────────────────────────────────────────────

  const tomorrowBase = new Date();
  tomorrowBase.setDate(tomorrowBase.getDate() + 1);
  tomorrowBase.setHours(0, 0, 0, 0);

  const tmrDate = (hour: number, min: number) => {
    const d = new Date(tomorrowBase);
    d.setHours(hour, min, 0, 0);
    return d;
  };

  // Tomorrow Appt A — Rahul, Dr. Smith, 09:00, Token 1 — CONFIRMED
  const tmrA = await prisma.appointment.findFirst({
    where: { studentId: student1.id, doctorId: doctor1.id, timeSlot: '09:00',
      date: { gte: tomorrowBase, lt: new Date(tomorrowBase.getTime() + 86400000) } },
  });
  if (!tmrA) {
    await prisma.appointment.create({
      data: {
        studentId: student1.id,
        doctorId: doctor1.id,
        date: tmrDate(9, 0),
        timeSlot: '09:00',
        status: 'CONFIRMED',
        tokenNo: 1,
      },
    });
    await prisma.notification.create({
      data: {
        userId: studentUser1.id,
        title: 'Appointment Confirmed for Tomorrow',
        message: `Your appointment with Dr. K. Smith is confirmed for tomorrow at 09:00 AM. Token No: 1. Please arrive on time.`,
        type: 'INFO',
      },
    });
    console.log('✅ Tomorrow Appt A — Rahul, Dr. Smith, 09:00, Token 1 (CONFIRMED) seeded.');
  }

  // Tomorrow Appt B — Sneha, Dr. Smith, 09:15, Token 2 — CONFIRMED
  const tmrB = await prisma.appointment.findFirst({
    where: { studentId: student2.id, doctorId: doctor1.id, timeSlot: '09:15',
      date: { gte: tomorrowBase, lt: new Date(tomorrowBase.getTime() + 86400000) } },
  });
  if (!tmrB) {
    await prisma.appointment.create({
      data: {
        studentId: student2.id,
        doctorId: doctor1.id,
        date: tmrDate(9, 15),
        timeSlot: '09:15',
        status: 'CONFIRMED',
        tokenNo: 2,
      },
    });
    await prisma.notification.create({
      data: {
        userId: studentUser2.id,
        title: 'Appointment Confirmed for Tomorrow',
        message: `Your appointment with Dr. K. Smith is confirmed for tomorrow at 09:15 AM. Token No: 2. Please arrive 5 minutes early.`,
        type: 'INFO',
      },
    });
    console.log('✅ Tomorrow Appt B — Sneha, Dr. Smith, 09:15, Token 2 (CONFIRMED) seeded.');
  }

  // Tomorrow Appt C — Rahul, Dr. Priya, 10:00, Token 1 — PENDING (just booked)
  const tmrC = await prisma.appointment.findFirst({
    where: { studentId: student1.id, doctorId: doctor2.id, timeSlot: '10:00',
      date: { gte: tomorrowBase, lt: new Date(tomorrowBase.getTime() + 86400000) } },
  });
  if (!tmrC) {
    await prisma.appointment.create({
      data: {
        studentId: student1.id,
        doctorId: doctor2.id,
        date: tmrDate(10, 0),
        timeSlot: '10:00',
        status: 'PENDING',
        tokenNo: 1,
      },
    });
    await prisma.notification.create({
      data: {
        userId: studentUser1.id,
        title: 'New Appointment Booked',
        message: `Your appointment with Dr. R. Priya is booked for tomorrow at 10:00 AM. Token No: 1. Skin allergy follow-up.`,
        type: 'INFO',
      },
    });
    console.log('✅ Tomorrow Appt C — Rahul, Dr. Priya, 10:00, Token 1 (PENDING) seeded.');
  }

  // Tomorrow Appt D — Sneha, Dr. Priya, 10:20, Token 2 — PENDING
  const tmrD = await prisma.appointment.findFirst({
    where: { studentId: student2.id, doctorId: doctor2.id, timeSlot: '10:20',
      date: { gte: tomorrowBase, lt: new Date(tomorrowBase.getTime() + 86400000) } },
  });
  if (!tmrD) {
    await prisma.appointment.create({
      data: {
        studentId: student2.id,
        doctorId: doctor2.id,
        date: tmrDate(10, 20),
        timeSlot: '10:20',
        status: 'PENDING',
        tokenNo: 2,
      },
    });
    await prisma.notification.create({
      data: {
        userId: studentUser2.id,
        title: 'New Appointment Booked',
        message: `Your appointment with Dr. R. Priya is booked for tomorrow at 10:20 AM. Token No: 2. Dermatology follow-up.`,
        type: 'INFO',
      },
    });
    console.log('✅ Tomorrow Appt D — Sneha, Dr. Priya, 10:20, Token 2 (PENDING) seeded.');
  }

  // Tomorrow Appt E — Rahul, Dr. Smith, 11:30, Token 3 — PENDING (afternoon check)
  const tmrE = await prisma.appointment.findFirst({
    where: { studentId: student1.id, doctorId: doctor1.id, timeSlot: '11:30',
      date: { gte: tomorrowBase, lt: new Date(tomorrowBase.getTime() + 86400000) } },
  });
  if (!tmrE) {
    await prisma.appointment.create({
      data: {
        studentId: student1.id,
        doctorId: doctor1.id,
        date: tmrDate(11, 30),
        timeSlot: '11:30',
        status: 'PENDING',
        tokenNo: 3,
      },
    });
    await prisma.notification.create({
      data: {
        userId: studentUser1.id,
        title: 'Appointment Booked',
        message: `Your appointment with Dr. K. Smith is booked for tomorrow at 11:30 AM. Token No: 3. General checkup.`,
        type: 'INFO',
      },
    });
    console.log('✅ Tomorrow Appt E — Rahul, Dr. Smith, 11:30, Token 3 (PENDING) seeded.');
  }

  console.log('\n🎉 All sample data seeded successfully!');
  console.log('📋 Summary:');
  console.log('   • 4 past completed visits with diagnoses & dispensed prescriptions');
  console.log('   • 1 prescription pending dispense (pharmacist queue has live data)');
  console.log('   • 2 appointments today (doctor queue visible)');
  console.log('   • 5 appointments tomorrow across both doctors');
  console.log('   • 1 future confirmed appointment (2 days ahead)');
  console.log('   • 1 cancelled appointment (visible in student history)');
  console.log('   • 8 medicines with stock transactions (IN + OUT audit trail)');
  console.log('   • In-app notifications seeded for all key events');
}

main()
  .catch((e) => {
    console.error('❌ Database Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
