import {
  DocumentNode,
  ParagraphNode,
  TextNode,
  TextStyle,
  isEmptyStyle,
  mergeStyles,
  createEmptyDocument,
} from "./richTextTypes";

// ─────────────────────────────────────────────
//  HTML → DocumentNode
//  contentEditable의 innerHTML을 파싱해서
//  DocumentNode[] 구조로 변환
// ─────────────────────────────────────────────

/** HTML 엘리먼트에서 TextStyle 추출 */
const extractStyleFromElement = (el: HTMLElement): TextStyle => {
  const style: TextStyle = {};
  const tag = el.tagName.toLowerCase();

  // 시맨틱 태그로 스타일 확인
  if (tag === "strong" || tag === "b") style.bold = true;
  if (tag === "em"     || tag === "i") style.italic = true;
  if (tag === "u")                     style.underline = true;

  // inline style로 스타일 확인
  const inlineStyle = el.style;
  if (inlineStyle.fontWeight === "bold" || parseInt(inlineStyle.fontWeight) >= 700)
    style.bold = true;
  if (inlineStyle.fontStyle === "italic")
    style.italic = true;
  if (inlineStyle.textDecoration.includes("underline"))
    style.underline = true;
  if (inlineStyle.color)
    style.color = inlineStyle.color;
  if (inlineStyle.fontSize) {
    const size = parseInt(inlineStyle.fontSize);
    if (!isNaN(size)) style.size = size;
  }

  return style;
};

/**
 * DOM 노드를 재귀 탐색하여 TextNode[] 반환
 * inheritedStyle: 부모로부터 상속된 스타일 (중첩 태그 처리)
 *
 * 예: <strong><em>text</em></strong>
 *  → inheritedStyle: { bold: true }로 em을 탐색
 *  → 최종: { text: "text", style: { bold: true, italic: true } }
 */
const parseInlineNodes = (
  node: Node,
  inheritedStyle: TextStyle = {}
): TextNode[] => {
  const result: TextNode[] = [];

  node.childNodes.forEach((child) => {
    // 텍스트 노드
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent ?? "";
      if (text === "") return;

      result.push({
        text,
        style: isEmptyStyle(inheritedStyle) ? undefined : { ...inheritedStyle },
      });
    }
    // 엘리먼트 노드
    else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;

      // <br> → 줄바꿈
      if (el.tagName === "BR") {
        result.push({ text: "\n" });
        return;
      }

      // 현재 엘리먼트의 스타일 + 부모 스타일 병합
      const elStyle = extractStyleFromElement(el);
      const merged = mergeStyles(inheritedStyle, elStyle);

      // 자식 노드 재귀 탐색
      result.push(...parseInlineNodes(el, merged));
    }
  });

  return result;
};

/** 블록 레벨 태그 목록 */
const BLOCK_TAGS = new Set(["div", "p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "section", "article"]);

/**
 * contentEditable 컨테이너의 innerHTML → DocumentNode[]
 *
 * contentEditable 구조 예시:
 * <div>첫번째 줄</div>
 * <div><strong>두번째</strong> 줄</div>
 */
export const parseHTMLToDocument = (container: HTMLElement): DocumentNode => {
  const paragraphs: ParagraphNode[] = [];

  // 블록 자식 노드가 있는지 확인
  const hasBlockChildren = Array.from(container.childNodes).some((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      return BLOCK_TAGS.has((node as HTMLElement).tagName.toLowerCase());
    }
    return false;
  });

  if (hasBlockChildren) {
    // 블록 단위로 ParagraphNode 생성
    container.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        if (BLOCK_TAGS.has(el.tagName.toLowerCase())) {
          const children = parseInlineNodes(el);
          paragraphs.push({
            type: "paragraph",
            children: children.length > 0 ? children : [{ text: "" }],
          });
        }
      } else if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent ?? "";
        if (text.trim()) {
          paragraphs.push({
            type: "paragraph",
            children: [{ text }],
          });
        }
      }
    });
  } else {
    // 블록 없음 → 전체를 하나의 paragraph로
    const children = parseInlineNodes(container);
    if (children.length > 0) {
      paragraphs.push({ type: "paragraph", children });
    }
  }

  return paragraphs.length > 0 ? paragraphs : createEmptyDocument();
};

// ─────────────────────────────────────────────
//  DocumentNode → HTML
//  contentEditable에 로드할 때 사용
//  저장된 JSON을 에디터에 다시 표시
// ─────────────────────────────────────────────

/** HTML 특수문자 이스케이프 */
const escapeHTML = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** TextNode 하나를 HTML 문자열로 변환 */
const textNodeToHTML = (node: TextNode): string => {
  let html = escapeHTML(node.text);
  const style = node.style;

  if (!style || isEmptyStyle(style)) return html;

  // inline style 조합 (color, size)
  const inlineStyles: string[] = [];
  if (style.color) inlineStyles.push(`color:${style.color}`);
  if (style.size)  inlineStyles.push(`font-size:${style.size}px`);

  // 시맨틱 태그로 감싸기 (안쪽부터)
  if (style.underline) html = `<u>${html}</u>`;
  if (style.italic)    html = `<em>${html}</em>`;
  if (style.bold)      html = `<strong>${html}</strong>`;

  // span으로 color/size 적용
  if (inlineStyles.length > 0) {
    html = `<span style="${inlineStyles.join(";")}">${html}</span>`;
  }

  return html;
};

/** DocumentNode → HTML 문자열 (contentEditable 로드용) */
export const documentToHTML = (doc: DocumentNode): string =>
  doc
    .map((paragraph) => {
      const inner = paragraph.children.map(textNodeToHTML).join("");
      return `<div>${inner || "<br>"}</div>`;
    })
    .join("");

// ─────────────────────────────────────────────
//  Supabase 저장/불러오기
// ─────────────────────────────────────────────

/** DocumentNode → JSON 문자열 (DB 저장용) */
export const serializeDocument = (doc: DocumentNode): string =>
  JSON.stringify(doc);

/** JSON 문자열 → DocumentNode (DB에서 불러올 때) */
export const deserializeDocument = (json: string): DocumentNode => {
  try {
    const parsed = JSON.parse(json);
    // 유효성 검사: array이고 paragraph 타입인지
    if (Array.isArray(parsed) && parsed.every((p) => p.type === "paragraph")) {
      return parsed as DocumentNode;
    }
    return createEmptyDocument();
  } catch {
    return createEmptyDocument();
  }
};
