// 게임 상태 SSOT 타입. 호스트가 유일 권위자(state authoritative).
// 컨트롤러는 action만 보내고 호스트가 처리 후 state를 broadcast.

export type Phase = "lobby" | "playing" | "rain" | "ended";

export interface Player {
  id: string;
  name: string;
  animalId: string;
  position: number; // 0 = START, 1..30 = 트랙, 31 = ARK
  tokens: number;
  arrived: boolean;
  arrivalRank: number | null; // 도착 순서 (1, 2, 3...). 미도착이면 null
  pendingSkip: boolean; // event 14 한 턴 쉬기
}

export interface QuizState {
  cellIndex: number;
  // 정답 멈춘 플레이어(자리 유지+토큰+1) / 오답 무응답(1칸 뒤로) / 타인 정답(토큰+1, 이동 없음)
  stoppedPlayerId: string;
  deadlineMs: number; // 마감 시각 (Date.now() 기준)
  answers: Record<string, number>; // playerId → choiceIndex (0..3)
  closed: boolean;
}

export interface ActiveCell {
  index: number;
  triggeredByPlayerId: string;
  // 멈춘 플레이어의 콘텐츠 처리(SHARE/MISSION 판정 대기, EVENT 자동 처리 후 [확인] 대기 등)
  awaitingJudge: boolean; // SHARE/MISSION 교사 판정 대기
  awaitingConfirm: boolean; // EVENT 처리 후 [확인] 대기
  // EVENT 25(은혜) 대상 선택 대기
  awaitingGraceTarget: boolean;
}

export interface CountdownState {
  active: boolean;
  daysLeft: number; // 시작 시 7, 1일=1바퀴마다 -1, 0 도달 시 종료
}

export interface GameState {
  seq: number; // 단조 증가. 컨트롤러는 더 큰 seq만 수용.
  phase: Phase;
  roomCode: string;
  teacherPin: string;
  players: Player[]; // 입장 순서 고정. 로테이션 = 이 배열 순회.
  currentTurnIdx: number; // players[] 인덱스
  roundsCompleted: number; // 한 바퀴 완료 횟수 (비 카운트다운에 사용)
  countdown: CountdownState;
  activeCell: ActiveCell | null;
  quiz: QuizState | null;
  lastDiceRoll: number | null; // 직전 주사위 결과 (UI 표시용)
}
