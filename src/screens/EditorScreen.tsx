import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Post } from '../types/Post';
import { useAuth } from '../contexts/AuthContext';
import { DocumentNode } from "../utils/richTextTypes";
import { useDraft } from '../hooks/useDraft';
import { DraftRecoveryBanner } from '../component/DraftRecoveryBanner';
import ProfileDropdown from '../component/Profiledropdown';
import { uploadPostImage, linkImagesToPost } from '../api/imageApi';
import { readPostById } from '../api/postApi';
import { ROUTES } from '../types/routes';

interface EditorScreenProps {
  onGoToMain: () => void;
  onAddPost: (
    title: string,
    content: string,
    contentType: 'richtext' | 'markdown',
    contentJson: DocumentNode | null,
    status: 'draft' | 'published' | 'private',
  ) => Promise<string | null>;
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

export const EditorScreen = ({
  onGoToMain,
  onAddPost,
  onUpdatePost,
  posts,
  editingPost
}: EditorScreenProps) => {
  const { id } = useParams<{ id: string }>();
  const [fetchedPost, setFetchedPost] = useState<Post | null>(null);
  const postToEdit = id
    ? (posts?.find(post => post.id === id) ?? fetchedPost)
    : editingPost;

  const [title, setTitle] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'private'>(
    postToEdit?.status ?? 'published'
  );
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageIds, setUploadedImageIds] = useState<string[]>([]);

  const { user, displayName, avatarColor } = useAuth();
  const navigate = useNavigate();

  // ── 임시저장 ───────────────────────────────────
  const { saveDraft, clearDraft, hasDraft, draftData, dismissDraft } = useDraft(postToEdit?.id);

  // ── edit 모드: posts prop에 없으면 직접 조회 ──
  useEffect(() => {
    if (!id || posts?.find(post => post.id === id)) return;
    readPostById(id).then(setFetchedPost).catch(() => navigate(ROUTES.POSTS));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 작성자 체크 (본인 글만 수정 가능) ──────────────
  useEffect(() => {
    if (!user || !postToEdit) return;
    if (postToEdit.author_id !== user.id) {
      alert('본인이 작성한 글만 수정할 수 있습니다.');
      navigate(ROUTES.HOME);
    }
  }, [user, postToEdit, navigate]);

  // ── 수정 모드 초기 데이터 로드 ──────────────────
  useEffect(() => {
    if (!postToEdit) return;
    setTitle(postToEdit.title);
    setMarkdownContent(postToEdit.content);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postToEdit?.id]);

  // ── draft 복원 핸들러 ──────────────────────────
  const handleRestoreDraft = useCallback(() => {
    if (!draftData) return;
    setTitle(draftData.title);
    setMarkdownContent(draftData.content);
    clearDraft();
  }, [draftData, clearDraft]);

  // ── auto-save: title 변경 감지 ────────────────
  useEffect(() => {
    saveDraft({
      title,
      content: markdownContent,
      content_json: null,
      content_type: 'markdown',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  // ── auto-save: markdown 변경 감지 ────────────
  useEffect(() => {
    saveDraft({
      title,
      content: markdownContent,
      content_json: null,
      content_type: 'markdown',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdownContent]);

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

  // ── wrap selection ────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    if (selectionStart === selectionEnd) return;

    const WRAP_MAP: Record<string, [string, string]> = {
      '*': ['*', '*'],
      '`': ['`', '`'],
      '~': ['~~', '~~'],
      '_': ['__', '__'],
    };

    const wrap = WRAP_MAP[e.key];
    if (!wrap) return;

    e.preventDefault();
    const [open, close] = wrap;
    const before = markdownContent.slice(0, selectionStart);
    const selected = markdownContent.slice(selectionStart, selectionEnd);
    const after = markdownContent.slice(selectionEnd);
    const newContent = before + open + selected + close + after;
    setMarkdownContent(newContent);

    requestAnimationFrame(() => {
      textarea.selectionStart = selectionStart + open.length;
      textarea.selectionEnd = selectionEnd + open.length;
    });
  }, [markdownContent]);

  // ── 툴바 액션 ─────────────────────────────────
  const applyInlineWrap = useCallback((open: string, close: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd } = textarea;
    const selected = markdownContent.slice(selectionStart, selectionEnd);
    const before = markdownContent.slice(0, selectionStart);
    const after = markdownContent.slice(selectionEnd);
    const newContent = before + open + selected + close + after;
    setMarkdownContent(newContent);
    requestAnimationFrame(() => {
      textarea.focus();
      if (selected) {
        textarea.selectionStart = selectionStart + open.length;
        textarea.selectionEnd = selectionEnd + open.length;
      } else {
        textarea.selectionStart = selectionStart + open.length;
        textarea.selectionEnd = selectionStart + open.length;
      }
    });
  }, [markdownContent]);

  const applyLinePrefix = useCallback((prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart } = textarea;
    const lineStart = markdownContent.lastIndexOf('\n', selectionStart - 1) + 1;
    const lineHasPrefix = markdownContent.slice(lineStart).startsWith(prefix);
    let newContent: string;
    let offset: number;
    if (lineHasPrefix) {
      newContent = markdownContent.slice(0, lineStart) + markdownContent.slice(lineStart + prefix.length);
      offset = -prefix.length;
    } else {
      newContent = markdownContent.slice(0, lineStart) + prefix + markdownContent.slice(lineStart);
      offset = prefix.length;
    }
    setMarkdownContent(newContent);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = selectionStart + offset;
      textarea.selectionEnd = selectionStart + offset;
    });
  }, [markdownContent]);

  const applyLink = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const url = window.prompt('링크 URL을 입력하세요', 'https://');
    if (!url) return;
    const { selectionStart, selectionEnd } = textarea;
    const selected = markdownContent.slice(selectionStart, selectionEnd) || '링크 텍스트';
    const insert = `[${selected}](${url})`;
    const newContent = markdownContent.slice(0, selectionStart) + insert + markdownContent.slice(selectionEnd);
    setMarkdownContent(newContent);
    requestAnimationFrame(() => textarea.focus());
  }, [markdownContent]);

