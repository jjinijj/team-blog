import { TextStyle } from "./richTextTypes";

// ─────────────────────────────────────────────
//  유틸리티
// ─────────────────────────────────────────────

const getTextNodesInRange = (range: Range): Text[] => {
  if (
    range.startContainer === range.endContainer &&
    range.startContainer.nodeType === Node.TEXT_NODE
  ) {
    return [range.startContainer as Text];
  }

  const nodes: Text[] = [];
  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT
  );
  let node = walker.nextNode() as Text | null;
  while (node) {
    if (range.intersectsNode(node)) nodes.push(node);
    node = walker.nextNode() as Text | null;
  }
  return nodes;
};

/** 해당 태그의 조상(또는 자기 자신) 찾기 */
const findTagAncestor = (
  node: Node,
  tagNames: string[],
  container: HTMLElement
): HTMLElement | null => {
  let cur: Node | null =
    node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
  while (cur && cur !== container) {
    if (
      cur.nodeType === Node.ELEMENT_NODE &&
      tagNames.includes((cur as HTMLElement).tagName.toLowerCase())
    )
      return cur as HTMLElement;
    cur = cur.parentNode;
  }
  return null;
};

const hasTagAncestor = (
  node: Node,
  tagNames: string[],
  container: HTMLElement
): boolean => findTagAncestor(node, tagNames, container) !== null;

/** fragment 안의 태그를 언래핑 (태그 제거, 내용 유지) */
const unwrapTagsInFragment = (
  root: DocumentFragment | HTMLElement,
  tagNames: string[]
): void => {
  tagNames.forEach((tag) => {
    Array.from(root.querySelectorAll(tag)).forEach((el) => {
      const parent = el.parentNode!;
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
    });
  });
};

/** 선택 영역을 엘리먼트로 감싸고 선택 복원 */
const wrapSelection = (
  range: Range,
  createElement: () => HTMLElement
): void => {
  const fragment = range.extractContents();
  const wrapper = createElement();
  wrapper.appendChild(fragment);
  range.insertNode(wrapper);

  const newRange = document.createRange();
  newRange.selectNodeContents(wrapper);
  window.getSelection()!.removeAllRanges();
  window.getSelection()!.addRange(newRange);
};

// ─────────────────────────────────────────────
//  스타일 제거 핵심 로직
//
//  올바른 순서:
//  1. 선택된 content 추출 (extractContents)
//  2. fragment에서 태그 언래핑
//  3. extractContents 이후 range가 ancestor 태그 안에 있는지 확인
//     - 있으면: ancestor 안의 남은 내용("after")을 따로 추출
//              unstyled fragment 삽입 → restyled "after" 삽입
//     - 없으면: 그냥 range.insertNode
//
//  예시:
//  <strong>Hel[lo]ld</strong>
//  → extractContents → fragment="lo", DOM=<strong>Helld</strong>
//                       range is inside <strong> at split point
//  → afterRange: split point ~ end of strong → extracts "ld"
//  → insert: "lo" after <strong>Hel</strong>
//  → insert: <strong>ld</strong> after "lo"
//  → 결과: <strong>Hel</strong>lo<strong>ld</strong>
// ─────────────────────────────────────────────
const removeStyle = (
  container: HTMLElement,
  range: Range,
  tagNames: string[]
): void => {
  const sel = window.getSelection()!;

  // ① 선택 내용 추출 + 태그 제거
  const fragment = range.extractContents();
  unwrapTagsInFragment(fragment, tagNames);

  // ② extractContents 후 range가 ancestor 안에 있는지 확인
  const ancestor = findTagAncestor(range.startContainer, tagNames, container);

  if (!ancestor || !ancestor.parentNode) {
    // ancestor 밖 → 그냥 삽입
    range.insertNode(fragment);
    sel.collapseToEnd();
    return;
  }

  const parent = ancestor.parentNode;

  // ③ ancestor 안의 남은 내용("after") 추출
  //    range.startContainer ~ ancestor의 끝
  //    주의: setEnd는 ancestor 밖이 아닌 inside로 (경계 교차 방지)
  const afterRange = document.createRange();
  afterRange.setStart(range.startContainer, range.startOffset);
  afterRange.setEnd(ancestor, ancestor.childNodes.length);
  const afterFragment = afterRange.extractContents();

  // ④ ancestor 바로 다음 위치에 삽입
  //    [ancestor (before만 남음)] [fragment (unstyled)] [new ancestor (after)]
  const insertBefore = ancestor.nextSibling;
  parent.insertBefore(fragment, insertBefore);

  if (afterFragment.textContent) {
    const newEl = document.createElement(
      ancestor.tagName.toLowerCase()
    ) as HTMLElement;
    newEl.appendChild(afterFragment);
    parent.insertBefore(newEl, insertBefore);
  }

  // ⑤ before가 비어있으면 ancestor 제거
  if (!ancestor.textContent) {
    parent.removeChild(ancestor);
  }

  sel.collapseToEnd();
};

