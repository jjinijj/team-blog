import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Post } from '../types/Post';
import { MarkdownRenderer } from '../utils/markdownRender';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RichTextRenderer } from '../utils/richTextRenderer';
import { safeParseDoc } from '../utils/safeParseDoc';
import CommentsSection from '../component/comments/CommentsSection';
import { getAbsoluteDay } from '../utils/DataFormat';
import { readPostById, recordView } from '../api/supabaseApi';

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

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await readPostById(id);
        setPost(data);
        if (user && data) {
          recordView(id, user.id, data.author_id);
        }
      } catch (e) {
        console.error(e);
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
            <button onClick={() => navigate('/blog')} className="flex items-center gap-4">
              <span className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
                <span className="material-symbols-outlined">arrow_back</span>
              </span>
              <span className="text-sm font-semibold">목록으로</span>
            </button>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-lg text-gray-400">불러오는 중...</p>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 lg:px-20">
          <div className="max-w-7xl mx-auto h-16 flex items-center">
            <button onClick={() => navigate('/blog')} className="flex items-center gap-4">
              <span className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
                <span className="material-symbols-outlined">arrow_back</span>
              </span>
              <span className="text-sm font-semibold">목록으로</span>
            </button>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-lg text-gray-500">글을 찾을 수 없습니다.</p>
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
          <button onClick={() => navigate('/blog')} className="flex items-center gap-4">
            <span className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
              <span className="material-symbols-outlined">arrow_back</span>
            </span>
            <span className="text-sm font-semibold">목록으로</span>
          </button>
          {post.author_id === user?.id && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onEdit(post.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
              >
                수정
              </button>
              <button
                onClick={() => onDelete(post.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </div>
          )}
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