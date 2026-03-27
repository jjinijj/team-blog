# 임시저장 (Auto-save) 기능 설계 문서

## 📋 개요

**목적**: 에디터 작성 중 실수로 창이 닫히거나 브라우저가 종료될 때 작성 내용 손실 방지

**범위**:
- ✅ Auto-save (localStorage 기반 crash recovery)
- ❌ 초안 Draft status (별개 기능 — `posts.status = 'draft'`, Supabase DB 저장)

---

## 1. 개념 분리: Auto-save vs Draft status

| 항목 | Auto-save (이번 작업) | Draft status (추후 작업) |
|------|----------------------|------------------------|
| **목적** | 실수로 창 닫힘 방지 | 의도적으로 보관하는 미완성 글 |
| **저장 위치** | localStorage | Supabase DB |
| **수명** | 발행/저장 완료 시 즉시 삭제 | 직접 삭제하거나 발행할 때까지 영구 보존 |
| **타입** | `DraftData` (로컬 전용) | 기존 `Post` + `status` 필드 |

### 둘의 관계

Auto-save는 **초안(Draft) 글을 편집할 때도 동작**합니다.
`DraftData`는 "에디터에서 편집 중인 내용의 임시 백업"이고,
Draft status는 "이 글의 공개 상태"라서 개념 자체가 다릅니다.

```
초안(DB)을 수정하다가 창을 닫음
  → auto-save가 localStorage에 백업
  → 다음에 다시 열면 복원 배너 표시
```

---

## 2. 데이터 구조

### localStorage Key 구조

```typescript
"draft:new"                              // 새 글 작성 중
"draft:post:{uuid}"                      // 기존 글 수정 중
```

### DraftData 타입

```typescript
interface DraftData {
  title: string;
  content: string;                        // 마크다운 원문 (에디터는 markdown 전용, richtext 레거시 하위호환 유지)
  content_json: DocumentNode | null;      // richtext 레거시 전용
  content_type: 'richtext' | 'markdown';
  uploadedImageIds?: string[];            // 저장 전 업로드된 이미지 UUID 목록 (linkImagesToPost 복원용)
  savedAt: string;                        // ISO timestamp — "3시간 전 임시저장" 표시용 (7일 만료 기준)
}
```

---

## 3. 파일 구조

```
src/
├── utils/
│   └── draftUtils.ts           # 저장/불러오기/삭제 순수 함수
├── hooks/
│   └── useDraft.ts             # EditorScreen에서 사용할 커스텀 훅
└── components/
    └── DraftRecoveryBanner.tsx  # 복원 안내 UI 컴포넌트
```

---

## 4. 저장 타이밍: debounce

30초 인터벌 대신 **debounce(1500ms)** 사용

```
타이핑 중 → 타이핑 중 → 타이핑 중 → 멈춤
                                      ↓ (1.5초 후)
                                   localStorage 저장
```

**debounce 선택 이유**:
- 타이핑 중간에 저장 안 함 → 불필요한 I/O 없음
- 멈추면 바로 저장 → 인터벌보다 빠른 반응
- 구현 단순

---

## 5. useDraft 훅 인터페이스

```typescript
const {
  saveDraft,      // debounce 포함, onChange 시 호출
  clearDraft,     // 발행/취소 시 호출
  hasDraft,       // 복원 배너 표시 여부
  draftData,      // 복원할 데이터
  dismissDraft,   // "무시" 선택 시 (배너만 숨김)
} = useDraft(postId);  // postId 없으면 "new"
```

---

## 6. 복원 UI: 배너 방식

모달 대신 배너 — 덜 방해적, 선택지 명확

```
┌───────────────────────────────────────────────────────────┐
│ 💾 3시간 전 작성하던 내용이 있어요.   [이어서 작성] [무시] │
└───────────────────────────────────────────────────────────┘
[제목 입력창]
[본문 에디터]
```

---

## 7. 전체 흐름

```
EditorScreen 진입
  ↓
useDraft.hasDraft?
  ├── YES → DraftRecoveryBanner 표시
  │          ├── "이어서 작성" → draftData로 폼 채우기 + clearDraft
  │          └── "무시"       → dismissDraft (배너만 숨김, draft는 유지)
  └── NO  → 빈 폼 (또는 기존 글 데이터)

타이핑 시작
  → onChange → debounce(1500ms) → saveDraft()

발행/수정 완료
  → clearDraft()

오래된 draft 자동 정리
  → EditorScreen 진입 시 savedAt 기준 7일 이상 된 것 삭제
```

---

## 8. draftUtils.ts 주요 함수

```typescript
// 저장
saveDraft(key: string, data: DraftData): void

// 불러오기
loadDraft(key: string): DraftData | null

// 삭제
clearDraft(key: string): void

// 오래된 draft 정리
clearExpiredDrafts(maxAgeDays: number): void

// key 생성 헬퍼
getDraftKey(postId?: string): string
// → postId 없으면 "draft:new"
// → 있으면 "draft:post:{postId}"
```

---

## 9. 구현 순서 ✅ 완료

| 단계 | 작업 | 상태 |
|------|------|------|
| 1 | `DraftData` 타입 정의 | ✅ |
| 2 | `draftUtils.ts` 순수 함수 구현 | ✅ |
| 3 | `useDraft.ts` 커스텀 훅 구현 | ✅ |
| 4 | `DraftRecoveryBanner.tsx` UI 컴포넌트 | ✅ |
| 5 | `EditorScreen`에 통합 | ✅ |
| 6 | `uploadedImageIds` 복원 지원 추가 | ✅ |

---

## 10. 테스트 시나리오

- [x] 새 글 작성 중 → 창 닫기 → 재진입 → 배너 표시 → 이어서 작성
- [x] 기존 글 수정 중 → 창 닫기 → 재진입 → 배너 표시 → 이어서 작성
- [x] 발행 완료 → draft 삭제 확인
- [x] "무시" 클릭 → 배너만 숨겨지고 draft는 유지
- [x] 7일 이상 된 draft → 자동 삭제 확인
- [x] 이미지 포함 글 임시저장 → 복원 후 저장 시 `linkImagesToPost` 정상 동작

---

**문서 작성일**: 2026-02-18
**최종 업데이트**: 2026-03-27
**버전**: 1.1.0 (구현 완료, uploadedImageIds 추가)
