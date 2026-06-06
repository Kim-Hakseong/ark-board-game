import type { GameState } from "./types";

const HOST_KEY = (roomCode: string) => `ark:host:${roomCode}`;
const HOST_ACTIVE_ROOM_KEY = "ark:host:active";
const CONTROLLER_KEY = "ark:controller";

export interface HostActiveRoom {
  roomCode: string;
  teacherPin: string;
}

export interface ControllerProfile {
  roomCode: string;
  playerId: string;
  playerToken: string;
  name: string;
  animalId: string;
  isTeacher?: boolean;
}

function safeStorage(): Storage | null {
  try {
    if (typeof localStorage !== "undefined") return localStorage;
  } catch {
    // SSR or 차단된 환경
  }
  return null;
}

export function saveHostState(state: GameState): void {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(HOST_KEY(state.roomCode), JSON.stringify(state));
  } catch {
    // QuotaExceeded 등 — 무시 (다음 액션에서 재시도)
  }
}

export function loadHostState(roomCode: string): GameState | null {
  const storage = safeStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(HOST_KEY(roomCode));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.roomCode !== roomCode) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearHostState(roomCode: string): void {
  safeStorage()?.removeItem(HOST_KEY(roomCode));
}

export function saveHostActiveRoom(room: HostActiveRoom): void {
  safeStorage()?.setItem(HOST_ACTIVE_ROOM_KEY, JSON.stringify(room));
}

export function loadHostActiveRoom(): HostActiveRoom | null {
  const storage = safeStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(HOST_ACTIVE_ROOM_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as HostActiveRoom;
  } catch {
    return null;
  }
}

export function clearHostActiveRoom(): void {
  safeStorage()?.removeItem(HOST_ACTIVE_ROOM_KEY);
}

export function saveControllerProfile(profile: ControllerProfile): void {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(CONTROLLER_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

export function loadControllerProfile(): ControllerProfile | null {
  const storage = safeStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(CONTROLLER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ControllerProfile;
  } catch {
    return null;
  }
}

export function clearControllerProfile(): void {
  safeStorage()?.removeItem(CONTROLLER_KEY);
}
