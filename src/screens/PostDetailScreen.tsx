import { useParams } from 'react-router-dom';
import { Post } from '../types/Post';

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
              <span className="text-sm font-medium">Back to Feed</span>
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
            <span className="text-sm font-medium">Back to Feed</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => onEdit(post.id)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(post.id)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Delete
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
        <article className="prose prose-slate prose-lg max-w-none mb-16">
          <div
            className="text-lg leading-relaxed"
            style={{
              fontSize: `${post.fontSize}px`,
              fontWeight: post.isBold ? 'bold' : 'normal',
              fontStyle: post.isItalic ? 'italic' : 'normal',
              textDecoration: post.isUnderline ? 'underline' : 'none',
              color: post.textColor,
              whiteSpace: 'pre-wrap',
            }}
          >
            {post.content}
          </div>
        </article>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-12 mb-8">
          <div className="flex items-center justify-center gap-4">
            <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              👍 Helpful
            </button>
            <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              ❤️ Love it
            </button>
            <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              💡 Insightful
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 py-8">
          <button
            onClick={() => onEdit(post.id)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            <span>✏️</span>
            <span>Edit Post</span>
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            <span>🗑️</span>
            <span>Delete Post</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default PostDetailScreen;