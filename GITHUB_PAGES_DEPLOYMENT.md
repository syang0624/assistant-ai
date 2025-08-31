# 🌐 **GitHub Pages 배포 가이드**

이 문서는 Assistant AI를 GitHub Pages에 무료로 배포하여 팀원들이 웹 브라우저로 바로 사용할 수 있도록 하는 방법을 설명합니다.

---

## 🎯 **GitHub Pages 배포 장점**

### **✅ 무료 서비스**
- **Organization Repo**: 무료로 사용 가능
- **자동 배포**: GitHub Actions로 자동화
- **HTTPS 지원**: 자동 SSL 인증서
- **글로벌 CDN**: GitHub의 글로벌 네트워크

### **✅ 간편한 설정**
- **GitHub 레포와 연동**: 별도 계정 불필요
- **자동 업데이트**: main 브랜치 push 시 자동 배포
- **버전 관리**: 배포 히스토리 추적

---

## 🚀 **1단계: GitHub 레포 설정**

### **1.1 GitHub Pages 활성화**
1. **GitHub 레포 접속**: `ChamchiSangsa/assistant-ai`
2. **Settings 탭 클릭**
3. **Pages 메뉴 선택**
4. **Source 설정**:
   - **Deploy from**: `GitHub Actions`
   - **Branch**: `gh-pages` (자동 생성됨)

### **1.2 GitHub Secrets 설정**
1. **Settings → Secrets and variables → Actions**
2. **New repository secret** 클릭
3. **다음 Secret 추가**:

```
VITE_API_BASE_URL=https://your-backend-url.railway.app
```

---

## 🔧 **2단계: 백엔드 배포 (Railway)**

### **2.1 Railway 계정 생성**
1. [Railway](https://railway.app) 접속
2. GitHub 계정으로 로그인
3. "Start a New Project" 클릭

### **2.2 프로젝트 연결**
```bash
# GitHub 레포 선택
Repository: ChamchiSangsa/assistant-ai
Branch: main
Root Directory: backend
```

### **2.3 환경 변수 설정**
```bash
ENVIRONMENT=production
DATABASE_URL=postgresql://... (자동 생성)
SECRET_KEY=your-super-secure-production-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=https://chamchisangsa.github.io
```

### **2.4 PostgreSQL 데이터베이스 추가**
1. "New" → "Database" → "PostgreSQL"
2. 자동 생성된 DATABASE_URL 환경 변수 확인
3. 데이터베이스 연결 테스트

---

## 📱 **3단계: 프론트엔드 자동 배포**

### **3.1 GitHub Actions 워크플로우**
- **파일 위치**: `.github/workflows/deploy.yml`
- **트리거**: main 브랜치 push 시 자동 실행
- **빌드**: Node.js 18, Yarn 사용
- **배포**: `gh-pages` 브랜치에 자동 배포

### **3.2 빌드 설정**
```typescript
// frontend/vite.config.ts
export default defineConfig({
    plugins: [react()],
    base: process.env.NODE_ENV === 'production' ? '/assistant-ai/' : '/',
});
```

### **3.3 환경 변수**
```bash
# GitHub Secrets에 설정
VITE_API_BASE_URL=https://your-backend-url.railway.app
```

---

## 🔄 **4단계: 배포 프로세스**

### **4.1 자동 배포 흐름**
1. **코드 변경**: main 브랜치에 push
2. **GitHub Actions 실행**: 자동으로 빌드 및 배포
3. **gh-pages 브랜치 업데이트**: 빌드된 파일 자동 업로드
4. **GitHub Pages 업데이트**: 몇 분 내에 사이트 반영

### **4.2 수동 배포**
```bash
# main 브랜치에 push하면 자동 배포
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main
```

---

## 🌐 **5단계: 최종 URL 확인**

### **5.1 GitHub Pages URL**
```
https://chamchisangsa.github.io/assistant-ai/
```

### **5.2 백엔드 API URL**
```
https://assistant-ai-backend.railway.app
```

### **5.3 API 문서**
```
https://assistant-ai-backend.railway.app/docs
```

---

## 🧪 **6단계: 배포 테스트**

### **6.1 기능 테스트**
1. **회원가입/로그인**: 인증 시스템 작동 확인
2. **AI 일정 제안**: 백엔드 API 연결 확인
3. **캘린더 기능**: 일정 CRUD 작동 확인
4. **지도 시각화**: 외부 API 연결 확인

### **6.2 성능 테스트**
- **페이지 로딩**: 3초 이내 로딩 확인
- **API 응답**: 1초 이내 응답 확인
- **모바일 반응형**: 다양한 디바이스 테스트

---

## 📊 **7단계: 모니터링**

### **7.1 GitHub Actions 모니터링**
- **Actions 탭**: 배포 상태 실시간 확인
- **워크플로우 로그**: 빌드/배포 과정 상세 확인
- **에러 알림**: 배포 실패 시 즉시 확인

### **7.2 GitHub Pages 모니터링**
- **Settings → Pages**: 배포 상태 및 설정
- **gh-pages 브랜치**: 배포된 파일 확인
- **사이트 접속**: 실제 동작 상태 확인

---

## 🚨 **문제 해결**

### **일반적인 문제들**

#### **빌드 실패**
```bash
# 로컬에서 빌드 테스트
cd frontend && yarn build
```

#### **API 연결 실패**
```bash
# CORS 설정 확인
CORS_ORIGINS=https://chamchisangsa.github.io
```

#### **페이지 404 에러**
```bash
# base 경로 설정 확인
base: '/assistant-ai/'
```

---

## 💰 **비용 정보**

### **무료 서비스**
- **GitHub Pages**: 완전 무료
- **GitHub Actions**: 월 2,000분 무료
- **Railway**: 월 $5 크레딧 (초기 무료)

### **총 비용**
- **초기**: **완전 무료**
- **월간**: **$5 이하** (Railway만)

---

## 🔗 **최종 배포 URL**

### **프론트엔드 (GitHub Pages)**
```
https://chamchisangsa.github.io/assistant-ai/
```

### **백엔드 API (Railway)**
```
https://assistant-ai-backend.railway.app
```

---

## 📱 **팀원 사용법**

### **1. 웹 브라우저 접속**
```
https://chamchisangsa.github.io/assistant-ai/
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

이제 팀원들이 **GitHub Pages URL로 바로 접속**하여 Assistant AI의 모든 기능을 체험할 수 있습니다!

### **다음 단계**
- [ ] GitHub Pages 설정 완료
- [ ] Railway 백엔드 배포
- [ ] 실제 사용자 피드백 수집
- [ ] 성능 최적화

---

**🚀 Assistant AI - GitHub Pages로 무료 배포 완료!**
