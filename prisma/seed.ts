import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@test.com' },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Admin',
      },
    });
    console.log('기본 관리자 계정 생성: admin@test.com / password123');
  } else {
    console.log('관리자 계정이 이미 존재합니다.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
