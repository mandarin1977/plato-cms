import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { serializeModel } from '@/lib/cms/serialize';
import CmsPageHeader from '@/components/cms/CmsPageHeader';
import EntryForm from '@/components/cms/EntryForm';

export const dynamic = 'force-dynamic';

export default async function NewEntryPage({
  params,
}: {
  params: Promise<{ modelId: string }>;
}) {
  const userId = await requireAuth();
  const { modelId } = await params;

  const raw = await prisma.contentModel.findFirst({
    where: { id: modelId, userId },
    include: { _count: { select: { entries: true } } },
  });

  if (!raw) notFound();
  const model = serializeModel(raw);

  return (
    <div>
      <CmsPageHeader
        title="새 콘텐츠"
        breadcrumbs={[
          { label: '콘텐츠 모델', href: '/cms/models' },
          { label: model.name, href: `/cms/models/${modelId}/entries` },
          { label: '새 콘텐츠' },
        ]}
      />
      <EntryForm modelId={modelId} fields={model.fields} />
    </div>
  );
}
