import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@theater.com' },
    update: {},
    create: {
      email: 'admin@theater.com',
      password: hashedPassword,
      name: 'Admin User',
      isAdmin: true,
    },
  });

  console.log('Created admin user:', admin);

  // Create a sample show
  const show = await prisma.show.create({
    data: {
      title: 'The Wizard of Oz',
      description: 'Follow Dorothy down the yellow brick road in this classic tale.',
      date: new Date('2024-06-15T19:00:00'),
      basePrice: 2500, // $25.00 in cents
    },
  });

  console.log('Created show:', show);

  // Generate seats for the show (350 seats: 20 rows x 17 seats)
  const seats = [];
  const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  for (let i = 0; i < 20; i++) {
    for (let j = 1; j <= 17; j++) {
      seats.push({
        row: rowLetters[i],
        number: j,
        status: 'AVAILABLE',
        showId: show.id,
      });
    }
  }

  await prisma.seat.createMany({
    data: seats
  });

  console.log(`Created ${seats.length} seats`);

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
