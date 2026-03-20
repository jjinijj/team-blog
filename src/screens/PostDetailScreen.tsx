import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Post } from '../types/Post';
import { MarkdownRenderer } from '../utils/markdownRender';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RichTextRenderer } from '../utils/richTextRenderer';
import { safeParseDoc } from '../utils/safeParseDoc';
import CommentsSection from '../component/comments/CommentsSection';
import { getAbsoluteDay } from '../utils/DataFormat';
import { readPostById, recordView } from '../api/postApi';
import ProfileDropdown from '../component/Profiledropdown';

interface PostDetailScreenProps {
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
}

function resolveContentType(post: Post): 'markdown' | 'richtext' {
  if (post.content_type) return post.content_type;
  return post.isMarkdown ? 'markdown' : 'richtext';
}

const PostDetailScreen = ( {onEdit, onDelete }: PostDetailScreenProps) => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 복사 실패 시 무시
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await readPostById(id);
        setPost(data);
        if (user && data) {
          recordView(id, user.id, data.author_id);
        }
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 lg:px-20">
          <div className="max-w-7xl mx-auto h-16 flex items-center">
            <button onClick={() => navigate('/posts')} className="flex items-center gap-4">
              <span className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                <span className="material-symbols-outlined">arrow_back</span>
              </span>
              <span className="text-sm font-semibold">목록으로</span>
            </button>
          </div>
        </header>
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 lg:py-20 animate-pulse">
          {/* 날짜 + 뱃지 */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-4 w-24 bg-gray-200 rounded-full" />
            <div className="h-4 w-16 bg-gray-200 rounded-full" />
          </div>
          {/* 제목 */}
          <div className="space-y-3 mb-8">
            <div className="h-10 bg-gray-200 rounded-lg w-full" />
            <div className="h-10 bg-gray-200 rounded-lg w-3/4" />
          </div>
          {/* 작성자 + 통계 */}
          <div className="flex items-center justify-between py-6 border-y border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
              <div className="space-y-2">
                <div className="h-3.5 w-24 bg-gray-200 rounded-full" />
                <div className="h-3 w-16 bg-gray-200 rounded-full" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-3.5 w-12 bg-gray-200 rounded-full" />
              <div className="h-3.5 w-16 bg-gray-200 rounded-full" />
            </div>
          </div>
          {/* 본문 */}
          <div className="mt-10 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-4/5" />
            <div className="mt-6 h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 lg:px-20">
          <div className="max-w-7xl mx-auto h-16 flex items-center">
            <button onClick={() => navigate('/posts')} className="flex items-center gap-4">
              <span className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
                <span className="material-symbols-outlined">arrow_back</span>
              </span>
              <span className="text-sm font-semibold">목록으로</span>
            </button>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-lg text-gray-500">
            {error ? '글을 불러오지 못했습니다. 새로고침 해주세요.' : '글을 찾을 수 없습니다.'}
          </p>
        </main>
      </div>
    );
  }

  const contentType = resolveContentType(post);
  const doc = safeParseDoc(post);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 lg:px-20">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          <button onClick={() => navigate('/posts')} className="flex items-center gap-4">
            <span className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
              <span className="material-symbols-outlined">arrow_back</span>
            </span>
            <span className="text-sm font-semibold">목록으로</span>
          </button>
          <div className="flex items-center gap-1">
            {/* 북마크 버튼 */}
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100">
              <span className="material-symbols-outlined">bookmark</span>
            </button>

            {/* 공유 버튼 */}
            <button
              onClick={handleShare}
              className={`p-2 transition-colors rounded-lg hover:bg-slate-100 ${copied ? 'text-green-500' : 'text-slate-400 hover:text-slate-600'}`}
              title={copied ? '링크가 복사되었습니다!' : '링크 복사'}
            >
              <span className="material-symbols-outlined">{copied ? 'check' : 'share'}</span>
            </button>

            {/* 더보기 드롭다운 (본인 글만) */}
            {post.author_id === user?.id && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(prev => !prev)}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
                >
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50">
                    <button
                      onClick={() => { setMenuOpen(false); onEdit(post.id); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      수정
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); onDelete(post.id); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      삭제
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 구분선 + 프로필 드롭다운 */}
            {user && (
              <>
                <div className="h-6 w-px bg-slate-200 mx-2" />
                <ProfileDropdown />
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
        {/* Post Header */}
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-gray-500 text-sm">{getAbsoluteDay(post.created_at)}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              contentType === 'markdown'
                ? 'bg-purple-100 text-purple-600'
                : 'bg-blue-100 text-blue-600'
            }`}>
              {contentType === 'markdown' ? 'Markdown' : 'Rich Text'}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-8 tracking-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between py-6 border-y border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: post.author_color ?? '#3b82f6' }}
              >
                {(post.author_name ?? post.author_email ?? 'U')[0].toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">
                  {post.author_name ?? post.author_email ?? 'Unknown'}
                </span>
                <span className="text-xs text-gray-500">
                  {getAbsoluteDay(post.created_at)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-gray-500 text-sm">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>{post.view_count.toLocaleString()}</span>
              </span>
              <span className="flex items-center gap-1">
                <span>📖</span>
                <span>{Math.ceil(post.content.length / 1000)} min read</span>
              </span>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-slate prose-lg max-w-none mb-16 prose-h1:text-4xl prose-h2:text-2xl prose-p:text-base [&_code]:before:content-none [&_code]:after:content-none">
          {contentType === 'markdown' && (
            <MarkdownRenderer markdown={post.content} />
          )}
          {contentType === 'richtext' && doc && (
            <RichTextRenderer doc={doc} />
          )}
          {contentType === 'richtext' && !doc && (
            <p className="text-gray-400 italic">지원되지 않는 이전 형식의 글입니다. (마이그레이션 필요)</p>
          )}
        </article>

        {/* Comments */}
        <CommentsSection postId={post.id} />
      </main>
    </div>
  );
};

export default PostDetailScreen;