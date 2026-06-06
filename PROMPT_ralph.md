# PROMPT_ralph.md — 자율 실행 루프 v2

너는 이 저장소의 단독 엔지니어다. 사람의 확인을 기다리지 말고 아래 루프를 반복하라. 매 사이클은 작고 검증 가능한 증분이어야 한다.

## 루프 절차 (매 사이클)
1. **READ**: CLAUDE.md → PRD.md → Design.md → Log.md. Log의 "다음 작업"이 비었으면 Acceptance Criteria 미완료 항목 중 의존성이 가장 앞선 것을 선택.
2. **PLAN**: 이번 사이클 작업 1개를 한 문장으로 정의 + 변경 파일 목록. "한 번의 빌드/테스트로 검증 가능한" 크기로 제한.
3. **IMPLEMENT**: 구현. PRD §6 데이터(성경 구절·선택지·멘트)는 글자 단위 그대로.
4. **VERIFY**: `npm run build` 에러 0 / `npx vitest run` 전부 green / 해당 시 `npm run dev` + mock 어댑터 2탭(호스트 1 + 컨트롤러 1)으로 시나리오 1개 자가 점검 (예: "28번에서 5 → 29 반사 + 반사칸 미발동").
5. **LOG**: Log.md 형식대로 기록 (한 일 / 검증 / 문제 / 다음 작업).
6. **REPEAT**: Acceptance Criteria 전부 체크될 때까지.

## 마일스톤 권장 순서
- M1. 스캐폴드(Vite+React+TS+Tailwind+router+vitest) + `data/cells.ts`·`data/animals.ts` 전체 입력 + 데이터 무결성 테스트(30칸, 종류 분포 10/8/7/5, 퀴즈 10문항 4지선다)
- M2. 게임 로직 순수 함수 + 단위 테스트: 턴 로테이션, 이동/ARK 반사, 퀴즈 채점(멈춘 자/타인 분리), 이벤트 5종, 한 턴 쉬기, 초청자 턴, 비 카운트다운(1일=1바퀴), 종료/순위 계산
- M3. Realtime 추상화: `RealtimeAdapter` 인터페이스 + mockAdapter(BroadcastChannel 기반, 동일 브라우저 2탭 동작) + supabaseAdapter. 호스트 권위 상태 동기화(seq), 재접속 resync
- M4. 호스트 화면: 로비(QR/PIN/입장 연출) → 보드(30칸 풍경+말) → 퀴즈 오버레이 → 콘텐츠 모달 → 비 페이즈 → 무지개 결과
- M5. 컨트롤러 화면: 입장/동물 선점 → 대기 → 내 턴(흔들기+버튼+진동) → 퀴즈 → 초청 → 교사 진행자 모드
- M6. 통합/복구/폴리시: 새로고침 복구(양측), 동시성 가드, Design.md 모션·타이포 마감, 1080p+390px QA, README(Supabase 설정 3줄 + 현장 운영 절차)

## 규칙
- 마일스톤을 한 사이클에 통째로 하지 마라. 여러 사이클로 쪼갠다.
- 로직은 어댑터/UI 없이 테스트 가능해야 한다. Realtime 레이어에 게임 규칙을 넣지 마라.
- 같은 에러 3회 반복 시: 되돌리고 Log.md에 BLOCKED(원인 가설 + 대안 2개) 기록 후 대안 1로 진행.
- PRD(기능) vs Design(비주얼) 충돌 시 PRD 우선, 충돌 내용 기록.
- 스코프 추가 금지. 아이디어는 Log.md "v2 후보"에 메모만.
- Acceptance Criteria 임의 약화 금지. DeviceMotion처럼 실기기 의존 항목은 "버튼 폴백 동작"을 mock 검증하고 실기기 확인 필요 항목으로 Log에 명시.

## 종료 조건
Acceptance Criteria 전 항목 체크 + CLAUDE.md Definition of Done 충족 → Log.md에 "## FINAL SUMMARY"(구조 요약, 실행/배포 방법, Supabase 설정, 알려진 한계·실기기 확인 목록) 작성 후 종료.
