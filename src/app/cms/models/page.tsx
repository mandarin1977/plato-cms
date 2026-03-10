import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { serializeModel } from '@/lib/cms/serialize';
import CmsPageHeader from '@/components/cms/CmsPageHeader';
import EmptyState from '@/components/cms/EmptyState';

export const dynamic = 'force-dynamic';

export default async function ModelsPage() {
  const userId = await requireAuth();

  const rawModels = await prisma.contentModel.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { entries: true } } },
  });
  const models = rawModels.map(serializeModel);

  return (
    <div>
      <CmsPageHeader
        title="콘텐츠 모델"
        description="콘텐츠 타입을 정의하고 관리합니다."
        action={{ label: '+ 새 모델', href: '/cms/models/new' }}
      />

      {models.length === 0 ? (
        <EmptyState
          icon="🗂"
          title="아직 모델이 없습니다"
          description="콘텐츠 모델을 만들어 데이터 구조를 정의하세요."
          action={{ label: '모델 만들기', href: '/cms/models/new' }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => (
            <div
              key={model.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900">{model.name}</h3>
              </div>
              {model.description && (
                <p className="text-sm text-gray-500 mb-3">{model.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                <span>{model.fields.length}개 필드</span>
                <span>{model._count?.entries || 0}개 콘텐츠</span>
              </div>
              <div className="mb-4">
                <code className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                  /api/cms/content/{model.slug}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/cms/models/${model.id}/entries`}
                  className="flex-1 text-center px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
                >
                  콘텐츠 보기
                </Link>
                <Link
                  href={`/cms/models/${model.id}`}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  편집
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
