import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { serializeModel, serializeEntry } from '@/lib/cms/serialize';
import CmsPageHeader from '@/components/cms/CmsPageHeader';
import EmptyState from '@/components/cms/EmptyState';

export const dynamic = 'force-dynamic';

export default async function EntriesPage({
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

  const rawEntries = await prisma.contentEntry.findMany({
    where: { contentModelId: modelId },
    orderBy: { createdAt: 'desc' },
  });
  const entries = rawEntries.map(serializeEntry);

  const displayFields = model.fields.slice(0, 3);

  return (
    <div>
      <CmsPageHeader
        title={model.name}
        description={model.description || `${model.fields.length}개 필드 · ${entries.length}개 콘텐츠`}
        breadcrumbs={[
          { label: '콘텐츠 모델', href: '/cms/models' },
          { label: model.name },
        ]}
        action={{
          label: '+ 새 콘텐츠',
          href: `/cms/models/${modelId}/entries/new`,
        }}
      />

      {entries.length === 0 ? (
        <EmptyState
          icon="📝"
          title="아직 콘텐츠가 없습니다"
          description="새 콘텐츠를 추가하세요."
          action={{
            label: '콘텐츠 추가',
            href: `/cms/models/${modelId}/entries/new`,
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {displayFields.map((field) => (
                  <th key={field.name} className="text-left text-xs font-medium text-gray-500 px-6 py-3">
                    {field.label}
                  </th>
                ))}
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">상태</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">생성일</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  {displayFields.map((field) => (
                    <td key={field.name} className="px-6 py-3 text-sm text-gray-700">
                      {String(entry.data[field.name] ?? '-').slice(0, 50)}
                    </td>
                  ))}
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        entry.status === 'published'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {entry.status === 'published' ? '게시' : '초안'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-400">
                    {new Date(entry.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/cms/models/${modelId}/entries/${entry.id}`}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      편집
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
