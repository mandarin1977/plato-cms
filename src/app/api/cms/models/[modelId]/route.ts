import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthForApi as requireAuth } from '@/lib/auth';
import { serializeModel } from '@/lib/cms/serialize';
import { sanitizeModelInput } from '@/lib/sanitize';
import { verifyCsrfForApi } from '@/lib/csrf';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ modelId: string }> }
) {
  try {
    const userId = await requireAuth();
    const { modelId } = await params;

    const model = await prisma.contentModel.findFirst({
      where: { id: modelId, userId },
      include: { _count: { select: { entries: true } } },
    });

    if (!model) {
      return NextResponse.json({ error: '모델을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(serializeModel(model));
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: '모델 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ modelId: string }> }
) {
  try {
    const csrfError = verifyCsrfForApi(request);
    if (csrfError) return csrfError;
    const userId = await requireAuth();
    const { modelId } = await params;

    const existing = await prisma.contentModel.findFirst({ where: { id: modelId, userId } });
    if (!existing) {
      return NextResponse.json({ error: '모델을 찾을 수 없습니다.' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, fields } = body;

    const model = await prisma.contentModel.update({
      where: { id: modelId },
      data: {
        ...(name && { name: sanitizeModelInput(name) }),
        ...(description !== undefined && { description: description ? sanitizeModelInput(description) : null }),
        ...(fields && { fields: JSON.stringify(fields) }),
      },
      include: { _count: { select: { entries: true } } },
    });

    return NextResponse.json(serializeModel(model));
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Model update error:', error);
    return NextResponse.json({ error: '모델 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ modelId: string }> }
) {
  try {
    const csrfError = verifyCsrfForApi(request);
    if (csrfError) return csrfError;
    const userId = await requireAuth();
    const { modelId } = await params;

    const existing = await prisma.contentModel.findFirst({ where: { id: modelId, userId } });
    if (!existing) {
      return NextResponse.json({ error: '모델을 찾을 수 없습니다.' }, { status: 404 });
    }

    await prisma.contentModel.delete({ where: { id: modelId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: '모델 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
