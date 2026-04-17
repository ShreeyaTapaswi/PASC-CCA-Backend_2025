import { PrismaClient } from '@prisma/client';
import { postrsvp } from '../services/rsvp.service';

const prisma = new PrismaClient();

async function runLoadTest() {
  console.log('--- RSVP CONCURRENCY LOAD TEST ---');

  // 1. Create 10 dummy users
  const userIds: number[] = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: `testuser${Date.now()}_${i}@example.com`,
        password: 'password',
        name: `Test User ${i}`,
        department: 'COMPUTER',
        year: 2,
        passoutYear: 2025,
        roll: i + 1000,
      } as any
    });
    userIds.push(user.id);
  }
  
  // 2. Create Event with capacity = 2
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 5);

  const testEvent = await prisma.event.create({
    data: {
      title: `Load Test Event ${Date.now()}`,
      description: 'Testing concurrency',
      location: 'Virtual',
      status: 'UPCOMING',
      startDate: eventDate,
      endDate: eventDate,
      capacity: 2,
      credits: 0,
      numDays: 1,
    }
  });

  console.log(`Created Load Test Event: ID ${testEvent.id} with capacity 2`);

  // 3. Fire 10 parallel requests
  console.log(`Firing 10 parallel RSVP requests...`);
  const promises = userIds.map(userId => postrsvp({ eventId: testEvent.id, status: 'CONFIRMED' }, userId));

  const results = await Promise.allSettled(promises);

  // 4. Verification Check
  let confirmedCount = 0;
  let waitlistCount = 0;
  let errorCount = 0;

  for (const res of results) {
    if (res.status === 'fulfilled') {
      const resultObj = res.value;
      if (resultObj.success) {
        const dataStatus = (resultObj.data as any)?.status;
        if (dataStatus === 'CONFIRMED') confirmedCount++;
        if (dataStatus === 'WAITLISTED') waitlistCount++;
      } else {
        errorCount++;
        console.error(`Request failed cleanly:`, resultObj.message);
      }
    } else {
      errorCount++;
      console.error(`Request threw an error:`, res.reason);
    }
  }

  const finalEvent = await prisma.event.findUnique({ where: { id: testEvent.id } });

  console.log('--- TEST RESULTS ---');
  console.log(`Expected Confirmed: 2 | Actual Confirmed: ${confirmedCount}`);
  console.log(`Expected Waitlisted: 8 | Actual Waitlisted: ${waitlistCount}`);
  console.log(`Expected Final Capacity: 0 | Actual Final Capacity: ${finalEvent?.capacity}`);
  console.log(`Errors (Duplicates/Failures): ${errorCount}`);
  
  if (confirmedCount === 2 && waitlistCount === 8 && finalEvent?.capacity === 0 && errorCount === 0) {
    console.log('✅ TEST PASSED: System is strictly mathematically correct under concurrency!');
  } else {
    console.log('❌ TEST FAILED: Concurrency violation detected.');
  }

  // Cleanup
  console.log('Cleaning up test data...');
  await prisma.rsvp.deleteMany({ where: { eventId: testEvent.id } });
  await prisma.event.delete({ where: { id: testEvent.id } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });

  await prisma.$disconnect();
}

runLoadTest().catch(e => {
  console.error(e);
  process.exit(1);
});
