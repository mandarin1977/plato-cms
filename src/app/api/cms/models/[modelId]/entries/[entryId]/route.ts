import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthForApi as requireAuth } from '@/lib/auth';
import { serializeEntry, parseFields } from '@/lib/cms/serialize';
import { validateEntryData } from '@/lib/cms/validation';
import { sanitizeEntryData } from '@/lib/sanitize';
import { verifyCsrfForApi } from '@/lib/csrf';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ modelId: string; entryId: string }> }
) {
  try {
    const userId = await requireAuth();
    const { modelId, entryId } = await params;

    const model = await prisma.contentModel.findFirst({ where: { id: modelId, userId } });
    if (!model) {
      return NextResponse.json({ error: '모델을 찾을 수 없습니다.' }, { status: 404 });
    }

    const entry = await prisma.contentEntry.findFirst({
      where: { id: entryId, contentModelId: modelId },
    });
    if (!entry) {
      return NextResponse.json({ error: '콘텐츠를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(serializeEntry(entry));
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: '콘텐츠 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ modelId: string; entryId: string }> }
) {
  try {
    const csrfError = verifyCsrfForApi(request);
    if (csrfError) return csrfError;
    const userId = await requireAuth();
    const { modelId, entryId } = await params;

    const model = await prisma.contentModel.findFirst({ where: { id: modelId, userId } });
    if (!model) {
      return NextResponse.json({ error: '모델을 찾을 수 없습니다.' }, { status: 404 });
    }

    const body = await request.json();
    const { data, status } = body;

    if (status && !['draft', 'published'].includes(status)) {
      return NextResponse.json({ error: '상태는 draft 또는 published만 가능합니다.' }, { status: 400 });
    }

    let sanitizedData = data;
    if (data) {
      const fields = parseFields(model.fields);
      const validation = validateEntryData(data, fields);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.errors.join(', ') }, { status: 400 });
      }
      sanitizedData = sanitizeEntryData(data, fields);
    }

    const existing = await prisma.contentEntry.findFirst({
      where: { id: entryId, contentModelId: modelId },
    });
    if (!existing) {
      return NextResponse.json({ error: '콘텐츠를 찾을 수 없습니다.' }, { status: 404 });
    }

    const entry = await prisma.contentEntry.update({
      where: { id: entryId },
      data: {
        ...(sanitizedData && { data: JSON.stringify(sanitizedData) }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(serializeEntry(entry));
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: '콘텐츠 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ modelId: string; entryId: string }> }
) {
  try {
    const csrfError = verifyCsrfForApi(request);
    if (csrfError) return csrfError;
    const userId = await requireAuth();
    const { modelId, entryId } = await params;

    const model = await prisma.contentModel.findFirst({ where: { id: modelId, userId } });
    if (!model) {
      return NextResponse.json({ error: '모델을 찾을 수 없습니다.' }, { status: 404 });
    }
    const existing = await prisma.contentEntry.findFirst({
      where: { id: entryId, contentModelId: modelId },
    });
    if (!existing) {
      return NextResponse.json({ error: '콘텐츠를 찾을 수 없습니다.' }, { status: 404 });
    }
    await prisma.contentEntry.delete({ where: { id: entryId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: '콘텐츠 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
