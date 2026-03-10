import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeEntry } from '@/lib/cms/serialize';
import { validateApiKey } from '@/lib/cms/api-key';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'x-api-key, Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; entryId: string }> }
) {
  const authResult = await validateApiKey(request);
  if (!authResult.valid) {
    return NextResponse.json({ error: '유효한 API 키가 필요합니다.' }, { status: 401, headers: corsHeaders });
  }

  const { slug, entryId } = await params;

  const model = await prisma.contentModel.findFirst({
    where: { slug, userId: authResult.userId },
  });
  if (!model) {
    return NextResponse.json({ error: '콘텐츠 모델을 찾을 수 없습니다.' }, { status: 404, headers: corsHeaders });
  }

  const entry = await prisma.contentEntry.findFirst({
    where: { id: entryId, contentModelId: model.id },
  });
  if (!entry) {
    return NextResponse.json({ error: '콘텐츠를 찾을 수 없습니다.' }, { status: 404, headers: corsHeaders });
  }

  return NextResponse.json(serializeEntry(entry), { headers: corsHeaders });
}
