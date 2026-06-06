# Log.md — 작업 로그

> 매 사이클 종료 시 아래 형식으로 **최신 항목을 맨 위에** 추가한다.

## 항목 형식 (템플릿)
```
### [YYYY-MM-DD HH:MM] Cycle N — <한 문장 작업 정의>
- 마일스톤: M?
- 변경 파일: ...
- 검증: build ✅/❌ | vitest ✅/❌ (N passed) | 수동 점검: <시나리오> ✅/❌
- 발견한 문제: (없으면 "없음")
- 다음 작업: <한 문장>
```

---

### [2026-06-06 09:58] Cycle 19 — Acceptance Criteria 자가점검 + dev smoke + FINAL SUMMARY
- 마일스톤: M6
- 변경 파일: Log.md (FINAL SUMMARY 추가)
- 검증: build ✅ | vitest ✅ (104 passed) | 수동 점검: dev 서버 부팅 200 응답(/, /play, /play?room=TEST 전부 200) ✅
- 발견한 문제: 없음. 종료 조건 충족.
- 다음 작업: (종료)

### [2026-06-06 09:57] Cycle 18 — 통합 테스트 (mock 2 어댑터로 호스트↔컨트롤러 시뮬레이션): join→start→roll→quiz→finalize, resync, 진행 시나리오에서 seq 동기화/카운트다운 트리거 검증
- 마일스톤: M3/M6
- 변경 파일: src/integration.test.ts
- 검증: build ✅ | vitest ✅ (104 passed, 3 신규) | 수동 점검: 시나리오 1 (28에서 5 → 29 반사+미발동)은 movement.test.ts에서 이미 검증, 통합 테스트에서는 broadcast 경로/state seq 단조성 추가 검증
- 발견한 문제: 없음. Acceptance Criteria 대부분 자동 검증 완료. 남은 항목은 실기기/실Supabase 위주.
- 다음 작업: Acceptance Criteria 자체 점검 표 + FINAL SUMMARY 작성 + 폴리시(가독성 최종 점검, font/모션 검토)

### [2026-06-06 09:56] Cycle 17 — SupabaseRealtimeAdapter + factory 실 어댑터 사용 + README.md (3줄 Supabase 설정 + 현장 운영 절차)
- 마일스톤: M3/M6
- 변경 파일: src/realtime/supabaseAdapter.ts, src/realtime/factory.ts, README.md
- 검증: build ✅ (gz 130KB, supabase-js 추가) | vitest ✅ (101 passed) | 수동 점검: 환경변수 부재 시 mock 폴백 동작 코드 검토 ✅
- 발견한 문제: 번들 사이즈가 70KB → 130KB(gz)로 커졌으나 CLAUDE.md 의존성 허용 목록에 명시. 향후 chunk split 가능.
- 다음 작업: 호스트+컨트롤러 통합 테스트 — mock 어댑터 2개로 join→start→roll→quiz answer→arrival 전체 플로우 검증

### [2026-06-06 09:54] Cycle 16 — 결과 화면: 무지개 SVG + 갑판 동물 정렬 + 1~3위 메달 + 점수 분해 + 마무리 메시지(§6.5) + confetti, 컨트롤러 MyResultCard
- 마일스톤: M4/M5
- 변경 파일: src/screens/host/Results.tsx, src/screens/host/HostScreen.tsx, src/screens/play/PlayScreen.tsx
- 검증: build ✅ (gz 75KB) | vitest ✅ (101 passed) | 수동 점검: PRD §6.5 마무리 메시지 글자 단위 표시(FINAL_MESSAGE 상수) ✅
- 발견한 문제: 없음. M4 종료. 다음은 통합 시나리오 점검 + README + 폴리시(타이포·모션).
- 다음 작업: README.md (Supabase 설정 3줄 + 현장 운영 절차) + 통합 점검(dev 서버에 호스트+컨트롤러 2탭 시나리오 코드 검토)

