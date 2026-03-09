import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Post } from '../types/Post';
import { useAuth } from '../contexts/AuthContext';
import { DocumentNode } from "../utils/richTextTypes";
import { useDraft } from '../hooks/useDraft';
import { DraftRecoveryBanner } from '../component/DraftRecoveryBanner';
import ProfileDropdown from '../component/Profiledropdown';

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
  const [markdownContent, setMarkdownContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'private'>(
    postToEdit?.status ?? 'published'
  );
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

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

  // ── 저장 ──────────────────────────────────────
  const handlePublish = () => {
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
      onAddPost(title, markdownContent, 'markdown', null, status);
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
          <textarea
            className="w-full min-h-[500px] border-none focus:ring-0 focus:outline-none bg-transparent leading-relaxed placeholder:text-gray-300 p-0 resize-none font-mono text-sm"
            placeholder="이야기를 들려주세요... (마크다운 지원)"
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
          />
        </div>
      </main>
    </div>
  );
};

export default EditorScreen;
