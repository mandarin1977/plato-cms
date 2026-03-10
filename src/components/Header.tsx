'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiFetch } from '@/lib/fetch';

interface User {
  id: string;
  email: string;
  name: string | null;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isCms = pathname.startsWith('/cms');

  useEffect(() => {
    if (isCms) {
      setLoading(false);
      return;
    }
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [isCms]);

  // CMS 영역에서는 헤더를 숨김 (사이드바 사용)
  if (isCms) return null;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-gray-900 tracking-tight">
          Plato<span className="text-green-600">CMS</span>
        </Link>

        {loading ? (
          <div className="h-8" />
        ) : (
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/cms"
                  className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  대시보드
                </Link>
                <span className="text-xs text-gray-400">
                  {user.name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm px-3 py-1.5 text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  로그인
                </Link>
                <Link
                  href="/register"
                  className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  무료 시작
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );

  async function handleLogout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  }
}
