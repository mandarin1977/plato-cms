import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeEntry, parseFields } from '@/lib/cms/serialize';
import { validateApiKey } from '@/lib/cms/api-key';
import { parseFilterParams, applyFilters } from '@/lib/cms/query-filter';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await validateApiKey(request);
  if (!authResult.valid) {
    return NextResponse.json(
      { error: '유효한 API 키가 필요합니다. x-api-key 헤더를 확인하세요.' },
      { status: 401 }
    );
  }

  const { slug } = await params;
  const model = await prisma.contentModel.findFirst({
    where: { slug, userId: authResult.userId },
  });
  if (!model) {
    return NextResponse.json({ error: '콘텐츠 모델을 찾을 수 없습니다.' }, { status: 404 });
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status') || 'published';

  const rawEntries = await prisma.contentEntry.findMany({
    where: {
      contentModelId: model.id,
      ...(status !== 'all' && { status }),
    },
    orderBy: { createdAt: 'desc' },
  });

  const entries = rawEntries.map(serializeEntry);
  const fields = parseFields(model.fields);
  const filterParams = parseFilterParams(searchParams);
  const result = applyFilters(entries, filterParams, fields);

  return NextResponse.json({
    model: slug,
    entries: result.entries,
    total: result.total,
    filtered: result.filtered,
    limit: filterParams.limit,
    offset: filterParams.offset,
  });
}
