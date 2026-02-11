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

// ─────────────────────────────────────────────
//  range 경계 확장
//
//  문제:
//  extractContents()는 range의 경계(startContainer / endContainer)를
//  기준으로 내용을 잘라낸다.
//  경계가 텍스트 노드 안에 있으면 부모 태그는 잘려나가지 않고
//  빈 껍데기로 DOM에 남는다.
//
//  예시:
//  <span style="color:red">Hello</span> 전체 선택 후 Bold 적용
//  range.startContainer = 텍스트 노드 "Hello" (span 안)
//  range.endContainer   = 텍스트 노드 "Hello" (span 안)
//  → extractContents: fragment="Hello"(텍스트만), DOM=<span style="color:red"></span>(빈 껍데기)
//  → 결과: <span style="color:red"></span><strong>Hello</strong> (색상 사라짐)
//
//  해결:
//  extractContents 전에 range 경계를 부모 요소 바깥으로 확장
//  - 시작점이 텍스트 노드의 맨 앞(offset=0)이면 → setStartBefore(부모)
//  - 끝점이 텍스트 노드의 맨 끝(offset=length)이면 → setEndAfter(부모)
//
//  결과:
//  range가 span 자체를 포함하게 되어 span 통째로 fragment에 추출
//  → <strong><span style="color:red">Hello</span></strong> (색상 유지)
// ─────────────────────────────────────────────
const expandRangeBoundaries = (
  range: Range,
  container: HTMLElement
): void => {
  // 시작점: 텍스트 노드의 맨 앞이면 부모 요소 앞으로 확장
  if (
    range.startContainer.nodeType === Node.TEXT_NODE &&
    range.startOffset === 0
  ) {
    const parent = range.startContainer.parentNode as HTMLElement;
    if (
      parent &&
      parent !== container &&
      parent.nodeType === Node.ELEMENT_NODE
    ) {
      range.setStartBefore(parent);
    }
  }

  // 끝점: 텍스트 노드의 맨 끝이면 부모 요소 뒤로 확장
  if (
    range.endContainer.nodeType === Node.TEXT_NODE &&
    range.endOffset === (range.endContainer as Text).length
  ) {
    const parent = range.endContainer.parentNode as HTMLElement;
    if (
      parent &&
      parent !== container &&
      parent.nodeType === Node.ELEMENT_NODE
    ) {
      range.setEndAfter(parent);
    }
  }
};

/** 선택 영역을 엘리먼트로 감싸고 선택 복원 */
const wrapSelection = (
  range: Range,
  container: HTMLElement,
  createElement: () => HTMLElement
): void => {
  // extractContents 전에 range 확장 (빈 껍데기 방지)
  expandRangeBoundaries(range, container);

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
    range.insertNode(fragment);
    sel.collapseToEnd();
    return;
  }

  const parent = ancestor.parentNode;

  // ③ ancestor 안의 남은 내용("after") 추출
  const afterRange = document.createRange();
  afterRange.setStart(range.startContainer, range.startOffset);
  afterRange.setEnd(ancestor, ancestor.childNodes.length);
  const afterFragment = afterRange.extractContents();

  // ④ ancestor 바로 다음 위치에 삽입
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
    wrapSelection(range, container, createElement);
  }
};

// ─────────────────────────────────────────────
//  span 기반 스타일 (Color / FontSize)
// ─────────────────────────────────────────────

/** fragment 안의 span에서 특정 CSS 속성 제거 (빈 span이면 언래핑) */
const removeStyleFromFragment = (
  fragment: DocumentFragment,
  property: string
): void => {
  Array.from(fragment.querySelectorAll("span")).forEach((span) => {
    span.style.removeProperty(property);

    if (!span.getAttribute("style") || span.style.cssText.trim() === "") {
      const parent = span.parentNode!;
      while (span.firstChild) parent.insertBefore(span.firstChild, span);
      parent.removeChild(span);
    }
  });
};

const applySpanStyle = (
  range: Range,
  container: HTMLElement,
  property: "color" | "fontSize",
  value: string
): void => {
  // extractContents 전에 range 확장 (빈 껍데기 방지)
  expandRangeBoundaries(range, container);

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
  applySpanStyle(sel.getRangeAt(0), container, "color", color);
};

export const applyFontSize = (container: HTMLElement, size: number): void => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
  applySpanStyle(sel.getRangeAt(0), container, "fontSize", `${size}px`);
};