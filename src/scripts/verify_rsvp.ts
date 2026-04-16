import { RsvpStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { postrsvp, adminApproveRsvp, adminRejectRsvp } from '../services/rsvp.service';

async function runFlowTest() {
  console.log('--- RSVP END-TO-END FLOW TEST ---');

  // 1. Create a dummy test event with capacity = 1
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 10);

  const testEvent = await prisma.event.create({
    data: {
      title: `Flow Test Event ${Date.now()}`,
      description: 'Testing RSVP approval flow',
      location: 'Virtual',
      status: 'UPCOMING',
      startDate: eventDate,
      endDate: eventDate,
      capacity: 1, // Only 1 seat available
      credits: 0,
      numDays: 1,
    }
  });

  console.log(`[Setup] Created Event ID ${testEvent.id} with capacity 1`);

  // 2. Create dummy users
  const user1 = await prisma.user.create({
    data: {
      email: `testuser_1_${Date.now()}@example.com`,
      password: 'password',
      name: `Test User 1`,
      department: 'CE',
      year: 2,
      passoutYear: 2025,
      roll: 9001,
    } as any
  });

  const user2 = await prisma.user.create({
    data: {
      email: `testuser_2_${Date.now()}@example.com`,
      password: 'password',
      name: `Test User 2`,
      department: 'CE',
      year: 2,
      passoutYear: 2025,
      roll: 9002,
    } as any
  });

  console.log(`[Setup] Created User1 (${user1.id}) and User2 (${user2.id})`);

  try {
    // 3. User 1 RSVPs -> Should be CONFIRMED
    console.log('\n[Action] User 1 is RSVPing...');
    const res1 = await postrsvp({ eventId: testEvent.id, status: 'CONFIRMED' }, user1.id);
    console.log(`=> Result: ${res1.success ? 'Success' : 'Fail'} | Status: ${(res1.data as any)?.status}`);
    
    if ((res1.data as any)?.status !== 'CONFIRMED') throw new Error('User 1 should be confirmed');

    // 4. User 2 RSVPs -> Should be WAITLISTED
    console.log('\n[Action] User 2 is RSVPing (after capacity hit 0)...');
    const res2 = await postrsvp({ eventId: testEvent.id, status: 'CONFIRMED' }, user2.id);
    console.log(`=> Result: ${res2.success ? 'Success' : 'Fail'} | Status: ${(res2.data as any)?.status}`);
    
    if ((res2.data as any)?.status !== 'WAITLISTED') throw new Error('User 2 should be waitlisted!');

    // 5. Admin ADMIN REJECTS USer 1 -> User 1 Status = REJECTED, User 2 Status = PROMOTED / CONFIRMED
    console.log(`\n[Action] Admin rejects User 1...`);
    const rsvp1Id = (res1.data as any)?.rsvp?.id || (res1.data as any)?.id || (await prisma.rsvp.findFirst({where: {userId: user1.id, eventId: testEvent.id}}))?.id;
    if (!rsvp1Id) throw new Error("RSVP 1 ID not found");
    
    const rejectRes = await adminRejectRsvp(rsvp1Id);
    console.log(`=> Admin Reject User 1 Result: ${rejectRes.message}`);

    // Wait 2 secs for async notifications
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify User 2 was promoted!
    const user2Rsvp = await prisma.rsvp.findFirst({ where: { userId: user2.id, eventId: testEvent.id } });
    console.log(`=> User 2 Status is now: ${user2Rsvp?.status}`);
    
    if (user2Rsvp?.status !== RsvpStatus.CONFIRMED) {
       console.error("Auto-promotion failed!");
    } else {
       console.log("✅ Auto-promotion successful!");
    }

    // Verify Notifications
    const rejNotifications = await prisma.notification.findMany({ where: { userId: user1.id, type: 'RSVP_REJECTED' } });
    const promoteNotifications = await prisma.notification.findMany({ where: { userId: user2.id, type: 'WAITLIST_PROMOTED' } });
    
    console.log(`=> Notification Check: Got ${rejNotifications.length} Rejection notices for User 1`);
    console.log(`=> Notification Check: Got ${promoteNotifications.length} Promoted notices for User 2`);

    if (rejNotifications.length > 0 && promoteNotifications.length > 0) {
       console.log("✅ Notifications mechanism is fully working!");
    } else {
       console.log("❌ Notifications missing!");
    }

  } catch (error) {
    console.error("TEST FAILED:", error);
  } finally {
    // Cleanup
    console.log('\n[Cleanup] Cleaning up test data...');
    await prisma.notification.deleteMany({ where: { userId: { in: [user1.id, user2.id] } } });
    await prisma.rsvp.deleteMany({ where: { eventId: testEvent.id } });
    await prisma.event.delete({ where: { id: testEvent.id } });
    await prisma.user.deleteMany({ where: { id: { in: [user1.id, user2.id] } } });
    await prisma.$disconnect();
    console.log('--- TEST FINISHED ---');
  }
}

runFlowTest().catch(e => {
  console.error(e);
  process.exit(1);
});