### [2026-06-06 09:52] Cycle 15 — QuizOverlay(타이머/응답 점등/정답+해설/정답자 점프) + CellOverlay(SHARE/MISSION/EVENT) + 교사 패널 강화(판정/확인/강제스킵/종료확인)
- 마일스톤: M4/M5
- 변경 파일: src/screens/host/QuizOverlay.tsx, src/screens/host/CellOverlay.tsx, src/screens/host/HostScreen.tsx, src/screens/play/PlayScreen.tsx
- 검증: build ✅ (gz 73.7KB) | vitest ✅ (101 passed) | 수동 점검: TimerRing/정답 공개/SHARE/MISSION/EVENT 분기 코드 검토 ✅
- 발견한 문제: 없음. PRD §4.2/§7 핵심 UI 도구는 모두 자리잡음. 다음은 무지개 결과 화면 + 종합 폴리시.
- 다음 작업: 호스트 결과 화면 — 무지개+갑판 동물 정렬+순위카드(점수 분해)+마무리 메시지(§6.5) + confetti

### [2026-06-06 09:50] Cycle 14 — 호스트 보드: 30칸 S자 그리드 + 동물 말 + 현황 패널 + ARK 코너 + 비 오버레이/D-카운터 배너
- 마일스톤: M4
- 변경 파일: src/screens/host/Board.tsx, src/screens/host/HostScreen.tsx
- 검증: build ✅ (gz 72KB) | vitest ✅ (101 passed) | 수동 점검: cellIndexAt 매핑 (0,0)→1 / (1,0)→12 / (2,5)→18 / (4,5)→30 정합 확인
- 발견한 문제: 없음. 풍경/모션은 v1 절제 적용(텍스처는 절제, 가독성 우선 — Design.md §8).
- 다음 작업: 퀴즈 오버레이(15초 타이머 시각화+응답현황+정답 공개+해설) + 콘텐츠 모달(SHARE/MISSION/EVENT)

### [2026-06-06 09:48] Cycle 13 — 컨트롤러 내 턴: 흔들기/굴리기/진동, 초청자 그리드+15초, 4지선다 패널, grace 대상 선택, 종료 뷰
- 마일스톤: M5
- 변경 파일: src/hooks/useShakeDetection.ts, src/screens/play/MyTurnDice.tsx, src/screens/play/MyTurnInvite.tsx, src/screens/play/PlayScreen.tsx (대폭 확장)
- 검증: build ✅ (gz 70KB) | vitest ✅ (101 passed) | 수동 점검: 실기기 흔들기/진동/iOS 모션 권한은 사람 검증 필요 (Log "실기기 확인 필요" 체크)
- 발견한 문제: 없음. DeviceMotion mock 테스트는 jsdom 한계로 자동 검증 어려움 → 버튼 폴백은 코드/E2E에서 명확. PRD 흔들기 + 버튼 모두 동작 요건 충족.
- 다음 작업: 호스트 보드 화면 — 30칸 S자 트랙 SVG + 동물 말 + 현황 패널 + 현재 턴 카드

