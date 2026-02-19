import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Post } from '../types/Post';
import { useAuth } from '../contexts/AuthContext';
import { DocumentNode } from "../utils/richTextTypes";
import {
  parseHTMLToDocument,
  documentToHTML,
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
import { useDraft } from '../hooks/useDraft';
import { DraftRecoveryBanner } from '../component/DraftRecoveryBanner';

interface EditorScreenProps {
  onGoToMain: () => void;
  onAddPost: (
    title: string,
    content: string,
    contentType: 'richtext' | 'markdown',
    contentJson: DocumentNode | null,
    status: 'draft' | 'published' | 'private',
  ) => void;
  onUpdatePost?: (
    postId: string,
    title: string,
    content: string,
    contentType: 'richtext' | 'markdown',
    contentJson: DocumentNode | null,
    status: 'draft' | 'published' | 'private',
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
  const [editorMode, setEditorMode] = useState<'markdown' | 'richtext'>('richtext');
  const [markdownContent, setMarkdownContent] = useState('');
  const [activeStyles, setActiveStyles] = useState<TextStyle>({});
  const [activeFontSize, setActiveFontSize] = useState(16);
  const [status, setStatus] = useState<'draft' | 'published' | 'private'>(
    postToEdit?.status ?? 'published'
  );
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // ── 임시저장 ───────────────────────────────────
  const { saveDraft, clearDraft, hasDraft, draftData, dismissDraft } = useDraft(postToEdit?.id);

  // ── 권한 체크 ──────────────────────────────────
  useEffect(() => {
    if (loading) return;
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    if (postToEdit && postToEdit.author_id !== user.id) {
      alert('본인이 작성한 글만 수정할 수 있습니다.');
      navigate('/');
    }
  }, [user, loading, postToEdit, navigate]);

  // ── 수정 모드 초기 데이터 로드 ──────────────────
  useEffect(() => {
    if (!postToEdit) return;
    setTitle(postToEdit.title);

    if (postToEdit.isMarkdown || postToEdit.content_type === 'markdown') {
      setEditorMode('markdown');
      setMarkdownContent(postToEdit.content);
    } else {
      setEditorMode('richtext');
      if (editorRef.current) {
        if (postToEdit.content_json) {
          const doc = deserializeDocument(JSON.stringify(postToEdit.content_json));
          editorRef.current.innerHTML = documentToHTML(doc);
        } else {
          editorRef.current.innerHTML = postToEdit.content;
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postToEdit?.id]);

  // ── draft 복원 핸들러 ──────────────────────────
  const handleRestoreDraft = useCallback(() => {
    if (!draftData) return;

    setTitle(draftData.title);
    setEditorMode(draftData.content_type);

    if (draftData.content_type === 'markdown') {
      setMarkdownContent(draftData.content);
    } else {
      if (editorRef.current) {
        // content_json이 있으면 JSON → HTML, 없으면 content(HTML) 직접 사용
        if (draftData.content_json) {
          const doc = deserializeDocument(JSON.stringify(draftData.content_json));
          editorRef.current.innerHTML = documentToHTML(doc);
        } else {
          editorRef.current.innerHTML = draftData.content;
        }
      }
    }

    clearDraft(); // 복원 후 draft 삭제
  }, [draftData, clearDraft]);

  // ── 선택 변경 감지 → 툴바 상태 업데이트 ────────
  useEffect(() => {
    const handleSelectionChange = () => {
      if (editorMode !== 'richtext' || !editorRef.current) return;
      const styles = getActiveStyles(editorRef.current);
      setActiveStyles(styles);
      if (styles.size) setActiveFontSize(styles.size);
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [editorMode]);

  // ── auto-save: title 변경 감지 ────────────────
  useEffect(() => {
    saveDraft({
      title,
      content: editorMode === 'markdown'
        ? markdownContent
        : editorRef.current?.innerHTML ?? '',
      content_json: editorMode === 'richtext' && editorRef.current
        ? parseHTMLToDocument(editorRef.current)
        : null,
      content_type: editorMode,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  // ── auto-save: markdown 변경 감지 ────────────
  useEffect(() => {
    if (editorMode !== 'markdown') return;
    saveDraft({
      title,
      content: markdownContent,
      content_json: null,
      content_type: 'markdown',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdownContent]);

  // ── 툴바 핸들러 ───────────────────────────────
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

  const handleColorPickerFocus = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editorRef.current || !savedRangeRef.current) return;
    const sel = window.getSelection();
    const restoredRange = savedRangeRef.current.cloneRange();
    sel?.removeAllRanges();
    sel?.addRange(restoredRange);
    applyColor(editorRef.current, e.target.value);
    const newSel = window.getSelection();
    if (newSel && newSel.rangeCount > 0) {
      savedRangeRef.current = newSel.getRangeAt(0).cloneRange();
    }
  }, []);

  const handleFontSize = useCallback((size: number) => {
    if (!editorRef.current || !savedRangeRef.current) return;
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(savedRangeRef.current);
    setActiveFontSize(size);
    applyFontSize(editorRef.current, size);
    savedRangeRef.current = null;
  }, []);

  // ── richtext 변경 감지 → auto-save ────────────
  const handleRichTextInput = useCallback(() => {
    if (!editorRef.current) return;
    saveDraft({
      title,
      content: editorRef.current.innerHTML,
      content_json: parseHTMLToDocument(editorRef.current),
      content_type: 'richtext',
    });
  }, [saveDraft, title]);

  // ── 드롭다운 외부 클릭 시 닫기 ────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── 저장 ──────────────────────────────────────
  const handlePublish = () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    let content = '';
    let contentJson: DocumentNode | null = null;
    let contentType: 'richtext' | 'markdown';

    if (editorMode === 'markdown') {
      if (!markdownContent.trim()) {
        alert('내용을 입력해주세요.');
        return;
      }
      content = markdownContent;
      contentType = 'markdown';
      contentJson = null;
    } else {
      if (!editorRef.current || !editorRef.current.textContent?.trim()) {
        alert('내용을 입력해주세요.');
        return;
      }
      content = editorRef.current.innerHTML;
      contentType = 'richtext';
      contentJson = parseHTMLToDocument(editorRef.current);
    }

    if (postToEdit && onUpdatePost) {
      onUpdatePost(postToEdit.id, title, content, contentType, contentJson, status);
    } else {
      onAddPost(title, content, contentType, contentJson, status);
    }

    clearDraft();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!user) return null;
  if (postToEdit && postToEdit.author_id !== user.id) return null;

  const isMarkdownMode = editorMode === 'markdown';

  const STATUS_OPTIONS = [
    {
      value: 'draft' as const,
      label: '초안',
      description: '나만 볼 수 있어요',
      icon: 'edit_note',
    },
    {
      value: 'published' as const,
      label: '공개',
      description: '모든 팀원에게 공개',
      icon: 'public',
    },
    {
      value: 'private' as const,
      label: '비공개',
      description: '나만 볼 수 있어요',
      icon: 'lock',
    },
  ];

  const selectedOption = STATUS_OPTIONS.find((o) => o.value === status)!;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-background-dark">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onGoToMain} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="text-sm font-semibold">
            {postToEdit ? '글 수정' : '새 글 작성'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Status 드롭다운 */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setStatusDropdownOpen((prev) => !prev)}
              className="w-32 justify-between px-5 h-9 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <span>{selectedOption.label}</span>
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>

            {statusDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                {STATUS_OPTIONS.map((option) => {
                  const isSelected = status === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatus(option.value);
                        setStatusDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 flex items-center gap-3 text-sm transition-colors ${
                        isSelected
                          ? 'text-primary bg-primary/5 hover:bg-primary/10'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[20px] ${isSelected ? 'text-primary' : 'text-slate-400'}`}>
                        {option.icon}
                      </span>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-xs">{option.label}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-primary/70' : 'text-slate-500'}`}>
                          {option.description}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[16px] ml-auto text-primary">check</span>
                      )}
                    </button>
                  );
                })}

                {/* 구분선 + 등록 버튼 */}
                <div className="border-t border-slate-100 dark:border-slate-700 mt-2 pt-2 px-2">
                  <button
                    onClick={() => {
                      setStatusDropdownOpen(false);
                      handlePublish();
                    }}
                    className="w-full h-8 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    {postToEdit ? '수정 완료' : '등록'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 임시저장 복원 배너 - 공간 항상 확보 */}
      <DraftRecoveryBanner
        draftData={draftData}
        visible={hasDraft && !!draftData}
        onRestore={handleRestoreDraft}
        onDismiss={dismissDraft}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[740px] mx-auto px-8 py-12">

          {/* Toolbar */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm mb-8 py-2 border-b border-gray-100 flex items-center gap-1">
            <button
              onMouseDown={(e) => { e.preventDefault(); handleBold(); }}
              disabled={isMarkdownMode}
              className={`w-8 h-8 rounded text-sm font-bold transition-colors ${isMarkdownMode ? 'opacity-30 cursor-not-allowed text-gray-400' : activeStyles.bold ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
            >B</button>
            <button
              onMouseDown={(e) => { e.preventDefault(); handleItalic(); }}
              disabled={isMarkdownMode}
              className={`w-8 h-8 rounded text-sm italic transition-colors ${isMarkdownMode ? 'opacity-30 cursor-not-allowed text-gray-400' : activeStyles.italic ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
            >I</button>
            <button
              onMouseDown={(e) => { e.preventDefault(); handleUnderline(); }}
              disabled={isMarkdownMode}
              className={`w-8 h-8 rounded text-sm underline transition-colors ${isMarkdownMode ? 'opacity-30 cursor-not-allowed text-gray-400' : activeStyles.underline ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
            >U</button>

            <div className="w-px h-4 bg-gray-200 mx-1" />

            <select
              value={activeFontSize}
              onMouseDown={() => {
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0) {
                  savedRangeRef.current = sel.getRangeAt(0).cloneRange();
                }
              }}
              onChange={(e) => handleFontSize(Number(e.target.value))}
              disabled={isMarkdownMode}
              className={`text-xs px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-400 focus:outline-none ${isMarkdownMode ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              {FONT_SIZES.map((size) => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>

            <div className="w-px h-4 bg-gray-200 mx-1" />

            <div className="flex items-center gap-1.5">
              <span className={`text-xs text-gray-500 ${isMarkdownMode ? 'opacity-30' : ''}`}>색상</span>
              <input
                type="color"
                defaultValue="#000000"
                onFocus={handleColorPickerFocus}
                onChange={handleColorChange}
                disabled={isMarkdownMode}
                className={`w-7 h-7 rounded border border-gray-200 cursor-pointer p-0.5 ${isMarkdownMode ? 'opacity-30 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* 모드 토글 */}
            <div className="ml-auto flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
              <button
                onClick={() => setEditorMode('markdown')}
                className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded transition-colors ${editorMode === 'markdown' ? 'text-blue-500 bg-white shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
              >Markdown</button>
              <button
                onClick={() => setEditorMode('richtext')}
                className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded transition-colors ${editorMode === 'richtext' ? 'text-blue-500 bg-white shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
              >Rich Text</button>
            </div>
          </div>

          {/* 제목 */}
          <input
            type="text"
            className="w-full text-5xl font-bold border-none focus:ring-0 focus:outline-none placeholder:text-gray-200 bg-transparent mb-6"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex items-center gap-3 py-2 border-y border-gray-50 mb-6">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="text-sm font-medium text-gray-500">
              작성자 <span className="text-gray-900">{user.email || 'Unknown'}</span>
            </span>
          </div>

          {/* 본문 */}
          {isMarkdownMode ? (
            <textarea
              className="w-full min-h-[500px] border-none focus:ring-0 focus:outline-none bg-transparent leading-relaxed placeholder:text-gray-300 p-0 resize-none font-mono text-sm"
              placeholder="이야기를 들려주세요..."
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
            />
          ) : (
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="이야기를 들려주세요..."
              onInput={handleRichTextInput}
              className="w-full min-h-[500px] border-none focus:ring-0 focus:outline-none bg-transparent text-gray-800 leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:pointer-events-none"
              style={{ whiteSpace: 'pre-wrap' }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default EditorScreen;