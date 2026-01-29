import { useParams } from 'react-router-dom';
import { Post } from '../types/Post';
import { MarkdownRenderer } from '../utils/markdownRender';

interface PostDetailScreenProps {
  posts: Post[];
  onGoToMain: () => void;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
}

function PostDetailScreen({ posts, onGoToMain, onEdit, onDelete }: PostDetailScreenProps) {
  const { id } = useParams<{ id: string }>();
  const post = posts.find(p => p.id === id);

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center">
            <button
              onClick={onGoToMain}
              className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <span>←</span>
              <span className="text-sm font-medium">목록으로</span>
            </button>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-lg text-gray-500">글을 찾을 수 없습니다.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={onGoToMain}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <span>←</span>
            <span className="text-sm font-medium">목록으로</span>
          </button>
          
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
        {/* Post Header */}
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-gray-500 text-sm">{post.createdAt}</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-8 tracking-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between py-6 border-y border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">Author</span>
                <span className="text-xs text-gray-500">Team Member</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>📖</span>
              <span>
                {Math.ceil(post.content.length / 1000)} min read
              </span>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article 
        className="
          prose prose-slate prose-lg max-w-none mb-16
          prose-h1:text-4xl
          prose-h2:text-2xl
          prose-p:text-base
        ">
          < MarkdownRenderer markdown={post.content} />
        </article>
        {/* Comments Section */}
        <section className="border-t border-gray-100 pt-12 pb-24">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">댓글 (0)</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>정렬:</span>
              <button className="font-medium text-gray-900 flex items-center">
                최신순 <span className="ml-1">▼</span>
              </button>
            </div>
          </div>

          {/* Comment Input */}
          <div className="flex gap-4 mb-10">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
              A
            </div>
            <div className="flex-1">
              <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="댓글을 입력하세요..."
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button className="bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
                  댓글 작성
                </button>
              </div>
            </div>
          </div>

          {/* No Comments Yet */}
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default PostDetailScreen;