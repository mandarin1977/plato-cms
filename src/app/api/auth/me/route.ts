import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  // 유저가 DB에 없으면 (DB 리셋 등) 세션 쿠키 삭제
  if (!user) {
    const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    return response;
  }

  return NextResponse.json(user);
}
