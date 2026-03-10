import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export function generateApiKeyValue(): string {
  return `cms_${randomBytes(32).toString('hex')}`;
}

export async function validateApiKey(
  request: NextRequest
): Promise<{ valid: false } | { valid: true; userId: string }> {
  const key = request.headers.get('x-api-key');
  if (!key) return { valid: false };

  const record = await prisma.apiKey.findUnique({ where: { key } });
  if (!record) return { valid: false };

  await prisma.apiKey.update({
    where: { id: record.id },
    data: { lastUsed: new Date() },
  });

  return { valid: true, userId: record.userId };
}
