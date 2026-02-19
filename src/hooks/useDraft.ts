import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DraftData,
  getDraftKey,
  saveDraft as saveDraftToStorage,
  loadDraft,
  clearDraft as clearDraftFromStorage,
  clearExpiredDrafts,
} from '../utils/draftUtils';

const DEBOUNCE_MS = 1500;

interface UseDraftReturn {
  saveDraft: (data: Omit<DraftData, 'savedAt'>) => void; // debounce 포함
  clearDraft: () => void;                                 // 발행/취소 시 호출
  hasDraft: boolean;                                      // 복원 배너 표시 여부
  draftData: DraftData | null;                            // 복원할 데이터
  dismissDraft: () => void;                               // 배너만 숨김, draft는 유지
}

export const useDraft = (postId?: string): UseDraftReturn => {
  const key = getDraftKey(postId);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [draftData, setDraftData] = useState<DraftData | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  // ── 마운트 시: 만료 정리 + draft 존재 여부 확인 ──
  useEffect(() => {
    clearExpiredDrafts();

    const saved = loadDraft(key);
    if (saved) {
      setDraftData(saved);
      setHasDraft(true);
    }

    // 언마운트 시 debounce 타이머 정리
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [key]);

  // ── debounce 저장 ─────────────────────────────────
  const saveDraft = useCallback(
    (data: Omit<DraftData, 'savedAt'>) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(() => {
        const draftWithTimestamp: DraftData = {
          ...data,
          savedAt: new Date().toISOString(),
        };
        saveDraftToStorage(key, draftWithTimestamp);
      }, DEBOUNCE_MS);
    },
    [key],
  );

  // ── 발행/취소 시 완전 삭제 ────────────────────────
  const clearDraft = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    clearDraftFromStorage(key);
    setDraftData(null);
    setHasDraft(false);
  }, [key]);

  // ── "무시" 클릭 시 배너만 숨김 ───────────────────
  const dismissDraft = useCallback(() => {
    setHasDraft(false);
  }, []);

  return { saveDraft, clearDraft, hasDraft, draftData, dismissDraft };
};