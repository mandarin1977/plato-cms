import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthForApi as requireAuth } from '@/lib/auth';
import { generateApiKeyValue } from '@/lib/cms/api-key';
import { verifyCsrfForApi } from '@/lib/csrf';

export async function GET() {
  try {
    const userId = await requireAuth();

    const keys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      keys.map((k) => ({
        id: k.id,
        name: k.name,
        keyPreview: `${k.key.slice(0, 8)}...${k.key.slice(-4)}`,
        createdAt: k.createdAt.toISOString(),
        lastUsed: k.lastUsed?.toISOString() || null,
      }))
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'API 키 목록 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const csrfError = verifyCsrfForApi(request);
    if (csrfError) return csrfError;
    const userId = await requireAuth();
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: '이름은 필수입니다.' }, { status: 400 });
    }

    const keyValue = generateApiKeyValue();

    const apiKey = await prisma.apiKey.create({
      data: { name, key: keyValue, userId },
    });

    return NextResponse.json(
      {
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key,
        createdAt: apiKey.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('API key creation error:', error);
    return NextResponse.json({ error: 'API 키 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
