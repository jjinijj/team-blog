import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Post } from '../types/Post';
import { useAuth } from '../contexts/AuthContext';

interface EditorScreenProps {
  onGoToMain: () => void;
  onAddPost: (
    title: string,
    content: string,
    fontSize: number,
    isBold: boolean,
    isItalic: boolean,
    isUnderline: boolean,
    textColor: string,
    isMarkdown: boolean,
  ) => void;
  onUpdatePost?: (
    postId: string,
    title: string,
    content: string,
    fontSize: number,
    isBold: boolean,
    isItalic: boolean,
    isUnderline: boolean,
    textColor: string,
    isMarkdown: boolean,
  ) => void;
  posts?: Post[];
  editingPost?: Post;
}

function EditorScreen({
  onGoToMain,
  onAddPost,
  onUpdatePost,
  posts,
  editingPost
}: EditorScreenProps) {
  const { id } = useParams<{ id: string }>();
  const postToEdit = id && posts ? posts.find(post => post.id === id) : editingPost;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [editorMode, setEditorMode] = useState<'markdown' | 'richtext'>('richtext');

  const {user} = useAuth();

  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title);
      setContent(postToEdit.content);
      setFontSize(postToEdit.fontSize);
      setIsBold(postToEdit.isBold);
      setIsItalic(postToEdit.isItalic);
      setIsUnderline(postToEdit.isUnderline);
      setTextColor(postToEdit.textColor);
      setEditorMode(postToEdit.isMarkdown ? 'markdown' : 'richtext')
    }
  }, [postToEdit]);

  const handlePublish = () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
    } else if (!content.trim()) {
      alert('내용을 입력해주세요.');
    } else {

      const isMarkdown = editorMode === 'markdown' ? true : false;
      if (postToEdit && onUpdatePost) {
        onUpdatePost(postToEdit.id, title, content, fontSize, isBold, isItalic, isUnderline, textColor, isMarkdown);
      } else if (onAddPost) {
        onAddPost(title, content, fontSize, isBold, isItalic, isUnderline, textColor, isMarkdown);
      }
    }
  };

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
              <button
                onClick={() => setIsBold(!isBold)}
                disabled={editorMode === 'markdown'}
                className={`p-2 rounded transition-colors ${
                  editorMode === 'markdown' 
                    ? 'opacity-30 cursor-not-allowed' 
                    : isBold 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'hover:bg-gray-100'
                }`}
                title="Bold"
              >
                <span className="font-bold">B</span>
              </button>
              <button
                onClick={() => setIsItalic(!isItalic)}
                disabled={editorMode === 'markdown'}
                className={`p-2 rounded transition-colors ${
                  editorMode === 'markdown' 
                    ? 'opacity-30 cursor-not-allowed' 
                    : isBold 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'hover:bg-gray-100'
                }`}
                title="Italic"
              >
                <span className="italic">I</span>
              </button>
              <button
                onClick={() => setIsUnderline(!isUnderline)}
                disabled={editorMode === 'markdown'}
                className={`p-2 rounded transition-colors ${
                  editorMode === 'markdown' 
                    ? 'opacity-30 cursor-not-allowed' 
                    : isBold 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'hover:bg-gray-100'
                }`}
                title="Underline"
              >
                <span className="underline">U</span>
              </button>
              
              <div className="w-px h-4 bg-gray-200 mx-2"></div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">크기:</span>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  disabled={editorMode === 'markdown'}
                  className={`p-2 rounded transition-colors ${
                    editorMode === 'markdown' 
                      ? 'opacity-30 cursor-not-allowed' 
                      : isBold 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'hover:bg-gray-100'
                  }`}
                >
                  <option value={12}>12px</option>
                  <option value={14}>14px</option>
                  <option value={16}>16px</option>
                  <option value={18}>18px</option>
                  <option value={20}>20px</option>
                  <option value={24}>24px</option>
                </select>
              </div>
              
              <div className="w-px h-4 bg-gray-200 mx-2"></div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">색상:</span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                  disabled={editorMode === 'markdown'}
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
              
              <div className="editor-content prose prose-slate max-w-none">
                <textarea
                  className="w-full min-h-[500px] border-none focus:ring-0 focus:outline-none bg-transparent leading-relaxed placeholder:text-gray-300 p-0 resize-none"
                  placeholder="이야기를 들려주세요..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={editorMode === 'richtext' ? {
                    fontSize: `${fontSize}px`,
                    fontWeight: isBold ? 'bold' : 'normal',
                    fontStyle: isItalic ? 'italic' : 'normal',
                    textDecoration: isUnderline ? 'underline' : 'none',
                    color: textColor,
                  } : undefined}  // 마크다운 모드일 때는 스타일 적용 안 함
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default EditorScreen;