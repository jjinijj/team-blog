// ─────────────────────────────────────────────
//  Rich Text 타입 정의
// ─────────────────────────────────────────────

export type TextStyle = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;   // hex: "#ff0000" 또는 rgb: "rgb(255,0,0)"
  size?: number;    // px 단위: 16 → "16px"
};

export type TextNode = {
  text: string;
  style?: TextStyle;
};

export type ParagraphNode = {
  type: "paragraph";
  children: TextNode[];
};

export type DocumentNode = ParagraphNode[];

// ─────────────────────────────────────────────
//  유틸리티 함수
// ─────────────────────────────────────────────

/** style 객체가 실제로 스타일 값을 가지는지 확인 */
export const isEmptyStyle = (style: TextStyle): boolean =>
  !style.bold &&
  !style.italic &&
  !style.underline &&
  !style.color &&
  !style.size;

/** 두 TextStyle을 병합 (override가 우선) */
export const mergeStyles = (base: TextStyle, override: TextStyle): TextStyle => ({
  bold:      override.bold      ?? base.bold,
  italic:    override.italic    ?? base.italic,
  underline: override.underline ?? base.underline,
  color:     override.color     ?? base.color,
  size:      override.size      ?? base.size,
});

/** 빈 DocumentNode 생성 */
export const createEmptyDocument = (): DocumentNode => [
  { type: "paragraph", children: [{ text: "" }] }
];
