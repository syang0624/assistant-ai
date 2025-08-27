#!/usr/bin/env bash
set -euo pipefail

# ==== 설정 ====
BASE_URL="${BASE_URL:-http://localhost:8000}"
USER_BASE="${USER_BASE:-demo}"
PASS="${PASS:-demo}"
RAND="${RAND:-$RANDOM}"           # 매 실행마다 중복 방지
USER="${USER_BASE}-${RAND}"       # ex) demo-12345
AUTH="${USER}:${PASS}"

# jq / curl 검사
command -v curl >/dev/null || { echo "curl 이 필요합니다"; exit 1; }
command -v jq >/dev/null   || { echo "jq 가 필요합니다. brew install jq"; exit 1; }

# 요청 헬퍼: method path json_body [basic_auth]
req() {
  local method="$1"; shift
  local path="$1"; shift
  local body="${1:-}"; shift || true
  local basic="${1:-}"; shift || true

  local url="${BASE_URL}${path}"

  if [[ -n "${basic}" ]]; then
    curl -sS -u "${basic}" -X "${method}" \
      -H "Content-Type: application/json" \
      -d "${body}" \
      -w "\n%{http_code}" \
      "${url}"
  else
    curl -sS -X "${method}" \
      -H "Content-Type: application/json" \
      -d "${body}" \
      -w "\n%{http_code}" \
      "${url}"
  fi
}

# 응답 파싱 (마지막 줄은 http code)
parse() {
  local resp="$1"
  local http_code=$(echo "${resp}" | tail -n1)
  local body=$(echo "${resp}" | sed '$d')
  echo "${http_code}" "${body}"
}

# 기대 상태코드 검증 + 보기 좋게 출력
expect() {
  local want="$1"; shift
  local name="$1"; shift
  local resp="$1"; shift

  read -r code body <<<"$(parse "${resp}")"
  if [[ "${code}" != "${want}" ]]; then
    echo "❌ ${name} 실패 (HTTP ${code}, 기대 ${want})"
    echo "${body}" | jq . || echo "${body}"
    exit 1
  fi
  echo "✅ ${name} (HTTP ${code})"
  echo "${body}" | jq .
}

echo "=== E2E 시작: BASE_URL=${BASE_URL}, USER=${USER} ==="

# 0) 헬스체크
echo "---- [0] health ----"
resp=$(req GET "/api/health" "")
expect "200" "health" "${resp}"

# 1) 회원가입 & 로그인
echo "---- [1] signup/login ----"
resp=$(req POST "/api/signup" "{\"username\":\"${USER}\",\"password\":\"${PASS}\"}")
expect "200" "signup" "${resp}"

resp=$(req POST "/api/login" "{\"username\":\"${USER}\",\"password\":\"${PASS}\"}")
expect "200" "login" "${resp}"

# 2) 지역 저장 & 조회
echo "---- [2] locations ----"
resp=$(req PUT "/api/locations" '{"constituencies":{"선거구A":["동1","동2"],"선거구B":["동3"]}}' "${AUTH}")
expect "200" "put locations" "${resp}"

resp=$(req GET "/api/locations" "" "${AUTH}")
expect "200" "get locations" "${resp}"

# 3) 태스크들 생성 (의존성/시간창/마감/우선순위 다양)
echo "---- [3] create tasks ----"

# T0001
resp=$(req POST "/api/tasks" '{
  "title":"시청 앞 아침 인사",
  "priority":90,
  "duration_min":30,
  "window_from":"2025-09-01T08:00:00+09:00",
  "window_to":"2025-09-01T10:00:00+09:00"
}' "${AUTH}")
expect "200" "create T0001" "${resp}"

# T0002 (T0001 이후, latest 13:00)
resp=$(req POST "/api/tasks" '{
  "title":"시장 상인 간담회",
  "priority":70,
  "duration_min":45,
  "depends_on":["T0001"],
  "latest":"2025-09-01T13:00:00+09:00"
}' "${AUTH}")
expect "200" "create T0002" "${resp}"

# T0003 (시간창 너무 짧아서 실패 예상)
resp=$(req POST "/api/tasks" '{
  "title":"짧은 시간창 이벤트",
  "priority":80,
  "duration_min":30,
  "window_from":"2025-09-01T09:00:00+09:00",
  "window_to":"2025-09-01T09:20:00+09:00"
}' "${AUTH}")
expect "200" "create T0003" "${resp}"

# T0004 (마감이 너무 이름)
resp=$(req POST "/api/tasks" '{
  "title":"너무 이른 마감",
  "priority":95,
  "duration_min":30,
  "latest":"2025-09-01T08:10:00+09:00"
}' "${AUTH}")
expect "200" "create T0004" "${resp}"

# T0005, T0006 (우선순위 비교용)
resp=$(req POST "/api/tasks" '{
  "title":"낮은 우선순위",
  "priority":30,
  "duration_min":30
}' "${AUTH}")
expect "200" "create T0005" "${resp}"

resp=$(req POST "/api/tasks" '{
  "title":"높은 우선순위",
  "priority":99,
  "duration_min":30
}' "${AUTH}")
expect "200" "create T0006" "${resp}"

# 3-3) 태스크 목록 점검
resp=$(req GET "/api/tasks" "" "${AUTH}")
expect "200" "list tasks" "${resp}"

# 4) 스케줄 빌드(여러 케이스)
echo "---- [4] schedule build ----"

# 4-A) 기본 빌드
resp=$(req POST "/api/schedule/build" '{
  "date":"2025-09-01T00:00:00+09:00",
  "day_start":"2025-09-01T08:00:00+09:00",
  "day_end":"2025-09-01T19:00:00+09:00"
}' "${AUTH}")
expect "200" "build schedule (08~19)" "${resp}"

# 4-D) 우선순위가 높은 T0006가 먼저 배치되는지 확인하기 위해 창을 좁혀보기 (08~12)
resp=$(req POST "/api/schedule/build" '{
  "date":"2025-09-01T00:00:00+09:00",
  "day_start":"2025-09-01T08:00:00+09:00",
  "day_end":"2025-09-01T12:00:00+09:00"
}' "${AUTH}")
expect "200" "build schedule (08~12, priority check)" "${resp}"

# 4-E) 컷오프 테스트용 10분짜리 3개 추가 (일부만 들어가게)
for i in 1 2 3; do
  req POST "/api/tasks" "{\"title\":\"연속 작업 ${i}\",\"priority\":50,\"duration_min\":10}" "${AUTH}" >/dev/null
done

resp=$(req POST "/api/schedule/build" '{
  "date":"2025-09-01T00:00:00+09:00",
  "day_start":"2025-09-01T11:30:00+09:00",
  "day_end":"2025-09-01T12:00:00+09:00"
}' "${AUTH}")
expect "200" "build schedule (컷오프 30분)" "${resp}"

echo "🎉 모든 테스트 통과: USER=${USER}"
