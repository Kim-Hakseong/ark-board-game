# 방주로 가는 길 v2

교회 중고등부 토요교제용 실시간 멀티플레이어 보드게임. 노트북→TV에 호스트(메인 보드) 화면을 띄우고, 학생들은 각자 모바일 브라우저로 접속해 자기 동물 캐릭터 상태를 확인하고 자기 턴에 폰을 흔들어 주사위를 굴린다. Jackbox/Kahoot 구조.

22주차 공과 "하나님의 오래 참으심이 끝나는 날" (창 6~9장, 마 24:37~39, 벧후 3:9) 메인 활동.

## 빠른 시작 (로컬 mock 모드)

```bash
npm install
npm run dev
```

브라우저 두 탭으로 동작 확인:
- TV 화면: <http://localhost:5173/>
- 모바일 화면: <http://localhost:5173/play?room=CODE> (호스트 화면의 QR 또는 코드 입력)

Supabase 키 없이도 BroadcastChannel로 같은 브라우저 내 탭 간 동작합니다. 현장 배포 전 데모/리허설용.

## Supabase 설정 (3줄)

1. <https://supabase.com> 무료 프로젝트 생성 (DB 테이블 만들 필요 없음 — Realtime broadcast만 사용).
2. Settings → API → `Project URL`과 `anon public` 키 복사.
3. 프로젝트 루트에 `.env.local` 생성:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

## 현장 운영 절차

1. 노트북에서 `npm run build && npm run preview` (또는 Vercel 정적 배포)로 호스트 화면을 띄우고 HDMI로 TV에 전체화면 송출.
2. TV 화면에 표시된 **4글자 방 코드**·**QR**·**교사 PIN(4자리)**을 학생들에게 안내. PIN은 교사만 보관.
3. 학생: 폰 카메라로 QR → 이름 입력 → 동물 선택(선점제) → 입장.
4. 교사: 같은 링크에서 [진행자(교사)] 탭 → PIN 입력 → [게임 시작] (2명 이상).
5. 학생 차례마다 폰을 흔들거나 [굴리기] 버튼. iOS는 처음에 모션 권한 허용 한 번 필요.
6. SHARE/MISSION 칸은 교사가 모바일에서 [성공]/[패스] 판정. EVENT 칸은 [확인]으로 진행. 25번(은혜) EVENT는 학생이 직접 대상 선택.
7. 첫 도착자가 나오면 자동으로 비 카운트다운 시작(D-7). 게임 늘어지면 교사 [비 내리기]/[D-1]로 가속.
8. 결과 화면 무지개 + 마무리 메시지(벧후 3:9)를 함께 읽고 마무리 멘트로 사용.

## 디렉터리 구조

```
src/data/        # 30칸 콘텐츠 + 동물 캐릭터 (PRD §6 SSOT, 임의 수정 금지)
src/logic/       # 순수 게임 로직 + *.test.ts
src/realtime/    # RealtimeAdapter (mock/supabase) + React 훅
src/screens/host # TV 화면 (Lobby, Board, QuizOverlay, CellOverlay, Results)
src/screens/play # 모바일 화면 (Entry, MyTurnDice, MyTurnInvite, ...)
```

## 개발

```bash
npm run dev          # Vite 개발 서버
npm test             # vitest 단위 테스트
npm run build        # 프로덕션 빌드 → dist/
```

## 알려진 한계 / 실기기 확인 필요

- [ ] iOS Safari DeviceMotion 권한 + 흔들기 감지
- [ ] Android Chrome Vibration API
- [ ] 실 Supabase 프로젝트 1회 연결 점검
- [ ] TV 4m 거리 가독성

자세한 운영 컨텍스트는 `PRD.md`, `Design.md`, `CLAUDE.md` 참고.
