import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthForApi as requireAuth } from '@/lib/auth';
import { verifyCsrfForApi } from '@/lib/csrf';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
  try {
    const csrfError = verifyCsrfForApi(request);
    if (csrfError) return csrfError;
    const userId = await requireAuth();
    const { keyId } = await params;

    const existing = await prisma.apiKey.findFirst({ where: { id: keyId, userId } });
    if (!existing) {
      return NextResponse.json({ error: 'API 키를 찾을 수 없습니다.' }, { status: 404 });
    }

    await prisma.apiKey.delete({ where: { id: keyId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'API 키 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
