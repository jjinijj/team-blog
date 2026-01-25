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
      <div className="max-w-3xl mx-auto p-5">
        <div className="flex justify-between items-center mb-5">
          <button 
            onClick={onGoToMain}
            className="bg-transparent border-none text-blue-600 cursor-pointer text-base hover:underline"
          >
            ← 뒤로가기
          </button>
        </div>
        <div className="text-center py-10 text-lg text-gray-600">
          글을 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-5">
      <div className="flex justify-between items-center mb-5">
        <button 
          onClick={onGoToMain}
          className="bg-transparent border-none text-blue-600 cursor-pointer text-base hover:underline"
        >
          ← 뒤로가기
        </button>
        <div className="flex gap-2.5">
          <button 
            onClick={() => onEdit(post.id)}
            className="px-4 py-2 bg-blue-600 text-white border-none rounded cursor-pointer hover:bg-blue-700"
          >
            수정
          </button>
          <button 
            onClick={() => onDelete(post.id)}
            className="px-4 py-2 bg-red-600 text-white border-none rounded cursor-pointer hover:bg-red-700"
          >
            삭제
          </button>
        </div>
      </div>

      <h1 className="text-4xl mb-2.5">{post.title}</h1>
      <div className="text-gray-600 mb-8 text-sm">{post.createdAt}</div>
      <div 
        className="leading-relaxed whitespace-pre-wrap"
        style={{
          fontSize: `${post.fontSize}px`,
          fontWeight: post.isBold ? 'bold' : 'normal',
          fontStyle: post.isItalic ? 'italic' : 'normal',
          textDecoration: post.isUnderline ? 'underline' : 'none',
          color: post.textColor,
        }}
      >
        {post.content}
      </div>
    </div>
  );
}

export default PostDetailScreen;