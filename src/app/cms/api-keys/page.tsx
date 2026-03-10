'use client';

import { useState, useEffect } from 'react';
import CmsPageHeader from '@/components/cms/CmsPageHeader';
import EmptyState from '@/components/cms/EmptyState';
import { apiFetch } from '@/lib/fetch';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPreview: string;
  createdAt: string;
  lastUsed: string | null;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchKeys = async () => {
    const res = await apiFetch('/api/cms/api-keys');
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    setKeys(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;

    const res = await apiFetch('/api/cms/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName }),
    });

    if (res.ok) {
      const data = await res.json();
      setCreatedKey(data.key);
      setNewKeyName('');
      fetchKeys();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 API 키를 삭제하시겠습니까?')) return;

    await apiFetch(`/api/cms/api-keys/${id}`, { method: 'DELETE' });
    fetchKeys();
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <div>
      <CmsPageHeader
        title="API 키"
        description="외부에서 콘텐츠 API에 접근하기 위한 키를 관리합니다."
        action={{ label: '+ 새 API 키', onClick: () => setShowCreate(true) }}
      />

      {/* 생성된 키 알림 */}
      {createdKey && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm font-medium text-green-800 mb-2">
            API 키가 생성되었습니다. 이 키는 다시 확인할 수 없으니 복사해주세요.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-white px-3 py-2 rounded-lg border border-green-200 font-mono break-all">
              {createdKey}
            </code>
            <button
              onClick={() => handleCopy(createdKey)}
              className="px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
            >
              {copied ? '복사됨!' : '복사'}
            </button>
          </div>
          <button
            onClick={() => setCreatedKey('')}
            className="mt-2 text-xs text-green-600 hover:text-green-700"
          >
            닫기
          </button>
        </div>
      )}

      {/* 키 생성 폼 */}
      {showCreate && (
        <div className="mb-6 bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">새 API 키 생성</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="예: Frontend App"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              onClick={handleCreate}
              className="px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800"
            >
              생성
            </button>
            <button
              onClick={() => {
                setShowCreate(false);
                setNewKeyName('');
              }}
              className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 키 목록 */}
      {keys.length === 0 && !showCreate ? (
        <EmptyState
          icon="🔑"
          title="아직 API 키가 없습니다"
          description="API 키를 생성하여 외부에서 콘텐츠에 접근하세요."
          action={{ label: 'API 키 만들기', href: '#' }}
        />
      ) : keys.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">이름</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">키</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">생성일</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">마지막 사용</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {keys.map((apiKey) => (
                <tr key={apiKey.id} className="border-b border-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-900 font-medium">{apiKey.name}</td>
                  <td className="px-6 py-3">
                    <code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      {apiKey.keyPreview}
                    </code>
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-400">
                    {new Date(apiKey.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-400">
                    {apiKey.lastUsed
                      ? new Date(apiKey.lastUsed).toLocaleDateString('ko-KR')
                      : '-'}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleDelete(apiKey.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* 사용법 안내 */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">API 사용법</h3>
        <div className="bg-gray-950 rounded-xl p-4">
          <pre className="text-xs text-gray-300 overflow-x-auto">
{`// 콘텐츠 조회 (published만)
fetch('/api/cms/content/{모델슬러그}', {
  headers: { 'x-api-key': 'cms_your_api_key' }
})

// 단일 콘텐츠 조회
fetch('/api/cms/content/{모델슬러그}/{콘텐츠ID}', {
  headers: { 'x-api-key': 'cms_your_api_key' }
})`}
          </pre>
        </div>
      </div>
    </div>
  );
}
