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

  // 2. Create Demo Student (FE - 1st Year)
  const studentFE = await prisma.user.upsert({
    where: { email: 'shreeya.student.fe@demo.com' },
    update: {},
    create: {
      email: 'shreeya.student.fe@demo.com',
      name: 'Shreeya (FE Demo)',
      password: studentPassword,
      department: 'CE',
      year: 1,
      passoutYear: 2028,
      roll: 10001,
      hours: 0,
    },
  });
  console.log(`✅ FE Student account created/verified: ${studentFE.email}`);

  // 3. Create Demo Student (SE - 2nd Year)
  const studentSE = await prisma.user.upsert({
    where: { email: 'shreeya.student.se@demo.com' },
    update: {},
    create: {
      email: 'shreeya.student.se@demo.com',
      name: 'Shreeya (SE Demo)',
      password: studentPassword,
      department: 'CE',
      year: 2,
      passoutYear: 2027,
      roll: 21001,
      hours: 0,
    },
  });
  console.log(`✅ SE Student account created/verified: ${studentSE.email}`);

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