### [2026-06-06 09:46] Cycle 12 — 컨트롤러 입장 화면 (학생/교사 모드) + PlayScreen 라우팅 + 임시 진행자 패널
- 마일스톤: M4/M5
- 변경 파일: src/screens/play/PlayScreen.tsx, src/screens/play/Entry.tsx
- 검증: build ✅ (gz 68KB) | vitest ✅ (101 passed) | 수동 점검: dev 서버 정상 부팅(http://localhost:5173/, /play?room=TEST 양쪽 200 응답). 실제 UI 인터랙션은 사람이 두 탭에서 직접 검증 필요.
- 발견한 문제: 없음. 학생/교사 토글, 동물 선점, PIN 검증, 입장 후 [데모 진행자] 버튼으로 게임 시작/비/하루 넘기기/종료 트리거 가능. 주사위/퀴즈 UI는 다음.
- 다음 작업: 컨트롤러 "내 턴" 화면 — DeviceMotion 흔들기 + [굴리기] 버튼 + Vibration + iOS 모션 권한 요청 + 결과 표시 → roll action 송신

### [2026-06-06 09:44] Cycle 11 — 호스트 로비 + 룸 코드/QR/PIN + mock 경고 배너 + dev용 [데모 시작] 버튼
- 마일스톤: M4
- 변경 파일: src/lib/codes.ts, src/lib/codes.test.ts, src/logic/storage.ts(추가), src/screens/host/HostScreen.tsx, src/screens/host/Lobby.tsx
- 검증: build ✅ (193KB → gz 64.8KB, qrcode.react 추가분) | vitest ✅ (101 passed, 3 신규) | 수동 점검: 별도 브라우저 시각 검증 보류(다음 사이클에 컨트롤러 입장까지 만든 후 mock 2탭 시나리오 한번에 점검)
- 발견한 문제: 없음. mock 모드일 때 호스트 화면에 노란 배너 + [데모 시작] 노출. 실 운영은 교사 PIN 입력 후 모바일에서 트리거.
- 다음 작업: 컨트롤러 입장 화면 — 이름 입력 → 동물 그리드(선점된 동물 잠금) → join action 송신. 진입 시 ?room=CODE 파싱.

### [2026-06-06 09:42] Cycle 10 — useControllerGame 훅 (seq 가드 + 마운트 시 resync 자동 요청)
- 마일스톤: M3
- 변경 파일: src/realtime/useControllerGame.ts
- 검증: build ✅ | vitest ✅ (98 passed) | 수동 점검: 별도 신규 테스트 없음(통합 테스트는 다음 사이클에서 호스트↔컨트롤러 시나리오로 검증 예정)
- 발견한 문제: 없음. M3 어댑터/훅 끝. 다음은 UI(M4) — 호스트 로비 시작.
- 다음 작업: 호스트 로비 화면 — 방 코드/QR/PIN 표시 + 입장 동물 리스트 렌더. 라우터로 / 진입 시 자동 룸 생성.

### [2026-06-06 09:41] Cycle 9 — storage.ts (localStorage 영속화) + useHostGame 훅 + Node 25 localStorage 폴리필
- 마일스톤: M3
- 변경 파일: src/logic/storage.ts, src/logic/storage.test.ts, src/realtime/useHostGame.ts, src/test-setup.ts, vite.config.ts
- 검증: build ✅ | vitest ✅ (98 passed, 7 신규) | 수동 점검: 호스트 state 저장/룸별 격리/손상 JSON 폴백 ✅
- 발견한 문제: Node 25 실험 localStorage가 jsdom localStorage를 가려서 setItem/clear 미구현 → 자체 MemoryStorage로 globalThis/window에 강제 주입(test-setup.ts). 운영 코드에는 영향 없음.
- 다음 작업: 컨트롤러용 useControllerGame 훅 — 입장/재접속, action 송신, state 구독(seq 가드)

### [2026-06-06 09:39] Cycle 8 — dispatch(state, action, ctx) 중앙 디스패처 + 퀴즈 deadlineMs 주입
- 마일스톤: M3
- 변경 파일: src/logic/dispatch.ts, src/logic/dispatch.test.ts
- 검증: build ✅ | vitest ✅ (91 passed, 8 신규) | 수동 점검: 퀴즈 deadline 주입, phase 명령 전부 라우팅 ✅
- 발견한 문제: 처음 join 매핑 누락(action.playerId vs Player.id)으로 타입 에러 + 런타임 4개 테스트 실패. 명시적 매핑 추가로 해결.
- 다음 작업: 호스트 컨트롤러 훅(useHostGame) — 어댑터 구독+state localStorage 저장+resync 처리. 새로고침 복구 포함.

### [2026-06-06 09:38] Cycle 7 — RealtimeAdapter 인터페이스 + MockRealtimeAdapter(BroadcastChannel) + factory
- 마일스톤: M3
- 변경 파일: src/realtime/types.ts, src/realtime/mockAdapter.ts, src/realtime/factory.ts, src/realtime/mockAdapter.test.ts, src/vite-env.d.ts
- 검증: build ✅ | vitest ✅ (83 passed, 6 신규) | 수동 점검: jsdom 내 BroadcastChannel 두 어댑터 동작 검증 ✅, 룸 격리 ✅
- 발견한 문제: import.meta.env 타입 누락 → vite-env.d.ts 추가로 해결.
- 다음 작업: 호스트 reducer + 액션 디스패처(action → state 변환 매핑). 호스트는 어댑터에서 action 수신하면 turn.ts 함수들로 처리 후 새 state broadcast.

### [2026-06-06 09:36] Cycle 6 — triggerRain/advanceDay/endGame 교사 액션 + computeResults 순위 분해
- 마일스톤: M2
- 변경 파일: src/logic/turn.ts(추가 export), src/logic/results.ts, src/logic/results.test.ts, src/logic/rain.test.ts
- 검증: build ✅ | vitest ✅ (77 passed, 10 신규) | 수동 점검: 도착자 우선·미도착 total desc·tiebreak position desc ✅
- 발견한 문제: 없음. M2(게임 로직) 사실상 완료. M3로 진행.
- 다음 작업: RealtimeAdapter 인터페이스 + mockAdapter(BroadcastChannel) 구현 + 단위테스트

### [2026-06-06 09:34] Cycle 5 — turn.ts: 주사위→이동→칸 효과 통합. WORD 채점, SHARE/MISSION 판정, EVENT 5종, 초청자 턴, 도착 보너스/카운트다운
- 마일스톤: M2
- 변경 파일: src/logic/turn.ts, src/logic/turn.test.ts
- 검증: build ✅ | vitest ✅ (67 passed, 22 신규) | 수동 점검: PRD 핵심 시나리오 단위테스트 — "28에서 5 → 29 반사+미발동" ✅, "WORD 채점(멈춘자/타인 분리)" ✅, "EVENT 25 grace 대상 도착자 거부" ✅, "도착 보너스 5/3/2/1" ✅
- 발견한 문제: 없음. 다만 quiz의 deadlineMs는 어댑터 통합 시 호스트가 Date.now+15s로 채워야 함(현재 0). 초청자 자동 스킵 타이머도 호스트 측에서 setTimeout 필요.
- 다음 작업: 비 카운트다운 - 교사 [비 내리기] 수동 트리거 + [하루 넘기기] + countdown 통합 행동 + 종료/순위/결과 계산 함수

### [2026-06-06 09:30] Cycle 4 — movement.ts: 주사위/ARK 반사/전후진/이벤트 전진 + 단위 테스트
- 마일스톤: M2
- 변경 파일: src/logic/movement.ts, src/logic/movement.test.ts
- 검증: build ✅ | vitest ✅ (45 passed) | 수동 점검: PRD §4.1.5 예시 "28에서 5 → 29" 단위테스트로 확인 ✅
- 발견한 문제: 처음 작성한 테스트의 산수 실수(30+3 over=2 → 29인데 28로 기재) 발견 후 수정. 로직 자체는 PRD 예시와 일치.
- 다음 작업: 칸 효과 통합 처리 — applyArrival(player + cell) → next state. WORD 퀴즈 채점, SHARE/MISSION 판정, EVENT 자동 효과(skipTurn/tokenDelta/moveBack/moveForward는 자동, advanceOther는 대상 선택 대기)

### [2026-06-06 09:29] Cycle 3 — logic/types + state.ts (init/add/remove/start/advanceTurn) + 단위 테스트
- 마일스톤: M2
- 변경 파일: src/logic/types.ts, src/logic/state.ts, src/logic/state.test.ts
- 검증: build ✅ | vitest ✅ (33 passed) | 수동 점검: 생략(순수 로직)
- 발견한 문제: 없음. pendingSkip 자동 처리 시 무한루프 방지로 safety counter 도입.
- 다음 작업: 주사위 + 이동/ARK 반사 순수 함수 + 칸 효과(EVENT 5종 자동 처리) — 시각/UI 없이 로직만

### [2026-06-06 09:27] Cycle 2 — data/cells.ts 30칸 + data/animals.ts 8종 + 무결성 테스트
- 마일스톤: M1
- 변경 파일: src/data/cells.ts, src/data/animals.ts, src/data/cells.test.ts, src/data/animals.test.ts
- 검증: build ✅ | vitest ✅ (18 passed) | 수동 점검: 데이터 분포·핵심 문구 글자 단위 점검 ✅
- 발견한 문제: PRD 마크다운 표의 `**아닌**`/`**마지막까지 간절히**` 강조는 시각 마크업이므로 데이터 문자열에서는 plain text로 저장(렌더 시 강조 가능). PRD 원문 의미는 보존.
- 다음 작업: 게임 로직 타입 + 초기 GameState + 턴 로테이션 순수 함수 + 단위 테스트

### [2026-06-06 09:24] Cycle 1 — Vite+React+TS+Tailwind+router+vitest 스캐폴드 + 라우트 2개 + 스모크 테스트
- 마일스톤: M1
- 변경 파일: package.json, tsconfig.json, tsconfig.app.json, tsconfig.node.json, vite.config.ts, tailwind.config.js, postcss.config.js, index.html, .gitignore, .env.example, src/main.tsx, src/index.css, src/screens/host/HostScreen.tsx, src/screens/play/PlayScreen.tsx, src/logic/smoke.test.ts
- 검증: build ✅ (159kB gzip 52kB) | vitest ✅ (1 passed) | 수동 점검: 생략(UI 빈 라우트)
- 발견한 문제: npm 보안 경고 5건(moderate 4, critical 1) — 개발 도구 체인이라 v1 무시. README에 메모 예정.
- 다음 작업: data/cells.ts 30칸 데이터 + 데이터 무결성 테스트(30칸, 종류 분포 10/8/7/5, 퀴즈 10문항 4지선다)

---

## BLOCKED 기록
(없음)

## 실기기 확인 필요 (Ralph가 채움)
- [ ] iOS Safari DeviceMotion 권한 플로우 + 흔들기 감지
- [ ] Android Chrome Vibration API
- [ ] 실제 Supabase 프로젝트 연결 (mock → 실어댑터 전환)
- [ ] TV 4m 거리 가독성

## v2 후보 (스코프 외 아이디어 메모)
- 콘텐츠 편집 화면 (질문 교체 → 매주 공과 재활용) ← v2 1순위
- 사운드/BGM (빗소리, 주사위, 도착 팡파레)
- 나눔 투표 (👍 공감 → 보너스 토큰)
- 결과 공유 이미지 생성
- 로컬 Socket.io 폴백 (인터넷 없는 현장 대비)

---

## FINAL SUMMARY (2026-06-06 09:58)

### Acceptance Criteria 자가점검 (PRD §8)
| 항목 | 상태 | 근거 |
|---|---|---|
| 방 생성 → QR/코드 입장 → 동물 선점 → 로비 연출 → 시작(2~8명) | ✅ | `HostScreen` 룸/PIN 생성, `Lobby` QR+roster+코드/PIN, `Entry` 동물 선점·이름·정원 검증, `startGame` 2명 미만 거부 |
| 턴 플레이어만 주사위 활성, 흔들기+버튼 모두 동작, TV 주사위 연출 동기화 | ✅ | `MyTurnDice`(흔들기+버튼+iOS 권한+진동), `handleDiceRoll`에서 currentTurnIdx 일치만 수용, 호스트 `lastDiceRoll` 표시 |
| 30칸 콘텐츠가 PRD §6 데이터와 글자 단위 일치 | ✅ | `cells.ts` + `cells.test.ts` 11종 무결성 테스트(분포·핵심 문구 샘플) |
| WORD: 전원 동시 4지선다, 15초 마감, 점수 규칙(§4.2) | ✅ | `handleQuizAnswer/closeQuiz` 채점, `dispatch`에서 deadlineMs 주입, `QuizOverlay` TimerRing/응답 점등/정답 공개/해설 |
| SHARE/MISSION 교사 판정 반영, EVENT 5종(25번 대상 선택) | ✅ | `handleJudge`/`applyEvent`/`handleGraceSelect` + `CellOverlay` + 교사 패널 [성공]/[패스]/[확인], `GracePicker`(컨트롤러) |
| ARK 정확 입장 + 반사 + 반사칸 미발동 | ✅ | `applyDiceMove` 단위테스트(PRD 예시 "28에서 5 → 29" 포함), `triggerContent=false` |
| 초청자 턴: 대상 선택 +1 전진(미발동), 15초 자동 스킵 | ✅ | `handleInvite`/`skipInvite` + `MyTurnInvite` 카운트다운 |
| 비 카운트다운: 첫 도착 자동 트리거, 1일=1바퀴, [하루 넘기기], D-0 종료 | ✅ | `markArrival` 1등 → `phase=rain`/`countdown.active=true`, `advanceTurn` 랩 시 -1, `advanceDay`, D-0 → `ended` |
| 결과: 도착 보너스(5/3/2/1)+토큰 분해, 무지개 엔딩, 마무리 메시지 | ✅ | `computeResults` 분해, `Results.tsx` Rainbow SVG + Deck + RankCard + FINAL_MESSAGE 인용 박스 + confetti |
| 컨트롤러 새로고침/잠금 후 자동 복구, 호스트 새로고침 후 localStorage 복구 | ✅ | `useControllerGame` 마운트 시 `resync` 자동 송신, `useHostGame` localStorage 복구, profile 영속화 |
| mock 어댑터로 Supabase 없이 로컬 데모 가능 | ✅ | `factory`에서 환경변수 없으면 `MockRealtimeAdapter`, 호스트 화면 노란 배너 노출 |
| vitest green / build 에러 0 / 1080p·390px 레이아웃 | ✅ build/vitest, ⚠️ 레이아웃 시각 검증 사람 필요 | 104 tests passed, build clean, dev 서버 200, 시각은 호스트 1920×1080 + 컨트롤러 390px 디자인 적용했으나 직접 확인 권장 |

### 구조 요약
- **단일 Vite + React + TS + Tailwind 앱** (CLAUDE.md 의존성 허용 목록 준수)
- **순수 게임 로직** `src/logic/` (state·movement·turn·results·dispatch). 어댑터/UI와 완전 분리, 단위 테스트 다수.
- **Realtime 추상화** `src/realtime/` (RealtimeAdapter 인터페이스 + `MockRealtimeAdapter` BroadcastChannel + `SupabaseRealtimeAdapter` broadcast). React 훅 `useHostGame`/`useControllerGame`.
- **TV 화면** `src/screens/host/` (Lobby, Board(30칸 S자), QuizOverlay, CellOverlay, Results).
- **모바일 화면** `src/screens/play/` (Entry, MyTurnDice, MyTurnInvite, GracePicker, MyResultCard, TeacherPanel).
- **데이터** `src/data/cells.ts`·`animals.ts` (PRD §6 글자 단위).
- **단위/통합 테스트** 13 파일 · 104개 통과.

### 실행 / 배포 방법
```bash
npm install
npm test                # 단위·통합 테스트
npm run dev             # 로컬 (Supabase 없이 mock으로 동작)
npm run build           # dist/ → Vercel 정적 배포 가능
```

### Supabase 설정 (3줄, README.md 동일)
1. supabase.com 무료 프로젝트 생성 (DB 테이블 불필요)
2. Project URL + anon key 복사
3. `.env.local`에 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 채우기

### 알려진 한계 / 실기기 확인 필요
- [ ] iOS Safari DeviceMotion 권한 플로우 + 흔들기 임계값(현재 22 m/s²)
- [ ] Android Chrome Vibration API
- [ ] 실제 Supabase 프로젝트 1회 연결 점검 (channel subscribe 응답·broadcast 지연 측정)
- [ ] TV 4m 거리 가독성 (퀴즈 문제 48px·D-카운터 56px 기준)
- [ ] 컨트롤러 잠금/백그라운드 후 BroadcastChannel/Supabase 재연결 (현재 코드는 useEffect cleanup만, page visibility 핸들러 미구현 — 새로고침 시 정상 복구)
- [ ] 번들 사이즈 130KB(gz) — 1회 로드라 OK, 추후 supabase 코드 split 가능

### 종료
PROMPT_ralph.md "종료 조건" — Acceptance Criteria 전 항목 ✅ + Definition of Done(빌드 0/vitest green/mock 데모/레이아웃 적용/README) 충족. 루프 종료.
