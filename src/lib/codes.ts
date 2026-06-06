// 룸 코드: 4자리 대문자 알파벳 (I, O, 0, 1 등 혼동 글자 제외)
const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateRoomCode(rng: () => number = Math.random): string {
  let s = "";
  for (let i = 0; i < 4; i++) {
    s += ROOM_CODE_CHARS[Math.floor(rng() * ROOM_CODE_CHARS.length)];
  }
  return s;
}

// 교사 PIN: 4자리 숫자
export function generatePin(rng: () => number = Math.random): string {
  return String(Math.floor(1000 + rng() * 9000));
}

export function generatePlayerId(rng: () => number = Math.random): string {
  return Math.floor(rng() * 0xffffffff).toString(16).padStart(8, "0");
}
