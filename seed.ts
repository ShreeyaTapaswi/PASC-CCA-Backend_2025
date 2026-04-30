import { PrismaClient, Department } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting bulk database seeding...');

  // Hash passwords once for all students to save time
  const adminPassword = await bcryptjs.hash('PascAdmin@2025', 10);
  const studentPassword = await bcryptjs.hash('PascStudent@2025', 10);

  // 1. Create Demo Admin
  await prisma.admin.upsert({
    where: { email: 'shreeya.web24@gmail.com' },
    update: {},
    create: {
      email: 'shreeya.web24@gmail.com',
      name: 'Shreeya (Admin)',
      password: adminPassword,
    },
  });
  console.log('✅ Admin account seeded.');

  // 2. Generate FY (1st Year) Students
  console.log('⏳ Seeding FY (1st Year) students...');
  const fyStudents = [];
  for (let div = 1; div <= 13; div++) {
    for (let offset = 1; offset <= 30; offset++) {
      const roll = 10000 + (div * 100) + offset;
      fyStudents.push({
        email: `pasc.fy.d${div}.r${roll}@demo.com`,
        name: `FY Student D${div} R${roll}`,
        password: studentPassword,
        department: Department.CE,
        year: 1,
        passoutYear: 2028,
        roll: roll,
        hours: 0,
      });
    }
  }
  
  await prisma.user.createMany({
    data: fyStudents,
    skipDuplicates: true,
  });
  console.log(`✅ ${fyStudents.length} FY students seeded across 13 divisions.`);

  // 3. Generate SY (2nd Year) Students
  console.log('⏳ Seeding SY (2nd Year) students...');
  const syStudents = [];
  for (let div = 1; div <= 13; div++) {
    const studentsInDiv = div <= 3 ? 30 : 50;
    for (let offset = 1; offset <= studentsInDiv; offset++) {
      const roll = 21000 + (div * 100) + offset;
      syStudents.push({
        email: `pasc.sy.d${div}.r${roll}@demo.com`,
        name: `SY Student D${div} R${roll}`,
        password: studentPassword,
        department: Department.CE,
        year: 2,
        passoutYear: 2027,
        roll: roll,
        hours: 0,
      });
    }
  }

  await prisma.user.createMany({
    data: syStudents,
    skipDuplicates: true,
  });
  console.log(`✅ ${syStudents.length} SY students seeded across 13 divisions.`);

  console.log('✨ Seed completed successfully! Total students seeded: ' + (fyStudents.length + syStudents.length));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
