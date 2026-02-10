import { useState, useEffect, useRef, useCallback } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Post } from '../types/Post';
import { useAuth } from '../contexts/AuthContext';
import {
  DocumentNode,
  createEmptyDocument,
} from "../utils/richTextTypes";
import {
  parseHTMLToDocument,
  documentToHTML,
  serializeDocument,
  deserializeDocument,
} from "../utils/richTextParser";
import {
  getActiveStyles,
  toggleBold,
  toggleItalic,
  toggleUnderline,
  applyColor,
  applyFontSize,
} from "../utils/richTextStyler";
import { TextStyle } from "../utils/richTextTypes";

interface EditorScreenProps {
  onGoToMain: () => void;
  onAddPost: (
    title: string,
    content: string,
    isMarkdown: boolean,
  ) => void;
  onUpdatePost?: (
    postId: string,
    title: string,
    content: string,
    isMarkdown: boolean,
  ) => void;
  posts?: Post[];
  editingPost?: Post;
}

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32];

export const EditorScreen = ({
  onGoToMain,
  onAddPost,
  onUpdatePost,
  posts,
  editingPost
}: EditorScreenProps) => {
  const { id } = useParams<{ id: string }>();
  const postToEdit = id && posts ? posts.find(post => post.id === id) : editingPost;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editorMode, setEditorMode] = useState<'markdown' | 'richtext'>('richtext');
  const [markdownContent, setMarkdownContent] = useState("");

 // 툴바 활성 상태 (현재 커서/선택 위치의 스타일)
  const [activeStyles, setActiveStyles] = useState<TextStyle>({});
  const [activeFontSize, setActiveFontSize] = useState(16);

  // 리치텍스트 에디터 ref
  const editorRef = useRef<HTMLDivElement>(null);
  // color picker 클릭 시 contentEditable selection이 사라지므로
  // focus 이전 selection을 저장해두었다가 복원
  const savedRangeRef = useRef<Range | null>(null);
  
  const {user, loading} = useAuth();
  const navigate = useNavigate();

  useEffect(()=>{
    if(loading){
      return;
    }

    if(!user){
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if(postToEdit && user){
      if(postToEdit.author_id !== user.id){
        alert('본인이 작성한 글만 수정할 수 있습니다.');
        navigate('/');
      }
    }
  }, [user, loading, postToEdit, navigate]);

  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title);
      setContent(postToEdit.content);
      if (postToEdit.isMarkdown) {
      setEditorMode("markdown");
      setMarkdownContent(postToEdit.content);
    } else {
      setEditorMode("richtext");
      // JSON → HTML → contentEditable
      if (editorRef.current) {
        const doc = deserializeDocument(postToEdit.content);
        editorRef.current.innerHTML = documentToHTML(doc);
      }
    }
  // postToEdit이 바뀔 때만 실행 (editorRef는 초기 마운트 이후 안정적)
  // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [postToEdit?.id]);

  // ── 선택 변경 감지 → 툴바 상태 업데이트 ────────
  useEffect(() => {
    const handleSelectionChange = () => {
      if (editorMode !== "richtext" || !editorRef.current) return;

      const styles = getActiveStyles(editorRef.current);
      setActiveStyles(styles);
      if (styles.size) setActiveFontSize(styles.size);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [editorMode]);

// 리치텍스트 에디터 입력 변경
  const handleEditorInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  // ── 툴바 핸들러 ───────────────────────────────
  // useCallback으로 감싸는 이유:
  // 툴바 버튼 클릭 시 contentEditable의 포커스가 잠깐 해제될 수 있음
  // editorRef.current.focus()로 포커스를 복원하고 스타일 적용

  const handleBold = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    toggleBold(editorRef.current);
  }, []);

  const handleItalic = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    toggleItalic(editorRef.current);
  }, []);

  const handleUnderline = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    toggleUnderline(editorRef.current);
  }, []);

  // color picker가 열릴 때 selection 저장
  // (color picker 클릭 시 contentEditable focus가 해제되어 selection이 사라지기 때문)
  const handleColorPickerFocus = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  // onChange: 드래그 중에도 실시간 반영
  // removeStyleFromFragment가 중첩을 막아주므로 onChange 사용 가능
  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editorRef.current || !savedRangeRef.current) return;

    // 저장된 selection 복원 (매번 복원해야 함)
    const sel = window.getSelection();
    const restoredRange = savedRangeRef.current.cloneRange();
    sel?.removeAllRanges();
    sel?.addRange(restoredRange);

    applyColor(editorRef.current, e.target.value);

    // 적용 후 selection 다시 저장 (applySpanStyle이 selection을 바꾸므로)
    const newSel = window.getSelection();
    if (newSel && newSel.rangeCount > 0) {
      savedRangeRef.current = newSel.getRangeAt(0).cloneRange();
    }
  }, []);

  const handleFontSize = useCallback((size: number) => {
    if (!editorRef.current || !savedRangeRef.current) return;

    // 저장된 selection 복원 (select 클릭 시 selection이 사라지기 때문)
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(savedRangeRef.current);

    setActiveFontSize(size);
    applyFontSize(editorRef.current, size);
    savedRangeRef.current = null;
  }, []);

  const handlePublish = () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
    } else if (!content.trim()) {
      alert('내용을 입력해주세요.');
    } else {

      let finalContent = "";
      const isMarkdown = editorMode === 'markdown' ? true : false;
      if (isMarkdown) {
      finalContent = markdownContent;
    } else {
      if (!editorRef.current) return;
      // contentEditable HTML → DocumentNode → JSON 문자열
      const doc: DocumentNode = parseHTMLToDocument(editorRef.current);
      finalContent = serializeDocument(doc);
    }

    if (!finalContent.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    if (postToEdit && onUpdatePost) {
      onUpdatePost(postToEdit.id, title, finalContent, isMarkdown);
    } else {
      onAddPost(title, finalContent, isMarkdown);
    }
    }
  };

  if(loading){
    return(
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  //  로딩 중일때는 아무것도 렌더링 안함(깜박임 방지)
  if(!user){
    return null;
  }

  //  권한 없을 시 아무것도 렌더링 안함
  if(postToEdit && postToEdit.author_id !== user.id){
    return null;
  }

  const isMarkdownMode = editorMode === "markdown";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onGoToMain}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          >
            <span>←</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs">
              📝
            </div>
            <span className="text-sm font-semibold">
              {postToEdit ? '글 수정' : '새 글 작성'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onGoToMain}
            className="px-4 h-9 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handlePublish}
            className="px-5 h-9 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            {postToEdit ? '수정' : '등록'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[740px] mx-auto px-8 py-12">
            {/* Toolbar */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm mb-8 py-2 border-b border-gray-100 flex items-center gap-1">
              {/* Bold */}
            <button
              onMouseDown={(e) => { e.preventDefault(); handleBold(); }}
              disabled={isMarkdownMode}
              title="굵게 (선택 후 클릭)"
              className={`w-8 h-8 rounded text-sm font-bold transition-colors
                ${isMarkdownMode
                  ? "opacity-30 cursor-not-allowed text-gray-400"
                  : activeStyles.bold
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-100 text-gray-700"}`}
            >
              B
            </button>

            {/* Italic */}
            <button
              onMouseDown={(e) => { e.preventDefault(); handleItalic(); }}
              disabled={isMarkdownMode}
              title="기울임 (선택 후 클릭)"
              className={`w-8 h-8 rounded text-sm italic transition-colors
                ${isMarkdownMode
                  ? "opacity-30 cursor-not-allowed text-gray-400"
                  : activeStyles.italic
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-100 text-gray-700"}`}
            >
              I
            </button>

            {/* Underline */}
            <button
              onMouseDown={(e) => { e.preventDefault(); handleUnderline(); }}
              disabled={isMarkdownMode}
              title="밑줄 (선택 후 클릭)"
              className={`w-8 h-8 rounded text-sm underline transition-colors
                ${isMarkdownMode
                  ? "opacity-30 cursor-not-allowed text-gray-400"
                  : activeStyles.underline
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-100 text-gray-700"}`}
            >
              U
            </button>

            <div className="w-px h-4 bg-gray-200 mx-1" />

            {/* Font Size */}
            <select
              value={activeFontSize}
              onMouseDown={() => {
                // select 클릭 시 selection이 사라지기 전에 저장
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0) {
                  savedRangeRef.current = sel.getRangeAt(0).cloneRange();
                }
              }}
              onChange={(e) => handleFontSize(Number(e.target.value))}
              disabled={isMarkdownMode}
              className={`text-xs px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-400 focus:outline-none
                ${isMarkdownMode ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              {FONT_SIZES.map((size) => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>

            <div className="w-px h-4 bg-gray-200 mx-1" />

            {/* Color */}
            <div className="flex items-center gap-1.5">
              <span className={`text-xs text-gray-500 ${isMarkdownMode ? "opacity-30" : ""}`}>
                색상
              </span>
              <input
                type="color"
                defaultValue="#000000"
                onFocus={handleColorPickerFocus}
                onChange={handleColorChange}
                disabled={isMarkdownMode}
                title="글자 색상 (선택 후 클릭)"
                className={`w-7 h-7 rounded border border-gray-200 cursor-pointer p-0.5
                  ${isMarkdownMode ? "opacity-30 cursor-not-allowed" : ""}`}
              />
            </div>
              {/* Markdown/Rich Text Toggle */}
              <div className="ml-auto flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                  {/* 항상 공간 차지, 마크다운 모드일 때만 보임 */}
                  <button
                    onClick={() => window.open('https://github.com/jjinijj/team-blog/blob/develop/docs/MARKDOWN_GUIDE.md', '_blank')}
                    className={`p-1 transition-colors text-gray-400 hover:text-blue-600
                    }`}
                    title="마크다운 사용법 보기"
                    disabled={editorMode !== 'markdown'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => setEditorMode('markdown')}
                    className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded transition-colors ${
                      editorMode === 'markdown'
                        ? 'text-blue-500 bg-white shadow-sm border border-gray-200'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Markdown
                  </button>
                  
                  <button
                    onClick={() => setEditorMode('richtext')}
                    className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded transition-colors ${
                      editorMode === 'richtext'
                        ? 'text-blue-500 bg-white shadow-sm border border-gray-200'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Rich Text
                  </button>
                </div>
              </div>
            </div>
            {/* Content */}
            <div className="space-y-6">
              <input
                type="text"
                className="w-full text-5xl font-bold border-none focus:ring-0 focus:outline-none placeholder:text-gray-200 bg-transparent resize-none"
                placeholder="제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              
              <div className="flex items-center gap-3 py-2 border-y border-gray-50">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  A
                </div>
                <span className="text-sm font-medium text-gray-500">
                  작성자 <span className="text-gray-900">
                    {user?.email || 'Unknown'}
                  </span>
                </span>
              </div>
              
              {/* Editor */}
              <div className="editor-content prose prose-slate max-w-none">
                {editorMode === 'markdown' ? (
                  <textarea
                    className="w-full min-h-[500px] border-none focus:ring-0 focus:outline-none bg-transparent leading-relaxed placeholder:text-gray-300 p-0 resize-none"
                    placeholder="이야기를 들려주세요..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style= {undefined}  // 마크다운 모드일 때는 스타일 적용 안 함
                />
                ) 
                : (
                  <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="이야기를 들려주세요..."
              className="w-full min-h-[500px] border-none focus:ring-0 focus:outline-none bg-transparent text-gray-800 leading-relaxed
                empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:pointer-events-none"
              style={{ whiteSpace: "pre-wrap" }}
            />
                )}
                
                
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default EditorScreen;