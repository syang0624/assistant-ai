# 💰 **저렴한 백엔드 배포 가이드**

이 문서는 Assistant AI를 최소 비용으로 배포할 수 있는 다양한 백엔드 호스팅 옵션을 제공합니다.

---

## 🏆 **배포 옵션 비교표**

| 서비스 | 무료 플랜 | 유료 시작 | 추천도 | 특징 |
|--------|-----------|-----------|--------|------|
| **Render** | ✅ 750시간/월 | $7/월 | ⭐⭐⭐⭐⭐ | 가장 안정적, 무료 플랜 우수 |
| **Fly.io** | ✅ 3개 앱 | $1.94/월 | ⭐⭐⭐⭐ | 글로벌 배포, 빠른 속도 |
| **Railway** | ❌ | $5/월 | ⭐⭐⭐ | 간편한 설정, GitHub 연동 |
| **Heroku** | ❌ | $7/월 | ⭐⭐ | 안정적이지만 비쌈 |

---

## 🎯 **1순위: Render (무료 플랜)**

### **장점**
- **무료 플랜**: 월 750시간 (31일 × 24시간 = 744시간)
- **자동 슬립**: 사용하지 않을 때 자동으로 중지
- **PostgreSQL**: 무료 데이터베이스 제공
- **자동 배포**: GitHub 연동으로 push 시 자동 배포
- **HTTPS**: 자동 SSL 인증서

### **단점**
- **콜드 스타트**: 슬립 모드에서 깨어날 때 지연
- **월 750시간 제한**: 31일 내내 실행 불가

---

## 🚀 **Render 배포 방법**

### **1단계: Render 계정 생성**
1. [Render](https://render.com) 접속
2. GitHub 계정으로 로그인
3. "New +" → "Web Service" 클릭

### **2단계: GitHub 레포 연결**
```bash
# GitHub 레포 선택
Repository: ChamchiSangsa/assistant-ai
Branch: main
Root Directory: backend
```

### **3단계: 서비스 설정**
```bash
# 기본 설정
Name: assistant-ai-backend
Environment: Python 3
Region: Frankfurt (EU) 또는 Tokyo (APAC)
Branch: main
Root Directory: backend

# 빌드 설정
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### **4단계: 환경 변수 설정**
```bash
ENVIRONMENT=production
SECRET_KEY=your-super-secure-production-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=https://chamchisangsa.github.io
```

### **5단계: PostgreSQL 데이터베이스 추가**
1. "New +" → "PostgreSQL"
2. **무료 플랜 선택** (월 1GB, 90일)
3. 자동 생성된 DATABASE_URL 환경 변수 확인
4. 백엔드 서비스에 연결

### **6단계: 배포 완료**
- **도메인**: `https://assistant-ai-backend.onrender.com`
- **자동 배포**: main 브랜치 push 시 자동 업데이트

---

## 🚁 **2순위: Fly.io (무료 플랜)**

### **장점**
- **무료 플랜**: 3개 앱, 각각 256MB RAM
- **글로벌 배포**: 전 세계 엣지 서버
- **빠른 속도**: CDN과 유사한 성능
- **자동 스케일링**: 트래픽에 따른 자동 조정

### **단점**
- **복잡한 설정**: CLI 도구 필요
- **리소스 제한**: 256MB RAM으로 제한적

---

## 🚁 **Fly.io 배포 방법**

### **1단계: Fly CLI 설치**
```bash
# macOS
brew install flyctl

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Linux
curl -L https://fly.io/install.sh | sh
```

### **2단계: Fly 계정 생성**
```bash
fly auth signup
# 또는
fly auth login
```

### **3단계: 앱 생성 및 배포**
```bash
cd backend
fly launch
# 앱 이름: assistant-ai-backend
# 지역: nrt (도쿄)
# PostgreSQL: Yes
```

### **4단계: 환경 변수 설정**
```bash
fly secrets set ENVIRONMENT=production
fly secrets set SECRET_KEY=your-super-secure-production-key
fly secrets set ALGORITHM=HS256
fly secrets set ACCESS_TOKEN_EXPIRE_MINUTES=30
fly secrets set CORS_ORIGINS=https://chamchisangsa.github.io
```

### **5단계: 배포**
```bash
fly deploy
```

---

## 🔧 **3순위: Railway (유료)**

### **장점**
- **간편한 설정**: GitHub 연동으로 쉬운 배포
- **자동 배포**: push 시 즉시 반영
- **PostgreSQL**: 자동 데이터베이스 생성
- **모니터링**: 실시간 로그 및 메트릭

### **단점**
- **무료 플랜 없음**: 월 $5 크레딧 필요
- **비용 증가**: 사용량에 따른 과금

---

## 💡 **비용 최적화 전략**

### **1. Render 무료 플랜 활용**
```bash
# 슬립 모드 활성화
# 사용하지 않을 때 자동으로 중지
# 월 750시간 내에서 운영
```

### **2. Fly.io 무료 플랜 활용**
```bash
# 3개 앱까지 무료
# 각 앱 256MB RAM으로 운영
# 글로벌 엣지 서버 활용
```

### **3. 하이브리드 접근**
```bash
# 개발/테스트: Render 무료
# 프로덕션: Fly.io 무료
# 백업: Railway (필요시만)
```

---

## 🚨 **주의사항**

### **무료 플랜 한계**
- **Render**: 월 750시간, 콜드 스타트
- **Fly.io**: 256MB RAM, 3개 앱 제한
- **데이터베이스**: 제한된 저장 공간

### **업그레이드 시점**
- **트래픽 증가**: 동시 사용자 50명 초과
- **기능 확장**: 고급 모니터링 필요
- **안정성 요구**: 24/7 운영 필요

---

## 🎯 **추천 배포 순서**

### **1단계: Render 무료 플랜 (즉시 시작)**
- 가장 안정적이고 설정이 간단
- 무료로 충분한 기능 제공
- PostgreSQL 무료 데이터베이스

### **2단계: Fly.io 무료 플랜 (백업용)**
- 글로벌 배포로 성능 향상
- Render와 병행 운영
- 지역별 최적화

### **3단계: 유료 플랜 (필요시)**
- 트래픽 증가 시 업그레이드
- 24/7 운영 필요 시
- 고급 기능 요구 시

---

## 🔗 **최종 배포 URL**

### **프론트엔드 (GitHub Pages)**
```
https://chamchisangsa.github.io/assistant-ai/
```

### **백엔드 API (Render)**
```
https://assistant-ai-backend.onrender.com
```

### **백업 백엔드 (Fly.io)**
```
https://assistant-ai-backend.fly.dev
```

---

## 📱 **팀원 사용법**

### **1. 웹 브라우저 접속**
```
https://chamchisangsa.github.io/assistant-ai/
```

### **2. 기능 체험**
- AI 일정 제안 받기
- 캘린더에서 일정 관리
- 지도에서 동선 확인

---

## 🎉 **비용 최적화 완료!**

### **총 비용**
- **초기**: **완전 무료**
- **월간**: **완전 무료** (Render + Fly.io 무료 플랜)
- **업그레이드**: 필요시에만 유료 플랜

### **다음 단계**
- [ ] Render 무료 플랜으로 백엔드 배포
- [ ] Fly.io 무료 플랜으로 백업 백엔드 배포
- [ ] 실제 사용자 피드백 수집
- [ ] 성능 최적화

---

**💰 Assistant AI - 이제 무료로 전 세계 어디서나 접속 가능합니다!**
