import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthForApi as requireAuth } from '@/lib/auth';
import { serializeEntry, parseFields } from '@/lib/cms/serialize';
import { validateEntryData } from '@/lib/cms/validation';
import { sanitizeEntryData } from '@/lib/sanitize';
import { verifyCsrfForApi } from '@/lib/csrf';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ modelId: string }> }
) {
  try {
    const userId = await requireAuth();
    const { modelId } = await params;

    const model = await prisma.contentModel.findFirst({ where: { id: modelId, userId } });
    if (!model) {
      return NextResponse.json({ error: '모델을 찾을 수 없습니다.' }, { status: 404 });
    }

    const entries = await prisma.contentEntry.findMany({
      where: { contentModelId: modelId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(entries.map(serializeEntry));
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: '콘텐츠 목록 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ modelId: string }> }
) {
  try {
    const csrfError = verifyCsrfForApi(request);
    if (csrfError) return csrfError;
    const userId = await requireAuth();
    const { modelId } = await params;

    const model = await prisma.contentModel.findFirst({ where: { id: modelId, userId } });
    if (!model) {
      return NextResponse.json({ error: '모델을 찾을 수 없습니다.' }, { status: 404 });
    }

    const body = await request.json();
    const { data, status = 'draft' } = body;

    if (!['draft', 'published'].includes(status)) {
      return NextResponse.json({ error: '상태는 draft 또는 published만 가능합니다.' }, { status: 400 });
    }

    const fields = parseFields(model.fields);
    const validation = validateEntryData(data, fields);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join(', ') }, { status: 400 });
    }

    const sanitizedData = sanitizeEntryData(data, fields);

    const entry = await prisma.contentEntry.create({
      data: {
        contentModelId: modelId,
        data: JSON.stringify(sanitizedData),
        status,
      },
    });

    return NextResponse.json(serializeEntry(entry), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Entry creation error:', error);
    return NextResponse.json({ error: '콘텐츠 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
