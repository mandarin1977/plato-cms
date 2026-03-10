import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthForApi as requireAuth } from '@/lib/auth';
import { serializeModel } from '@/lib/cms/serialize';
import { sanitizeModelInput } from '@/lib/sanitize';
import { verifyCsrfForApi } from '@/lib/csrf';

export async function GET() {
  try {
    const userId = await requireAuth();

    const models = await prisma.contentModel.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { entries: true } } },
    });

    return NextResponse.json(models.map(serializeModel));
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: '모델 목록 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const csrfError = verifyCsrfForApi(request);
    if (csrfError) return csrfError;

    const userId = await requireAuth();
    const body = await request.json();
    const { name, slug, description, fields } = body;

    if (!name || !slug || !fields) {
      return NextResponse.json({ error: '이름, 슬러그, 필드는 필수입니다.' }, { status: 400 });
    }

    const existing = await prisma.contentModel.findUnique({
      where: { slug_userId: { slug, userId } },
    });
    if (existing) {
      return NextResponse.json({ error: '이미 사용 중인 슬러그입니다.' }, { status: 409 });
    }

    const model = await prisma.contentModel.create({
      data: {
        name: sanitizeModelInput(name),
        slug,
        description: description ? sanitizeModelInput(description) : null,
        fields: JSON.stringify(fields),
        userId,
      },
      include: { _count: { select: { entries: true } } },
    });

    return NextResponse.json(serializeModel(model), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Model creation error:', error);
    return NextResponse.json({ error: '모델 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
