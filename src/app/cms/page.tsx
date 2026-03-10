import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { serializeModel, serializeEntry } from '@/lib/cms/serialize';

export const dynamic = 'force-dynamic';

export default async function CmsDashboard() {
  const userId = await requireAuth();

  const [modelCount, entryCount, apiKeyCount, recentModels, recentEntries, publishedCount] =
    await Promise.all([
      prisma.contentModel.count({ where: { userId } }),
      prisma.contentEntry.count({
        where: { contentModel: { userId } },
      }),
      prisma.apiKey.count({ where: { userId } }),
      prisma.contentModel.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: { _count: { select: { entries: true } } },
      }),
      prisma.contentEntry.findMany({
        where: { contentModel: { userId } },
        orderBy: { updatedAt: 'desc' },
        take: 8,
        include: { contentModel: { select: { name: true, id: true } } },
      }),
      prisma.contentEntry.count({
        where: { contentModel: { userId }, status: 'published' },
      }),
    ]);

  const draftCount = entryCount - publishedCount;

  const stats = [
    {
      label: '콘텐츠 모델',
      value: modelCount,
      href: '/cms/models',
      color: 'bg-blue-50 text-blue-600',
      iconPath:
        'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    },
    {
      label: '전체 콘텐츠',
      value: entryCount,
      href: '/cms/models',
      color: 'bg-green-50 text-green-600',
      iconPath:
        'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      label: '게시됨',
      value: publishedCount,
      href: '/cms/models',
      color: 'bg-emerald-50 text-emerald-600',
      iconPath:
        'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'API 키',
      value: apiKeyCount,
      href: '/cms/api-keys',
      color: 'bg-amber-50 text-amber-600',
      iconPath:
        'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">Plato CMS 관리 화면</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all group"
          >
            <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <svg
                className="w-4.5 h-4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={stat.iconPath} />
              </svg>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Entries */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">최근 콘텐츠</h2>
            <Link href="/cms/models" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              전체 보기
            </Link>
          </div>
          {recentEntries.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-400 mb-3">아직 콘텐츠가 없습니다</p>
              <Link
                href="/cms/models/new"
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                모델을 먼저 만들어보세요
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentEntries.map((raw) => {
                const entry = serializeEntry(raw);
                const model = raw.contentModel;
                const firstValue = Object.values(entry.data)[0];
                const title =
                  typeof firstValue === 'string'
                    ? firstValue.slice(0, 60)
                    : `콘텐츠 #${entry.id.slice(-6)}`;

                return (
                  <Link
                    key={entry.id}
                    href={`/cms/models/${model.id}/entries/${entry.id}`}
                    className="flex items-center justify-between px-6 py-3 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900 truncate">{title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{model.name}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4 shrink-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          entry.status === 'published'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {entry.status === 'published' ? '게시' : '초안'}
                      </span>
                      <span className="text-xs text-gray-300">
                        {new Date(entry.updatedAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Models */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-900">콘텐츠 모델</h2>
              <Link href="/cms/models" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                전체
              </Link>
            </div>
            {recentModels.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-gray-400">모델이 없습니다</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentModels.map((raw) => {
                  const model = serializeModel(raw);
                  return (
                    <Link
                      key={model.id}
                      href={`/cms/models/${model.id}/entries`}
                      className="flex items-center justify-between px-6 py-3 hover:bg-gray-50/50 transition-colors"
                    >
                      <div>
                        <p className="text-sm text-gray-900">{model.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {model.fields.length}개 필드
                        </p>
                      </div>
                      <span className="text-xs text-gray-300">
                        {model._count?.entries || 0}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">빠른 시작</h2>
            <div className="space-y-2">
              <Link
                href="/cms/models/new"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">+</span>
                새 콘텐츠 모델
              </Link>
              <Link
                href="/cms/api-keys"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </span>
                API 키 관리
              </Link>
            </div>
          </div>

          {/* Status Overview */}
          {entryCount > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">콘텐츠 현황</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-500">게시됨</span>
                    <span className="text-gray-900 font-medium">{publishedCount}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${entryCount > 0 ? (publishedCount / entryCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-500">초안</span>
                    <span className="text-gray-900 font-medium">{draftCount}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-400 rounded-full transition-all"
                      style={{ width: `${entryCount > 0 ? (draftCount / entryCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
