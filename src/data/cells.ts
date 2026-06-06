// PRD §6 — 게임 콘텐츠 SSOT. 글자 단위로 그대로 보존. 임의 수정 금지.
// 트랙: START(0) + 1~30칸 + ARK(31 취급). 이 파일은 1~30칸의 콘텐츠.

export type CellKind = "WORD" | "SHARE" | "MISSION" | "EVENT";

export interface WordCell {
  index: number;
  kind: "WORD";
  question: string;
  choices: readonly [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface ShareCell {
  index: number;
  kind: "SHARE";
  prompt: string;
}

export interface MissionCell {
  index: number;
  kind: "MISSION";
  prompt: string;
}

export type EventEffect =
  | { type: "moveBack"; steps: number }
  | { type: "moveForward"; steps: number }
  | { type: "tokenDelta"; delta: number }
  | { type: "skipTurn" }
  | { type: "advanceOther"; steps: number };

export interface EventCell {
  index: number;
  kind: "EVENT";
  name: string;
  effect: EventEffect;
  line: string;
}

export type Cell = WordCell | ShareCell | MissionCell | EventCell;

// ── 6.1 WORD (10칸): 1, 4, 6, 9, 13, 16, 18, 21, 24, 28 ──
const WORD_CELLS: readonly WordCell[] = [
  {
    index: 1,
    kind: "WORD",
    question: "노아 시대에 하나님이 오래 참으신 기간은?",
    choices: ["40년", "70년", "120년", "969년"],
    correctIndex: 2,
    explanation: "창 6:3 — 그들의 날은 일백 이십년이 되리라",
  },
  {
    index: 4,
    kind: "WORD",
    question: "므두셀라 이름의 뜻은?",
    choices: ["평안이 오리라", "그가 죽으면 오리라", "하나님이 기억하신다", "위로하리라"],
    correctIndex: 1,
    explanation: "므두셀라의 죽음 = 심판이 온다는 경고였다",
  },
  {
    index: 6,
    kind: "WORD",
    question: "노아 시대 사람들이 하던 일이 아닌 것은? (마 24:38)",
    choices: ["먹고 마시고", "장가 들고", "시집 가고", "회개하고"],
    correctIndex: 3,
    explanation: "일상은 죄가 아니다. 그 안에 하나님이 없던 것이 문제",
  },
  {
    index: 9,
    kind: "WORD",
    question: "홍수 심판 전에 미리 경고했고, 죽지 않고 승천한 사람은?",
    choices: ["에녹", "노아", "아담", "므두셀라"],
    correctIndex: 0,
    explanation: "에녹의 승천은 경고가 하나님께로부터 왔음을 확증했다",
  },
  {
    index: 13,
    kind: "WORD",
    question: "방주 문을 닫은 분은?",
    choices: ["노아", "셈", "천사", "여호와 하나님"],
    correctIndex: 3,
    explanation: "창 7:16 — 여호와께서 그를 닫아 넣으시니라",
  },
  {
    index: 16,
    kind: "WORD",
    question: "벧후 3:9 — 아무도 멸망치 않고 다 (___)하기에 이르기를 원하시느니라",
    choices: ["예배", "회개", "찬송", "봉사"],
    correctIndex: 1,
    explanation: "하나님이 오래 참으시는 이유",
  },
  {
    index: 18,
    kind: "WORD",
    question: "방주가 완성된 후 문이 닫히기까지 하나님이 기다리신 날수는?",
    choices: ["3일", "7일", "40일", "120일"],
    correctIndex: 1,
    explanation: "창 7:4,10 — 마지막 7일의 기회",
  },
  {
    index: 21,
    kind: "WORD",
    question: "요 9:4 — \"밤이 오리니 그때는 아무도 (___) 수 없느니라\"",
    choices: ["잠잘", "일할", "먹을", "들어갈"],
    correctIndex: 1,
    explanation: "지금은 아직 일할 수 있는 낮이다",
  },
  {
    index: 24,
    kind: "WORD",
    question: "음부의 부자가 아브라함에게 마지막까지 간절히 부탁한 것은? (눅 16:27~28)",
    choices: [
      "물 한 방울만 달라",
      "자기를 꺼내 달라",
      "형제들에게 나사로를 보내 전도하게 해달라",
      "재산을 돌려달라",
    ],
    correctIndex: 2,
    explanation: "부자가 정말 원한 것은 물이 아니라 형제들의 구원이었다",
  },
  {
    index: 28,
    kind: "WORD",
    question: "마 24장의 세상 끝날 징조가 아닌 것은?",
    choices: ["전쟁과 전쟁의 소문", "기근과 지진", "사랑이 식어짐", "온 세상이 평화로워짐"],
    correctIndex: 3,
    explanation: "마 24:6~12",
  },
];

// ── 6.2 SHARE (8칸): 3, 8, 11, 15, 19, 23, 27, 30 ──
const SHARE_CELLS: readonly ShareCell[] = [
  { index: 3, kind: "SHARE", prompt: "\"마지막 때\"라고 느꼈던 뉴스나 사건 하나 말하기" },
  { index: 8, kind: "SHARE", prompt: "내 일상에서 하나님께 가장 무관심해지는 시간대는 언제?" },
  { index: 11, kind: "SHARE", prompt: "노아처럼 120년 동안 비웃음 당하면서 순종할 수 있을까? 솔직하게" },
  { index: 15, kind: "SHARE", prompt: "내가 방주 밖 사람이었다면 노아의 말을 믿었을까? 이유는?" },
  { index: 19, kind: "SHARE", prompt: "복음을 전하고 싶은데 망설여지는 이유 하나 말하기" },
  { index: 23, kind: "SHARE", prompt: "하나님이 나에게 \"오래 참아주신\" 일 하나 나누기" },
  { index: 27, kind: "SHARE", prompt: "이번 주 나에게 \"낮(기회)\"인 순간은 언제일까?" },
  { index: 30, kind: "SHARE", prompt: "우리 반에서 같이 깨어 있고 싶은 사람은? 그 이유는?" },
];

// ── 6.3 MISSION (7칸): 2, 7, 12, 17, 22, 26, 29 ──
const MISSION_CELLS: readonly MissionCell[] = [
  { index: 2, kind: "MISSION", prompt: "30초 동안 \"노아의 망치질\" 동작을 실감나게 연기하기" },
  { index: 7, kind: "MISSION", prompt: "옆 사람에게 \"방주에 같이 타자!\" 진심으로 설득하기 (15초)" },
  { index: 12, kind: "MISSION", prompt: "동물 한 쌍 성대모사 → 누구인지 다른 사람이 맞히면 성공" },
  { index: 17, kind: "MISSION", prompt: "찬송 318장 \"예수가 우리를 부르는 소리\" 한 소절 부르기" },
  { index: 22, kind: "MISSION", prompt: "오른쪽 사람의 장점 1개 말해주고 하이파이브" },
  { index: 26, kind: "MISSION", prompt: "\"비가 온다!!\" 가장 실감나게 외치기" },
  { index: 29, kind: "MISSION", prompt: "벧후 3:9을 선창하여 다 같이 따라 읽게 하기" },
];

// ── 6.4 EVENT (5칸): 5, 10, 14, 20, 25 ──
const EVENT_CELLS: readonly EventCell[] = [
  {
    index: 5,
    kind: "EVENT",
    name: "비웃음",
    effect: { type: "moveBack", steps: 2 },
    line: "노아도 비웃음을 견뎠습니다.",
  },
  {
    index: 10,
    kind: "EVENT",
    name: "에녹의 경고",
    effect: { type: "tokenDelta", delta: 1 },
    line: "경고를 듣는 것이 은혜의 시작입니다.",
  },
  {
    index: 14,
    kind: "EVENT",
    name: "먹고 마시고",
    effect: { type: "skipTurn" },
    line: "일상 자체는 죄가 아닙니다. 그 안에 하나님이 없는 것이 문제입니다.",
  },
  {
    index: 20,
    kind: "EVENT",
    name: "동물들이 들어간다",
    effect: { type: "moveForward", steps: 3 },
    line: "동물들이 스스로 들어간 것은 마지막 회개의 기회였습니다.",
  },
  {
    index: 25,
    kind: "EVENT",
    name: "은혜",
    effect: { type: "advanceOther", steps: 1 },
    line: "유일하게 '남을 앞으로 보내는' 칸 — 이것이 전도입니다.",
  },
];

// 1~30 인덱스 정렬된 트랙
export const CELLS: readonly Cell[] = [
  ...WORD_CELLS,
  ...SHARE_CELLS,
  ...MISSION_CELLS,
  ...EVENT_CELLS,
]
  .slice()
  .sort((a, b) => a.index - b.index);

export const TRACK_LENGTH = 30;
export const ARK_INDEX = 31;
export const START_INDEX = 0;

// PRD §6.5 — 결과 화면 마무리 메시지 (고정)
export const FINAL_MESSAGE =
  "방주 문은 정확한 때에만 열렸습니다. 구원의 문이 열려 있는 지금 — 먼저 들어간 사람의 역할은 구경이 아니라 초청입니다. (벧후 3:9 — 아무도 멸망치 않고 다 회개하기에 이르기를 원하시느니라)";

export function getCell(index: number): Cell | undefined {
  return CELLS.find((c) => c.index === index);
}
