import { DocumentNode } from './richTextTypes';

export interface DraftData {
  title: string;
  content: string;
  content_json: DocumentNode | null;
  content_type: 'richtext' | 'markdown';
  savedAt: string; // ISO timestamp
}

const DRAFT_PREFIX = 'draft:';
const DRAFT_MAX_AGE_DAYS = 7;

// ── Key 생성 ──────────────────────────────────────────
export const getDraftKey = (postId?: string): string => {
  return postId ? `${DRAFT_PREFIX}post:${postId}` : `${DRAFT_PREFIX}new`;
};

// ── 저장 ──────────────────────────────────────────────
export const saveDraft = (key: string, data: DraftData): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('임시저장 실패:', e);
  }
};

// ── 불러오기 ──────────────────────────────────────────
export const loadDraft = (key: string): DraftData | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as DraftData;
  } catch (e) {
    console.warn('임시저장 불러오기 실패:', e);
    return null;
  }
};

// ── 삭제 ──────────────────────────────────────────────
export const clearDraft = (key: string): void => {
  localStorage.removeItem(key);
};

// ── 만료된 draft 자동 정리 (7일 이상) ────────────────
export const clearExpiredDrafts = (maxAgeDays: number = DRAFT_MAX_AGE_DAYS): void => {
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

  Object.keys(localStorage)
    .filter((key) => key.startsWith(DRAFT_PREFIX))
    .forEach((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const data = JSON.parse(raw) as DraftData;
        if (new Date(data.savedAt).getTime() < cutoff) {
          localStorage.removeItem(key);
        }
      } catch {
        // 파싱 실패한 항목도 정리
        localStorage.removeItem(key);
      }
    });
};