import React from "react";
import { DocumentNode, TextNode } from "./richTextTypes";

// ─────────────────────────────────────────────
//  DocumentNode → React 컴포넌트
//  PostDetailScreen에서 저장된 JSON을 렌더링할 때 사용
// ─────────────────────────────────────────────

/** TextNode 하나를 렌더링 */
const RenderTextNode = ({ node }: { node: TextNode }) => {
  // 스타일 없으면 그냥 텍스트
  if (!node.style) return <>{node.text}</>;

  const { bold, italic, underline, color, size } = node.style;
  const hasStyle = bold || italic || underline || color || size;
  if (!hasStyle) return <>{node.text}</>;

  const inlineStyle: React.CSSProperties = {
    color:          color    ?? undefined,
    fontSize:       size     ? `${size}px` : undefined,
  };

  // 시맨틱 태그로 감싸기 (중첩 순서: bold → italic → underline)
  // inline style은 가장 바깥 span에 적용
  let content: React.ReactNode = node.text;

  if (underline) content = <u>{content}</u>;
  if (italic)    content = <em>{content}</em>;
  if (bold)      content = <strong>{content}</strong>;

  // color나 size가 있으면 span으로 감싸기
  if (color || size) {
    content = <span style={inlineStyle}>{content}</span>;
  }

  return <>{content}</>;
};

/** DocumentNode 전체를 렌더링 */
export const RichTextRenderer = ({ doc }: { doc: DocumentNode }) => (
  <div className="rich-text-content">
    {doc.map((paragraph, i) => {
      const isEmpty =
        paragraph.children.length === 0 ||
        (paragraph.children.length === 1 && paragraph.children[0].text === "");

      return (
        <p key={i} className="mb-4 leading-relaxed">
          {isEmpty ? (
            <br />
          ) : (
            paragraph.children.map((node, j) => (
              <RenderTextNode key={j} node={node} />
            ))
          )}
        </p>
      );
    })}
  </div>
);
