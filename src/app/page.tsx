import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-2xl text-center">
          <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium mb-6">
            오픈소스 Headless CMS
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight mb-6">
            콘텐츠를 정의하고
            <br />
            <span className="text-green-600">API로 어디서든</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-lg mx-auto">
            콘텐츠 모델을 자유롭게 설계하고,
            <br />
            REST API로 프론트엔드에 연결하세요.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="px-8 py-3.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              무료로 시작하기 →
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              로그인
            </Link>
          </div>
          <p className="mt-8 text-xs text-gray-400">
            완전 무료 · 무제한 모델 · 셀프 호스팅
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 bg-gray-50/50 py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: '콘텐츠 모델 정의',
              desc: '11종 필드 타입으로 원하는 데이터 구조를 자유롭게 설계하세요.',
            },
            {
              title: 'REST API 제공',
              desc: 'API 키 하나로 어떤 프론트엔드에서든 콘텐츠를 가져다 쓸 수 있습니다.',
            },
            {
              title: '셀프 호스팅',
              desc: '내 서버에 직접 설치하세요. 데이터 소유권은 100% 본인에게.',
            },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Detail */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">주요 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: '🗂', title: '무제한 콘텐츠 모델', desc: '블로그, 상품, 뉴스 등 원하는 구조를 제한 없이 만드세요.' },
              { icon: '📝', title: '리치 텍스트 에디터', desc: 'WYSIWYG 에디터로 서식, 이미지, 링크를 자유롭게 편집.' },
              { icon: '🔑', title: 'API 키 관리', desc: '프로젝트별 API 키를 발급하고 접근을 관리하세요.' },
              { icon: '🖼', title: '이미지 업로드', desc: '콘텐츠에 이미지를 드래그앤드롭으로 간편 업로드.' },
              { icon: '🔍', title: '검색 & 필터', desc: 'API에서 검색, 필터, 정렬, 페이지네이션을 지원합니다.' },
              { icon: '🛡', title: '보안 인증', desc: 'JWT 기반 인증으로 콘텐츠를 안전하게 관리하세요.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-6">
                <span className="text-2xl mb-3 block">{item.icon}</span>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Example */}
      <section className="border-t border-gray-100 bg-gray-50/50 py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">간단한 API 연동</h2>
          <p className="text-sm text-gray-500 mb-8">API 키 하나면 어디서든 콘텐츠를 불러올 수 있습니다.</p>
          <div className="bg-gray-950 rounded-xl p-6 text-left">
            <pre className="text-xs text-gray-300 overflow-x-auto">
{`// 콘텐츠 목록 조회
const res = await fetch('/api/cms/content/blog-posts', {
  headers: { 'x-api-key': 'cms_your_api_key' }
});
const { entries } = await res.json();

// 단일 콘텐츠 조회
const detail = await fetch('/api/cms/content/blog-posts/\${id}', {
  headers: { 'x-api-key': 'cms_your_api_key' }
});`}
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center">
        <p className="text-xs text-gray-400">
          © 2026 Plato CMS. Open Source Headless CMS.
        </p>
      </footer>
    </div>
  );
}
