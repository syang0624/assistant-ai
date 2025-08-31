# 🤖 Assistant AI - 선거 캠페인 일정 최적화 도구

선거 경험이 부족한 지방선거 후보들을 위한 AI 기반 일정·동선 플랜 자동 생성 웹 애플리케이션입니다.

## ✨ 주요 기능

-   **🎯 AI 일정 최적화**: 지역구와 활동 강도 기반 맞춤형 일정 생성
-   **📅 스마트 캘린더**: 월간/주간 뷰, 드래그 앤 드롭 일정 관리
-   **🗺️ 동선 시각화**: 지도 기반 최적 경로 및 거리 계산
-   **🔔 실시간 알림**: 일정 지연 감지 및 자동 재최적화
-   **📱 반응형 디자인**: 모바일/데스크톱 최적화

## 🚀 빠른 시작

### 개발 환경 실행

```bash
# 저장소 클론
git clone https://github.com/ChamchiSangsa/assistant-ai.git
cd assistant-ai

# 개발 환경 실행
docker-compose up -d

# 프론트엔드: http://localhost:3000
# 백엔드: http://localhost:8000
```

### 프로덕션 배포

```bash
# 배포 스크립트 실행
chmod +x deploy.sh
./deploy.sh

# 서비스 접속
# 프론트엔드: http://localhost
# 백엔드 API: http://localhost:8000
```

## 🏗️ 프로젝트 구조

```
assistant-ai/
├── frontend/                 # React + TypeScript
│   ├── src/components/       # UI 컴포넌트
│   ├── src/contexts/        # 상태 관리
│   └── src/utils/           # 유틸리티
├── backend/                  # FastAPI
│   ├── app/api/             # API 엔드포인트
│   ├── app/services/        # 비즈니스 로직
│   └── app/models/          # 데이터 모델
└── docker-compose.yml        # 개발 환경
```

## 🛠️ 기술 스택

-   **Frontend**: React 18, TypeScript, Tailwind CSS, FullCalendar, React-Leaflet
-   **Backend**: FastAPI, SQLAlchemy, SQLite, JWT
-   **Infrastructure**: Docker, Nginx, Docker Compose

## 📋 API 문서

### 인증

-   `POST /api/v1/auth/signup` - 회원가입
-   `POST /api/v1/auth/login` - 로그인

### 일정 관리

-   `GET /api/v1/schedules` - 일정 목록
-   `POST /api/v1/schedules` - 일정 생성
-   `PUT /api/v1/schedules/{id}` - 일정 수정
-   `DELETE /api/v1/schedules/{id}` - 일정 삭제

### AI 최적화

-   `POST /api/v1/optimize/suggest` - AI 일정 제안
-   `POST /api/v1/reoptimize-schedule` - 일정 재최적화

## 🔧 환경 설정

### 개발 환경

```bash
# .env 파일 생성
cp .env.example .env

# 환경 변수 설정
DATABASE_URL=sqlite:///./app.db
SECRET_KEY=your-secret-key
```

### 프로덕션 환경

```bash
# 프로덕션 환경 변수 설정
cp env.prod.example .env.prod

# 보안 키 설정
SECRET_KEY=your-super-secure-production-key
```

## 🧪 테스트

```bash
# 프론트엔드 테스트
cd frontend
npm test

# 백엔드 테스트
cd backend
pytest

# E2E 테스트
cd frontend
npm run test:e2e
```

## 📱 사용법

### 1. 회원가입 및 온보딩

-   지역구 선택
-   활동 강도 설정 (쉬움/보통/어려움)
-   첫 일정 입력

### 2. AI 일정 최적화

-   "AI 일정 제안 받기" 버튼 클릭
-   제안된 일정 검토 및 수락/거절
-   캘린더에서 일정 확인

### 3. 일정 관리

-   드래그 앤 드롭으로 시간 조정
-   일정 클릭으로 상세 정보 확인
-   실시간 지연 알림 및 재최적화

## 🔒 보안

-   JWT 기반 인증
-   Rate limiting (API: 10r/s, 로그인: 5r/m)
-   CORS 설정
-   보안 헤더 (XSS, CSRF 방지)

## 📊 성능

-   **프론트엔드**: Vite 기반 빠른 빌드
-   **백엔드**: FastAPI 고성능 API
-   **데이터베이스**: SQLite (개발) / PostgreSQL (프로덕션 준비)
-   **캐싱**: 정적 파일 1년 캐시, HTML no-cache

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

-   **이슈 리포트**: [GitHub Issues](https://github.com/ChamchiSangsa/assistant-ai/issues)
-   **문서**: [Wiki](https://github.com/ChamchiSangsa/assistant-ai/wiki)
-   **토론**: [GitHub Discussions](https://github.com/ChamchiSangsa/assistant-ai/discussions)

## 🎯 로드맵

-   [ ] 외부 API 연동 (교통 정보, 인구 데이터)
-   [ ] 고급 최적화 알고리즘 (피로도 모델)
-   [ ] 모바일 앱 (React Native)
-   [ ] 팀 협업 기능
-   [ ] 분석 대시보드

---

**Assistant AI** - 선거 캠페인의 디지털 전환을 선도합니다! 🚀
