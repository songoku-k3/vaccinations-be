// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   const roles = ['USER', 'DOCTOR', 'ADMIN', 'EMPLOYEE'];

//   for (const name of roles) {
//     await prisma.role.upsert({
//       where: { name },
//       update: {},
//       create: { name },
//     });
//   }

//   console.log('✅ Seeded roles successfully.');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tags = ['Sức khỏe', 'Y tế', 'Tâm lý học', 'Dinh dưỡng', 'Kiến thức'];

  for (const name of tags) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seeded tags successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
