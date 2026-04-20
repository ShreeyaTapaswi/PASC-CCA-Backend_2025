import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Running database seed...');

  // Hash passwords
  const adminPassword = await bcryptjs.hash('PascAdmin@2025', 10);
  const studentPassword = await bcryptjs.hash('PascStudent@2025', 10);

  // 1. Create Demo Admin
  const admin = await prisma.admin.upsert({
    where: { email: 'shreeya.web24@gmail.com' },
    update: {},
    create: {
      email: 'shreeya.web24@gmail.com',
      name: 'Shreeya (Admin)',
      password: adminPassword,
    },
  });
  console.log(`✅ Admin account created/verified: ${admin.email}`);

  // 2. Create Demo Student
  const student = await prisma.user.upsert({
    where: { email: 'shreeya.student@demo.com' },
    update: {},
    create: {
      email: 'shreeya.student@demo.com',
      name: 'Shreeya (Student Demo)',
      password: studentPassword,
      department: 'CE',
      year: 3,
      passoutYear: 2026,
      roll: 101, // Mock roll number
      hours: 0,
    },
  });
  console.log(`✅ Student account created/verified: ${student.email}`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
