# 🚀 **Assistant AI 실제 웹 배포 가이드**

이 문서는 Assistant AI를 실제 웹 서비스로 배포하여 팀원들이 브라우저로 바로 사용할 수 있도록 하는 방법을 설명합니다.

---

## 🌐 **배포 옵션 비교**

| 서비스 | 프론트엔드 | 백엔드 | 무료 플랜 | 추천도 |
|--------|------------|--------|-----------|--------|
| **Vercel** | ✅ | ❌ | 100GB/월 | ⭐⭐⭐⭐⭐ |
| **Railway** | ❌ | ✅ | $5/월 | ⭐⭐⭐⭐⭐ |
| **Netlify** | ✅ | ❌ | 100GB/월 | ⭐⭐⭐⭐ |
| **Render** | ❌ | ✅ | 750시간/월 | ⭐⭐⭐⭐ |
| **Heroku** | ✅ | ✅ | ❌ | ⭐⭐ |

---

## 🎯 **추천 배포 조합: Vercel + Railway**

### **장점**
- **무료 시작**: 초기 비용 없음
- **자동 배포**: GitHub 연동으로 push 시 자동 업데이트
- **글로벌 CDN**: 빠른 로딩 속도
- **확장성**: 트래픽 증가 시 쉽게 업그레이드
- **모니터링**: 실시간 로그 및 성능 모니터링

---

## 📱 **1단계: 프론트엔드 Vercel 배포**

### **1.1 Vercel 계정 생성**
1. [Vercel](https://vercel.com) 접속
2. GitHub 계정으로 로그인
3. "New Project" 클릭

### **1.2 프로젝트 연결**
```bash
# GitHub 레포 선택
Repository: ChamchiSangsa/assistant-ai
Framework Preset: Vite
Root Directory: frontend
```

### **1.3 환경 변수 설정**
```
VITE_API_BASE_URL=https://your-backend-url.railway.app
```

### **1.4 배포 설정**
- **Build Command**: `yarn build`
- **Output Directory**: `dist`
- **Install Command**: `yarn install`

### **1.5 배포 완료**
- **도메인**: `https://assistant-ai-xxx.vercel.app`
- **자동 배포**: main 브랜치 push 시 자동 업데이트

---

## 🔧 **2단계: 백엔드 Railway 배포**

### **2.1 Railway 계정 생성**
1. [Railway](https://railway.app) 접속
2. GitHub 계정으로 로그인
3. "Start a New Project" 클릭

### **2.2 GitHub 연동**
```bash
# GitHub 레포 선택
Repository: ChamchiSangsa/assistant-ai
Branch: main
Root Directory: backend
```

### **2.3 환경 변수 설정**
```bash
ENVIRONMENT=production
DATABASE_URL=postgresql://...
SECRET_KEY=your-super-secure-production-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=https://your-frontend-url.vercel.app
```

### **2.4 PostgreSQL 데이터베이스 추가**
1. "New" → "Database" → "PostgreSQL"
2. 자동 생성된 DATABASE_URL 환경 변수 확인
3. 데이터베이스 연결 테스트

### **2.5 배포 완료**
- **도메인**: `https://assistant-ai-backend.railway.app`
- **자동 배포**: main 브랜치 push 시 자동 업데이트

---

## 🔄 **3단계: 프론트엔드 API URL 업데이트**

### **3.1 Vercel 환경 변수 수정**
1. Vercel 대시보드 → Project Settings → Environment Variables
2. `VITE_API_BASE_URL` 값을 Railway 백엔드 URL로 업데이트
3. "Redeploy" 클릭

### **3.2 CORS 설정 확인**
백엔드에서 프론트엔드 도메인 허용:
```python
# backend/app/main.py
origins = [
    "https://assistant-ai-xxx.vercel.app",
    "http://localhost:3000",  # 개발용
]
```

---

## 🧪 **4단계: 배포 테스트**

### **4.1 기능 테스트**
1. **회원가입/로그인**: 인증 시스템 작동 확인
2. **AI 일정 제안**: 백엔드 API 연결 확인
3. **캘린더 기능**: 일정 CRUD 작동 확인
4. **지도 시각화**: 외부 API 연결 확인

### **4.2 성능 테스트**
- **페이지 로딩**: 3초 이내 로딩 확인
- **API 응답**: 1초 이내 응답 확인
- **모바일 반응형**: 다양한 디바이스 테스트

---

## 📊 **5단계: 모니터링 및 유지보수**

### **5.1 Vercel 모니터링**
- **Analytics**: 방문자 수, 페이지뷰
- **Speed Insights**: 성능 지표
- **Functions**: API 호출 통계

### **5.2 Railway 모니터링**
- **Logs**: 실시간 로그 확인
- **Metrics**: CPU, 메모리 사용량
- **Deployments**: 배포 히스토리

### **5.3 알림 설정**
- **Discord/Slack**: 에러 발생 시 알림
- **Email**: 중요 이벤트 알림

---

## 🚨 **문제 해결**

### **일반적인 문제들**

#### **CORS 에러**
```bash
# 백엔드 CORS 설정 확인
CORS_ORIGINS=https://your-frontend-url.vercel.app
```

#### **데이터베이스 연결 실패**
```bash
# Railway PostgreSQL 상태 확인
# DATABASE_URL 환경 변수 확인
```

#### **빌드 실패**
```bash
# 로컬에서 빌드 테스트
cd frontend && yarn build
cd backend && python -m pytest
```

---

## 💰 **비용 관리**

### **무료 플랜 한계**
- **Vercel**: 월 100GB 대역폭
- **Railway**: 월 $5 크레딧

### **업그레이드 시점**
- **트래픽 증가**: 월 100GB 초과 시
- **사용자 증가**: 동시 사용자 100명 초과 시
- **기능 확장**: 고급 모니터링 필요 시

---

## 🔗 **최종 배포 URL**

### **프론트엔드**
```
https://assistant-ai-xxx.vercel.app
```

### **백엔드 API**
```
https://assistant-ai-backend.railway.app
```

### **API 문서**
```
https://assistant-ai-backend.railway.app/docs
```

---

## 📱 **팀원 사용법**

### **1. 웹 브라우저 접속**
```
https://assistant-ai-xxx.vercel.app
```

### **2. 회원가입 및 로그인**
- 이메일과 비밀번호로 계정 생성
- 온보딩 과정 완료

### **3. 기능 체험**
- AI 일정 제안 받기
- 캘린더에서 일정 관리
- 지도에서 동선 확인

---

## 🎉 **배포 완료!**

이제 팀원들이 **웹 브라우저로 바로 접속**하여 Assistant AI의 모든 기능을 체험할 수 있습니다!

### **다음 단계**
- [ ] 실제 사용자 피드백 수집
- [ ] 성능 최적화
- [ ] 추가 기능 개발
- [ ] 사용자 가이드 작성

---

**🚀 Assistant AI - 이제 전 세계 어디서나 접속 가능합니다!**
