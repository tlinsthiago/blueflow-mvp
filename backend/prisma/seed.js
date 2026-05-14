import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const users = [
  {
    name: 'Administrador BlueFlow',
    email: process.env.SEED_ADMIN_EMAIL ?? 'admin@blueflow.local',
    password: process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!',
    role: 'admin',
  },
  {
    name: 'Gestor BlueFlow',
    email: process.env.SEED_MANAGER_EMAIL ?? 'gestor@blueflow.local',
    password: process.env.SEED_MANAGER_PASSWORD ?? 'Gestor123!',
    role: 'manager',
  },
  {
    name: 'Colaborador BlueFlow',
    email: process.env.SEED_COLLABORATOR_EMAIL ?? 'colaborador@blueflow.local',
    password: process.env.SEED_COLLABORATOR_PASSWORD ?? 'Colaborador123!',
    role: 'collaborator',
  },
];

async function main() {
  for (const user of users) {
    const passwordHash = await argon2.hash(user.password);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash,
        role: user.role,
        isActive: true,
      },
      create: {
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
