# CLAUDE.md — 방주로 가는 길 v2 (TV + 모바일 멀티플레이어)

## 프로젝트 한 줄 정의
교회 중고등부 토요교제용 실시간 멀티플레이어 보드게임. 노트북→TV에 호스트(메인 보드) 화면을 띄우고, 학생들은 각자 모바일 브라우저로 접속해 자기 동물 캐릭터 상태를 확인하고 자기 턴에 폰을 흔들어 주사위를 굴린다. Jackbox/Kahoot 구조.

## 너의 역할
이 저장소의 단독 풀스택 엔지니어. PRD.md = 기능 SSOT, Design.md = 비주얼 SSOT. PROMPT_ralph.md 루프로 자율 작업, Log.md에 전 과정 기록.

## 기술 스택 (고정 — 변경 금지)
- **단일 Vite 앱** + React 18 + TypeScript + Tailwind CSS + react-router
  - 라우트 `/` = 호스트(TV) 화면, `/play` = 모바일 컨트롤러 (QR로 `/play?room=CODE` 진입)
  - 모노레포 아님. 한 번의 `npm run build`, 한 번의 배포(Vercel 정적)
- **실시간 동기화: Supabase Realtime (broadcast + presence)만 사용. DB 테이블 없음.**
  - 방 = 채널 `ark:{ROOM_CODE}`. 호스트가 유일한 상태 권위자(authoritative). 컨트롤러는 action 이벤트만 보내고, 호스트가 처리 후 전체 state를 broadcast.
- 의존성 허용 목록: react, react-dom, react-router-dom, @supabase/supabase-js, qrcode.react, (선택) framer-motion. **이외 추가 금지.**
- 상태관리: useReducer 기반. 게임 리듀서는 순수 함수로 `src/logic/`에 격리.
- 테스트: vitest. 순수 로직 전부 단위 테스트. Realtime은 어댑터 인터페이스로 추상화하고 테스트/로컬 개발용 mock 어댑터를 함께 구현한다 (Supabase 키 없이도 `npm run dev` 단일 브라우저 데모 가능해야 함).

## 디렉터리 구조 (준수)
```
src/
  data/cells.ts        # 30칸 콘텐츠 + 퀴즈 (PRD §6 그대로, 수정 금지)
  data/animals.ts      # 동물 캐릭터 8종
  logic/               # 순수 게임 로직 + *.test.ts
  realtime/            # RealtimeAdapter 인터페이스, supabaseAdapter, mockAdapter
  screens/host/        # TV 화면들 (로비/보드/퀴즈/비/결과)
  screens/play/        # 모바일 화면들 (입장/대기/내턴/퀴즈/초청/진행자)
  components/
```

## 환경/배포
- `.env.example` 제공: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (없으면 자동으로 mock 어댑터 + 경고 배너)
- 현장: 노트북(호스트, 1920x1080 TV 송출) + 학생 모바일(WiFi 또는 LTE, ~390px 세로). 인터넷 필수.
- Supabase 프로젝트는 사용자가 직접 생성(무료 티어). README.md에 설정 절차 3줄로 명시할 것.

## 금지 사항
- LangChain류 추상화 라이브러리, 외부 CDN 폰트/이미지, DB 테이블/Edge Function 사용 금지.
- 게임 콘텐츠(질문/선택지/성경 구절)는 PRD 데이터 그대로. 성경은 개역한글, 글자 단위 보존.
- 호스트 외의 클라이언트가 게임 상태를 직접 변경하는 코드 금지 (반드시 action → 호스트 처리).

## 코드 규약
- 식별자 영어, 사용자 노출 문자열 한국어.
- state에는 단조 증가 `seq`를 포함해 컨트롤러가 구버전 state를 무시할 수 있게 한다.
- 모바일 컨트롤러는 잠금/새로고침 후 재접속이 기본 시나리오다. localStorage(roomCode, playerId, playerToken)로 무조건 복구되게 작성.

## 완료 기준 (Definition of Done)
1. PRD Acceptance Criteria 전 항목 통과
2. `npm run build` 에러 0, `npx vitest run` 전부 green
3. mock 어댑터로 호스트+컨트롤러 2탭 시나리오 완주 가능
4. 호스트 1920x1080 / 컨트롤러 390x844 레이아웃 깨짐 없음
5. README.md (Supabase 설정 + 현장 운영 절차) + Log.md 최종 요약
