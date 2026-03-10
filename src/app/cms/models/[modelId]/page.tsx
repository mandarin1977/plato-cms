import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { serializeModel } from '@/lib/cms/serialize';
import CmsPageHeader from '@/components/cms/CmsPageHeader';
import ModelForm from '@/components/cms/ModelForm';

export const dynamic = 'force-dynamic';

export default async function EditModelPage({
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
        title={`${model.name} 수정`}
        breadcrumbs={[
          { label: '콘텐츠 모델', href: '/cms/models' },
          { label: model.name },
        ]}
      />
      <ModelForm initialData={model} />
    </div>
  );
}
