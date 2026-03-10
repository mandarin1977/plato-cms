import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';

export const SESSION_COOKIE_NAME = 'plato_session';

const getSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET 환경변수가 설정되지 않았습니다.');
  }
  return new TextEncoder().encode(secret);
};

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}

// 서버 컴포넌트 / API 라우트에서 세션 확인
export async function getSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// 미들웨어에서 세션 확인 (Request 기반)
export async function getSessionFromRequest(request: NextRequest): Promise<{ userId: string } | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// 서버 컴포넌트에서 인증 필수 체크 (유저 없으면 세션 쿠키 삭제 후 로그인으로 이동)
export async function requireAuth(): Promise<string> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  // DB에 유저가 실제 존재하는지 확인
  const { prisma } = await import('@/lib/prisma');
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true },
  });

  if (!user) {
    // 세션 쿠키 삭제 후 로그인으로 리다이렉트
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, '', { maxAge: 0, path: '/' });
    redirect('/login');
  }

  return session.userId;
}

// API 라우트 전용 인증 체크 (redirect 대신 throw)
export async function requireAuthForApi(): Promise<string> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session.userId;
}
