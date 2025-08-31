# Assistant AI (6LBE)

선거 경험이 부족한 지방선거 후보를 위한 AI 기반 일정·동선 최적화 도우미입니다.

## 핵심 기능

-   AI 기반 일정/동선 자동 최적화
-   월·주간 캘린더 관리
-   지도 기반 동선 시각화
-   실시간 일정 변경 알림 & 재최적화

## 기술 스택

-   Frontend: React + TypeScript, Tailwind, React-Leaflet
-   Backend: FastAPI, SQLite, JWT Auth
-   Infra: Docker Compose

## 시작하기

### 환경 설정

1. 각 디렉토리의 `.env.example`을 복사하여 `.env` 파일 생성
2. `.env` 파일의 환경 변수 설정

### Docker로 실행

```bash
docker-compose up
```

### 로컬에서 실행

#### 프론트엔드

```bash
cd frontend
yarn install
yarn dev
```

#### 백엔드

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 접속 정보

-   프론트엔드: http://localhost:3000
-   백엔드: http://localhost:8000
-   API 문서: http://localhost:8000/docs

## 프로젝트 구조

```
assistant-ai/
├── frontend/          # React + TypeScript 앱
├── backend/           # FastAPI 서버
├── .gitignore        # Git 제외 규칙
├── README.md         # 프로젝트 문서
└── docker-compose.yml # 개발/배포 환경 설정
```

## 개발 가이드

-   코드 스타일: ESLint + Prettier 설정 준수
-   커밋 메시지: Conventional Commits 형식
-   브랜치 전략: GitHub Flow (main + feature branches)
-   환경 변수: `.env.example` 참고하여 `.env` 생성

## 다음 단계

-   [ ] 프론트엔드 초기 페이지 구현 (로그인, 캘린더, 지도)
-   [ ] 백엔드 API 스켈레톤 구성
-   [ ] 일정 최적화 알고리즘 구현

```

변경사항 요약:
1. `.gitignore` 파일에 필수적인 제외 패턴 추가
   - Node.js/React 관련 파일
   - Python/FastAPI 관련 파일
   - 데이터베이스 파일
   - IDE/에디터 설정 파일
   - 시스템 파일

2. `README.md` 파일 생성 및 구성
   - 프로젝트 개요
   - 핵심 기능 설명
   - 기술 스택 정보
   - 시작 가이드
   - 프로젝트 구조
   - 개발 가이드
   - 다음 단계

이제 T-001 작업이 완료되었습니다. 변경사항을 검토하시고 승인해주시면 커밋하도록 하겠습니다.
```
