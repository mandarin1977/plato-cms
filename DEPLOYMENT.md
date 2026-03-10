# Plato CMS 배포 가이드

Plato CMS는 **Headless CMS**입니다.
프론트엔드와 CMS(백엔드)를 **각각 따로 배포**해야 합니다.

```
[사용자 브라우저] → [프론트엔드 (Vercel 등)] → [Plato CMS API (서버)] → [SQLite DB]
```

---

## 목차

1. [구조 이해하기](#1-구조-이해하기)
2. [CMS 백엔드 배포](#2-cms-백엔드-배포)
3. [프론트엔드에서 API 연결하기](#3-프론트엔드에서-api-연결하기)
4. [프론트엔드 배포](#4-프론트엔드-배포)
5. [전체 흐름 예시](#5-전체-흐름-예시)

---

## 1. 구조 이해하기

### Headless CMS란?

일반 CMS(WordPress 등)는 백엔드와 프론트엔드가 하나로 묶여 있습니다.
Headless CMS는 **콘텐츠 관리(백엔드)**와 **화면 표시(프론트엔드)**가 분리되어 있습니다.

| 역할 | 설명 | 배포 위치 |
|------|------|-----------|
| **Plato CMS** | 콘텐츠 모델 설계, 콘텐츠 입력, API 제공 | VPS 또는 클라우드 서버 |
| **프론트엔드** | 사용자에게 보여지는 웹사이트/앱 | Vercel, Netlify 등 |

### 왜 따로 배포하나요?

- 프론트엔드를 자유롭게 선택 가능 (React, Next.js, Vue, 모바일 앱 등)
- 프론트엔드만 재배포해도 CMS 데이터는 그대로
- 하나의 CMS에서 웹, 앱, 여러 사이트에 콘텐츠 제공 가능

---

## 2. CMS 백엔드 배포

Plato CMS는 Node.js + SQLite 기반이므로 **파일 시스템이 있는 서버**에 배포해야 합니다.

### 방법 A: Railway (가장 쉬움)

[Railway](https://railway.app)는 GitHub 연결만으로 자동 배포됩니다.

**1단계: Railway 가입 & 프로젝트 생성**
- https://railway.app 에서 GitHub 계정으로 가입
- "New Project" → "Deploy from GitHub repo" 선택
- `plato-cms` 레포 선택

**2단계: 환경 변수 설정**

Railway 대시보드에서 Variables 탭에 추가:
```
DATABASE_URL=file:./prod.db
AUTH_SECRET=랜덤문자열(32자이상)
```

> AUTH_SECRET 생성: https://generate-secret.vercel.app/32

**3단계: 빌드 설정**

Settings 탭에서:
```
Build Command: npm install && npm run setup && npm run build
Start Command: npm start
```

**4단계: 배포 확인**

배포가 완료되면 `https://plato-cms-xxx.up.railway.app` 같은 URL이 생성됩니다.
이 URL이 CMS API 주소입니다.

---

### 방법 B: Fly.io

[Fly.io](https://fly.io)는 무료 티어가 있고, 영구 볼륨(디스크)을 지원합니다.

**1단계: Fly CLI 설치**
```bash
# Windows (PowerShell)
pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"

# macOS/Linux
curl -L https://fly.io/install.sh | sh
```

**2단계: 로그인 & 앱 생성**
```bash
fly auth login
fly launch --name my-plato-cms
```

**3단계: 볼륨 생성 (DB 영구 저장)**
```bash
fly volumes create plato_data --size 1
```

**4단계: fly.toml 설정**
```toml
[build]

[env]
  DATABASE_URL = "file:/data/prod.db"

[mounts]
  source = "plato_data"
  destination = "/data"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

**5단계: 시크릿 설정 & 배포**
```bash
fly secrets set AUTH_SECRET="랜덤문자열"
fly deploy
```

---

### 방법 C: VPS (AWS EC2, 네이버 클라우드 등)

직접 서버를 관리하고 싶은 경우.

**1단계: 서버 준비**
- Ubuntu 22.04 이상 권장
- Node.js 18+ 설치

```bash
# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**2단계: 프로젝트 클론 & 설정**
```bash
git clone https://github.com/mandarin1977/plato-cms.git
cd plato-cms
npm install
```

**3단계: 환경 변수**
```bash
cp .env.example .env
nano .env
# AUTH_SECRET을 랜덤 값으로 변경
```

**4단계: 빌드 & 실행**
```bash
npm run setup
npm run build
npm start
```

**5단계: PM2로 백그라운드 실행 (권장)**
```bash
sudo npm install -g pm2
pm2 start npm --name "plato-cms" -- start
pm2 save
pm2 startup  # 서버 재시작 시 자동 실행
```

**6단계: Nginx 리버스 프록시 (선택)**
```nginx
server {
    listen 80;
    server_name cms.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

### 방법 D: Docker

```bash
docker build -t plato-cms .
docker run -d \
  -p 3000:3000 \
  -e AUTH_SECRET="랜덤문자열" \
  -v plato-data:/app/prisma \
  --name plato-cms \
  plato-cms
```

> `-v plato-data:/app/prisma`로 DB 파일이 컨테이너 삭제 후에도 유지됩니다.

---

## 3. 프론트엔드에서 API 연결하기

CMS 배포가 완료되면 API URL을 받게 됩니다. (예: `https://cms.yourdomain.com`)

### 3-1. CMS에서 준비할 것

1. CMS에 접속하여 회원가입
2. 콘텐츠 모델 생성 (예: `posts` 슬러그의 블로그 모델)
3. 콘텐츠 작성 및 `published` 상태로 변경
4. **API 키** 메뉴에서 키 발급 (`cms_xxxx...` 형태)

### 3-2. 프론트엔드에서 API 호출

**React / Next.js 예시:**

```typescript
// lib/cms.ts
const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL; // 예: https://cms.yourdomain.com
const API_KEY = process.env.NEXT_PUBLIC_CMS_API_KEY; // 예: cms_xxxx...

export async function getPosts() {
  const res = await fetch(`${CMS_URL}/api/cms/content/posts`, {
    headers: { 'x-api-key': API_KEY! },
  });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function getPost(id: string) {
  const res = await fetch(`${CMS_URL}/api/cms/content/posts/${id}`, {
    headers: { 'x-api-key': API_KEY! },
  });
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
}
```

**페이지에서 사용:**

```tsx
// app/page.tsx (Next.js App Router)
import { getPosts } from '@/lib/cms';

export default async function HomePage() {
  const { entries } = await getPosts();

  return (
    <div>
      <h1>블로그</h1>
      {entries.map((post: any) => (
        <article key={post.id}>
          <h2>{post.data.title}</h2>
          <p>{post.data.summary}</p>
        </article>
      ))}
    </div>
  );
}
```

**Vue / Nuxt 예시:**

```javascript
// composables/useCms.js
const CMS_URL = import.meta.env.VITE_CMS_URL;
const API_KEY = import.meta.env.VITE_CMS_API_KEY;

export async function getPosts() {
  const res = await fetch(`${CMS_URL}/api/cms/content/posts`, {
    headers: { 'x-api-key': API_KEY },
  });
  return res.json();
}
```

### 3-3. 환경 변수 설정

프론트엔드 프로젝트의 `.env` 파일:

```env
# Next.js
NEXT_PUBLIC_CMS_URL=https://cms.yourdomain.com
NEXT_PUBLIC_CMS_API_KEY=cms_your_api_key_here

# Vue / Vite
VITE_CMS_URL=https://cms.yourdomain.com
VITE_CMS_API_KEY=cms_your_api_key_here
```

### 3-4. API 쿼리 파라미터

```typescript
// 검색
fetch(`${CMS_URL}/api/cms/content/posts?search=hello`)

// 페이지네이션
fetch(`${CMS_URL}/api/cms/content/posts?page=1&limit=10`)

// 정렬
fetch(`${CMS_URL}/api/cms/content/posts?sort=createdAt&order=desc`)

// 상태 필터
fetch(`${CMS_URL}/api/cms/content/posts?status=published`)
```

---

## 4. 프론트엔드 배포

프론트엔드는 정적 호스팅 서비스에 배포합니다.

### Vercel (Next.js 추천)

1. https://vercel.com 에서 GitHub 연결
2. 프론트엔드 레포 선택
3. 환경 변수 추가:
   - `NEXT_PUBLIC_CMS_URL` = CMS 서버 URL
   - `NEXT_PUBLIC_CMS_API_KEY` = 발급받은 API 키
4. Deploy 클릭

### Netlify

1. https://netlify.com 에서 GitHub 연결
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next` (Next.js) 또는 `dist` (Vite)
3. 환경 변수 추가 후 Deploy

---

## 5. 전체 흐름 예시

블로그를 만든다고 가정하겠습니다.

### Step 1: CMS 배포
```
Railway에 Plato CMS 배포
→ https://my-plato-cms.up.railway.app
```

### Step 2: CMS 설정
```
1. 회원가입
2. "posts" 모델 생성 (title: 텍스트, content: 리치텍스트, thumbnail: 이미지)
3. 블로그 글 작성 → published
4. API 키 발급
```

### Step 3: 프론트엔드 개발
```
Next.js로 블로그 프론트엔드 개발
→ CMS API에서 데이터를 불러와 화면에 표시
```

### Step 4: 프론트엔드 배포
```
Vercel에 프론트엔드 배포
→ https://my-blog.vercel.app
```

### 최종 결과
```
사용자가 my-blog.vercel.app 방문
  → Vercel이 my-plato-cms.up.railway.app API 호출
    → CMS가 SQLite에서 콘텐츠 조회
      → 사용자에게 블로그 글 표시
```

---

## 주의사항

- **SQLite 한계**: SQLite는 파일 기반 DB라서 서버 1대에서만 사용 가능합니다. 대규모 트래픽이 예상되면 PostgreSQL로 마이그레이션을 고려하세요.
- **이미지 업로드**: 현재 이미지는 서버 로컬(`public/uploads/`)에 저장됩니다. 서버리스 환경에서는 S3 같은 외부 스토리지 연동이 필요할 수 있습니다.
- **API 키 보안**: `NEXT_PUBLIC_` 접두사가 붙은 환경 변수는 브라우저에 노출됩니다. API 키는 읽기 전용이므로 괜찮지만, 민감한 작업은 서버 사이드에서 처리하세요.
- **HTTPS**: 프로덕션에서는 반드시 HTTPS를 사용하세요. Railway, Fly.io, Vercel은 자동으로 HTTPS를 제공합니다.