// ─────────────────────────────────────────────
//  토글 공통 함수
// ─────────────────────────────────────────────
const toggleSemanticStyle = (
  container: HTMLElement,
  tagNames: string[],
  createElement: () => HTMLElement
): void => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

  const range = sel.getRangeAt(0);
  const textNodes = getTextNodesInRange(range);
  if (textNodes.length === 0) return;

  const isFullyStyled = textNodes.every((n) =>
    hasTagAncestor(n, tagNames, container)
  );

  if (isFullyStyled) {
    removeStyle(container, range, tagNames);
  } else {
    wrapSelection(range, createElement);
  }
};

// ─────────────────────────────────────────────
//  span 기반 스타일 (Color / FontSize)
// ─────────────────────────────────────────────
//  span 기반 스타일 적용 (Color / FontSize)
//
//  중첩 방지 알고리즘:
//  적용 전에 fragment 안의 기존 같은 속성을 먼저 제거
//
//  예: <span style="color:red">Hello</span> 선택 후 파란색 적용
//  ① extractContents → fragment: <span style="color:red">Hello</span>
//  ② removeStyleFromFragment("color") → fragment: Hello
//  ③ 새 span으로 감싸기 → <span style="color:blue">Hello</span>
// ─────────────────────────────────────────────

/** fragment 안의 span에서 특정 CSS 속성 제거 (빈 span이면 언래핑) */
const removeStyleFromFragment = (
  fragment: DocumentFragment,
  property: string
): void => {
  Array.from(fragment.querySelectorAll("span")).forEach((span) => {
    span.style.removeProperty(property);

    // 스타일이 완전히 비어있으면 span 자체를 언래핑
    if (!span.getAttribute("style") || span.style.cssText.trim() === "") {
      const parent = span.parentNode!;
      while (span.firstChild) parent.insertBefore(span.firstChild, span);
      parent.removeChild(span);
    }
  });
};

const applySpanStyle = (
  range: Range,
  property: "color" | "fontSize",
  value: string
): void => {
  const fragment = range.extractContents();

  // 기존 같은 속성 제거 (중첩 방지)
  removeStyleFromFragment(fragment, property);

  const span = document.createElement("span");
  span.style[property] = value;
  span.appendChild(fragment);
  range.insertNode(span);

  const newRange = document.createRange();
  newRange.selectNodeContents(span);
  window.getSelection()!.removeAllRanges();
  window.getSelection()!.addRange(newRange);
};

// ─────────────────────────────────────────────
//  현재 커서/선택 위치의 스타일 감지 (툴바 상태 업데이트용)
// ─────────────────────────────────────────────
export const getActiveStyles = (container: HTMLElement): TextStyle => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return {};

  const range = sel.getRangeAt(0);
  const startNode =
    range.startContainer.nodeType === Node.TEXT_NODE
      ? range.startContainer.parentNode!
      : range.startContainer;

  const style: TextStyle = {};
  let cur: Node | null = startNode;

  while (cur && cur !== container) {
    if (cur.nodeType === Node.ELEMENT_NODE) {
      const el = cur as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (!style.bold      && (tag === "strong" || tag === "b")) style.bold = true;
      if (!style.italic    && (tag === "em"     || tag === "i")) style.italic = true;
      if (!style.underline && tag === "u")                        style.underline = true;
      if (!style.color     && el.style.color)                    style.color = el.style.color;
      if (!style.size      && el.style.fontSize)
        style.size = parseInt(el.style.fontSize);
    }
    cur = cur.parentNode;
  }

  return style;
};

// ─────────────────────────────────────────────
//  공개 API
// ─────────────────────────────────────────────

export const toggleBold = (container: HTMLElement): void =>
  toggleSemanticStyle(container, ["strong", "b"], () =>
    document.createElement("strong")
  );

export const toggleItalic = (container: HTMLElement): void =>
  toggleSemanticStyle(container, ["em", "i"], () =>
    document.createElement("em")
  );

export const toggleUnderline = (container: HTMLElement): void =>
  toggleSemanticStyle(container, ["u"], () =>
    document.createElement("u")
  );

export const applyColor = (container: HTMLElement, color: string): void => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
  applySpanStyle(sel.getRangeAt(0), "color", color);
};

export const applyFontSize = (container: HTMLElement, size: number): void => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
  applySpanStyle(sel.getRangeAt(0), "fontSize", `${size}px`);
};