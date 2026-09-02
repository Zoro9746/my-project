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
    update: {},
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
    update: {},
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
    update: {},
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

  // Create Schedules for Doctors (Mon to Sat, 09:00 to 17:00, 15m slots)
  if (doctorUser1.doctor) {
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
    update: {},
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
    update: {},
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
    update: {},
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
          allergies: 'None',
          emergencyContact: '+91 98765 12345 (Mother)',
        },
      },
    },
    include: { student: true },
  });
  console.log('✅ Students created:', studentUser1.email, studentUser2.email);

  // 5. Create Essential Medicines
  const today = new Date();
  const futureExpiry = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate());
  const nearExpiry = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days left

  const medicines = [
    {
      name: 'Paracetamol 500mg',
      category: 'Analgesics / Antipyretics',
      unit: 'Tablets',
      quantity: 250,
      expiryDate: futureExpiry,
      reorderLevel: 50,
    },
    {
      name: 'Amoxicillin 500mg',
      category: 'Antibiotics',
      unit: 'Capsules',
      quantity: 120,
      expiryDate: futureExpiry,
      reorderLevel: 30,
    },
    {
      name: 'Cetirizine 10mg',
      category: 'Antihistamines',
      unit: 'Tablets',
      quantity: 8, // Low stock test
      expiryDate: futureExpiry,
      reorderLevel: 25,
    },
    {
      name: 'Ibuprofen 400mg',
      category: 'NSAIDs',
      unit: 'Tablets',
      quantity: 180,
      expiryDate: futureExpiry,
      reorderLevel: 40,
    },
    {
      name: 'Azithromycin 500mg',
      category: 'Antibiotics',
      unit: 'Tablets',
      quantity: 45,
      expiryDate: nearExpiry, // Near expiry test
      reorderLevel: 20,
    },
    {
      name: 'Cough Syrup 100ml',
      category: 'Expectorants',
      unit: 'Bottles',
      quantity: 35,
      expiryDate: futureExpiry,
      reorderLevel: 15,
    },
  ];

  for (const med of medicines) {
    const createdMed = await prisma.medicine.upsert({
      where: { name: med.name },
      update: {},
      create: med,
    });

    // Record initial stock transaction
    await prisma.stockTransaction.create({
      data: {
        medicineId: createdMed.id,
        type: 'IN',
        quantity: med.quantity,
        performedByUserId: pharmacist.id,
        referenceNotes: 'Initial Stock Provisioning',
      },
    });
  }

  console.log('✅ Essential Medicines & Stock Transactions Seeded!');
  console.log('🎉 Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
