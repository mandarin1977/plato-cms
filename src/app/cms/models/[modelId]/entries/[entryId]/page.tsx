import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { serializeModel, serializeEntry } from '@/lib/cms/serialize';
import CmsPageHeader from '@/components/cms/CmsPageHeader';
import EntryForm from '@/components/cms/EntryForm';

export const dynamic = 'force-dynamic';

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ modelId: string; entryId: string }>;
}) {
  const userId = await requireAuth();
  const { modelId, entryId } = await params;

  const [rawModel, rawEntry] = await Promise.all([
    prisma.contentModel.findFirst({
      where: { id: modelId, userId },
      include: { _count: { select: { entries: true } } },
    }),
    prisma.contentEntry.findFirst({ where: { id: entryId, contentModelId: modelId } }),
  ]);

  if (!rawModel || !rawEntry) notFound();

  const model = serializeModel(rawModel);
  const entry = serializeEntry(rawEntry);

  return (
    <div>
      <CmsPageHeader
        title="콘텐츠 편집"
        breadcrumbs={[
          { label: '콘텐츠 모델', href: '/cms/models' },
          { label: model.name, href: `/cms/models/${modelId}/entries` },
          { label: '편집' },
        ]}
      />
      <EntryForm modelId={modelId} fields={model.fields} initialData={entry} />
    </div>
  );
}