  const applyCodeBlock = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd } = textarea;
    const selected = markdownContent.slice(selectionStart, selectionEnd);
    if (selected) {
      applyInlineWrap('`', '`');
    } else {
      const atLineStart = selectionStart === 0 || markdownContent[selectionStart - 1] === '\n';
      const prefix = atLineStart ? '' : '\n';
      const insert = prefix + '```\n\n```\n';
      const newContent = markdownContent.slice(0, selectionStart) + insert + markdownContent.slice(selectionEnd);
      setMarkdownContent(newContent);
      const cursorPos = selectionStart + prefix.length + 4;
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.selectionStart = cursorPos;
        textarea.selectionEnd = cursorPos;
      });
    }
  }, [markdownContent, applyInlineWrap]);

  // ── 이미지 업로드 ──────────────────────────────
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    e.target.value = '';

    const placeholderId = Math.random().toString(36).slice(2);
    const placeholder = `![⠋ 이미지 업로드 중...](uploading:${placeholderId})`;
    const insertPos = textareaRef.current?.selectionStart ?? 0;

    // 커서 위치에 플레이스홀더 즉시 삽입
    setMarkdownContent((prev) => prev.slice(0, insertPos) + placeholder + prev.slice(insertPos));

    setIsUploading(true);
    try {
      const { url, imageId } = await uploadPostImage(file, user.id);

      if (postToEdit?.id) {
        await linkImagesToPost([imageId], postToEdit.id);
      } else {
        setUploadedImageIds((prev) => [...prev, imageId]);
      }

      // 플레이스홀더를 실제 이미지 마크다운으로 교체
      setMarkdownContent((prev) => prev.replace(placeholder, `![이미지](${url})`));
      requestAnimationFrame(() => textareaRef.current?.focus());
    } catch (err) {
      // 실패 시 플레이스홀더 제거
      setMarkdownContent((prev) => prev.replace(placeholder, ''));
      alert('이미지 업로드에 실패했습니다.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  }, [user, postToEdit?.id]);

  // ── 저장 ──────────────────────────────────────
  const handlePublish = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!markdownContent.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    if (postToEdit && onUpdatePost) {
      onUpdatePost(postToEdit.id, title, markdownContent, 'markdown', null, status);
    } else {
      const newPostId = await onAddPost(title, markdownContent, 'markdown', null, status);
      if (newPostId && uploadedImageIds.length > 0) {
        linkImagesToPost(uploadedImageIds, newPostId).catch(console.error);
      }
    }

    clearDraft();
  };


  if (!user) return null;
  if (postToEdit && postToEdit.author_id !== user.id) return null;

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
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark shrink-0 px-4 lg:px-20">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
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
                    className="w-full h-8 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors"
                  >
                    {postToEdit ? '수정 완료' : '등록'}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className='h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1'/>
          <ProfileDropdown/>
        </div>
        </div>
      </header>

      {/* 임시저장 복원 배너 */}
      <DraftRecoveryBanner
        draftData={draftData}
        visible={hasDraft && !!draftData}
        onRestore={handleRestoreDraft}
        onDismiss={dismissDraft}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[740px] mx-auto px-8 py-12">
          {/* 툴바 */}
          <div className="sticky top-0 z-10 bg-white/95 dark:bg-background-dark/95 backdrop-blur-sm mb-8 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1">
            {(() => {
              const btnClass = "p-2 rounded transition-colors text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200";
              return (
                <>
                  <button onClick={() => applyInlineWrap('**', '**')} title="Bold" className={btnClass}>
                    <span className="material-symbols-outlined text-[20px]">format_bold</span>
                  </button>
                  <button onClick={() => applyInlineWrap('*', '*')} title="Italic" className={btnClass}>
                    <span className="material-symbols-outlined text-[20px]">format_italic</span>
                  </button>
                  <button onClick={applyLink} title="Link" className={btnClass}>
                    <span className="material-symbols-outlined text-[20px]">link</span>
                  </button>
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-2" />
                  <button onClick={() => applyLinePrefix('# ')} title="Heading 1" className={btnClass}>
                    <span className="material-symbols-outlined text-[20px]">format_h1</span>
                  </button>
                  <button onClick={() => applyLinePrefix('## ')} title="Heading 2" className={btnClass}>
                    <span className="material-symbols-outlined text-[20px]">format_h2</span>
                  </button>
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-2" />
                  <button onClick={() => applyLinePrefix('> ')} title="Quote" className={btnClass}>
                    <span className="material-symbols-outlined text-[20px]">format_quote</span>
                  </button>
                  <button onClick={applyCodeBlock} title="Code Block" className={btnClass}>
                    <span className="material-symbols-outlined text-[20px]">code</span>
                  </button>
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploading}
                    title="이미지 업로드"
                    className={`p-2 rounded transition-colors text-slate-500 dark:text-slate-400 ${isUploading ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isUploading ? 'hourglass_empty' : 'image'}
                    </span>
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </>
              );
            })()}
            <div className="ml-auto flex items-center gap-4 px-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Markdown Supported</span>
              <button
                onClick={() => window.open('https://github.com/jjinijj/team-blog/blob/main/docs/MARKDOWN_GUIDE.md', '_blank')}
                className="flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-600 hover:underline uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-[14px]">help</span>
                Guide
              </button>
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
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: avatarColor }}>
              {(displayName || user.email)?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="text-sm font-medium text-gray-500">
              작성자 <span className="text-gray-900">{displayName || user.email || 'Unknown'}</span>
            </span>
          </div>

          {/* 본문 */}
          <textarea
            ref={textareaRef}
            className="w-full min-h-[500px] border-none focus:ring-0 focus:outline-none bg-transparent leading-relaxed placeholder:text-gray-300 p-0 resize-none font-mono text-sm"
            placeholder="이야기를 들려주세요... (마크다운 지원)"
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </main>
    </div>
  );
};

export default EditorScreen;
