<p align="center">
  <h1 align="center">Plato CMS</h1>
  <p align="center">셀프 호스팅 오픈소스 Headless CMS</p>
</p>

<p align="center">
  콘텐츠 모델을 자유롭게 설계하고, REST API로 어디서든 연결하세요.
</p>

---

## Features

- **콘텐츠 모델 빌더** — 11종 필드 타입(텍스트, 숫자, 날짜, 이미지, 리치텍스트, JSON 등)으로 원하는 데이터 구조를 설계
- **REST API** — API 키 하나로 어떤 프론트엔드에서든 콘텐츠 조회
- **리치 텍스트 에디터** — TipTap 기반 WYSIWYG 에디터 (이미지, 링크 지원)
- **이미지 업로드** — 드래그앤드롭으로 간편 업로드
- **검색 & 필터** — API에서 검색, 필터, 정렬, 페이지네이션 지원
- **API 키 관리** — 프로젝트별 키 발급 및 관리
- **JWT 인증** — 안전한 관리자 인증
- **셀프 호스팅** — 내 서버에 직접 설치, 데이터 소유권 100% 보장

## Tech Stack

| 영역 | 기술 |
|------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | SQLite (Prisma ORM) |
| Styling | Tailwind CSS 4 |
| Editor | TipTap |
| Auth | JWT (jose) + bcrypt |

## 설치 및 실행

### 사전 요구 사항

- [Node.js](https://nodejs.org) 18 이상
- npm, yarn, 또는 pnpm

### 1. 클론

```bash
git clone https://github.com/your-username/plato-cms.git
cd plato-cms
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성합니다:

```env
# 데이터베이스 (SQLite 기본)
DATABASE_URL="file:./dev.db"

# 인증 시크릿 키 (반드시 변경하세요)
AUTH_SECRET="your-secret-key-change-this"
```

> **AUTH_SECRET**은 반드시 충분히 긴 랜덤 문자열로 변경하세요. 아래 명령어로 생성할 수 있습니다:
> ```bash
> openssl rand -base64 32
> ```

### 4. 데이터베이스 초기화

```bash
npm run setup
```

이 명령은 Prisma 클라이언트를 생성하고 데이터베이스 테이블을 세팅합니다.

### 5. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

### 6. 계정 생성

브라우저에서 회원가입 페이지로 이동하여 관리자 계정을 만드세요.

## 프로덕션 배포

```bash
# 빌드
npm run build

# 실행
npm start
```

### Docker (선택)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run setup
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t plato-cms .
docker run -p 3000:3000 -v plato-data:/app plato-cms
```

## API 사용법

### 인증

모든 콘텐츠 API 요청에는 `x-api-key` 헤더가 필요합니다.
API 키는 대시보드의 **API 키** 메뉴에서 발급받을 수 있습니다.

### 콘텐츠 조회

```bash
# 목록 조회 (published 상태만)
curl -H "x-api-key: cms_your_api_key" \
  http://localhost:3000/api/cms/content/{모델슬러그}

# 단일 조회
curl -H "x-api-key: cms_your_api_key" \
  http://localhost:3000/api/cms/content/{모델슬러그}/{콘텐츠ID}
```

### 쿼리 파라미터

| 파라미터 | 설명 | 예시 |
|---------|------|------|
| `search` | 텍스트 검색 | `?search=hello` |
| `status` | 상태 필터 | `?status=published` |
| `sort` | 정렬 | `?sort=createdAt` |
| `order` | 정렬 방향 | `?order=desc` |
| `page` | 페이지 번호 | `?page=1` |
| `limit` | 페이지 크기 | `?limit=10` |

### 응답 형식

```json
{
  "entries": [
    {
      "id": "...",
      "data": { "title": "Hello World", "content": "..." },
      "status": "published",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

## 프로젝트 구조

```
plato-cms/
├── prisma/
│   └── schema.prisma        # 데이터베이스 스키마
├── public/                   # 정적 파일 & 업로드
├── src/
│   ├── app/
│   │   ├── api/              # API 라우트
│   │   │   ├── auth/         # 인증 (로그인, 회원가입)
│   │   │   └── cms/          # CMS API (모델, 콘텐츠, API 키)
│   │   ├── cms/              # CMS 대시보드 페이지
│   │   ├── login/            # 로그인 페이지
│   │   └── register/         # 회원가입 페이지
│   ├── components/           # 재사용 컴포넌트
│   ├── lib/                  # 유틸리티 (auth, prisma, validation)
│   └── types/                # TypeScript 타입
├── .env                      # 환경 변수 (직접 생성)
└── package.json
```

## License

MIT

---

Made with Next.js, Prisma, and Tailwind CSS.
