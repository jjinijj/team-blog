import { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Post } from '../types/Post';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentStyles, wrapSelection, unwrapTag, applyStyle, cleanHTML } from '../utils/SelectionUtils';

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
  const [editorMode, setEditorMode] = useState<'markdown' | 'richtext'>('richtext');

  // 리치텍스트 에디터 ref
  const editorRef = useRef<HTMLDivElement>(null);
  
  // 현재 스타일 상태
  const [currentStyles, setCurrentStyles] = useState({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    fontSize: '16px',
    color: '#000000',
  });
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
      setEditorMode(postToEdit.isMarkdown ? 'markdown' : 'richtext')

      //리치 텍스트 모드일때 에디터에 html 설정
      if(!postToEdit.isMarkdown && editorRef.current){
        editorRef.current.innerHTML = postToEdit.content;
      }
    }
  }, [postToEdit]);

  // 선택 변경 감지 및 스타일 업데이트
  useEffect(() => {
    const updateStyles = () => {
      if (editorMode === 'richtext' && editorRef.current) {
        const styles = getCurrentStyles(editorRef.current);
        setCurrentStyles({
          isBold: styles.isBold,
          isItalic: styles.isItalic,
          isUnderline: styles.isUnderline,
          fontSize: styles.fontSize || '16px',
          color: styles.color || '#000000',
        });
      }
    };

    document.addEventListener('selectionchange', updateStyles);
    return () => document.removeEventListener('selectionchange', updateStyles);
  }, [editorMode]);

// 리치텍스트 에디터 입력 변경
  const handleEditorInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  // Bold 토글
  const handleBold = () => {
    if (currentStyles.isBold) {
      unwrapTag('strong');
      unwrapTag('b');
    } else {
      wrapSelection('strong');
    }
    editorRef.current?.focus();
  };

  // Italic 토글
  const handleItalic = () => {
    if (currentStyles.isItalic) {
      unwrapTag('em');
      unwrapTag('i');
    } else {
      wrapSelection('em');
    }
    editorRef.current?.focus();
  };

  // Underline 토글
  const handleUnderline = () => {
    if (currentStyles.isUnderline) {
      unwrapTag('u');
    } else {
      wrapSelection('u');
    }
    editorRef.current?.focus();
  };

  // Font Size 변경
  const handleFontSize = (size: string) => {
    applyStyle('fontSize', size);
    editorRef.current?.focus();
  };

  // Color 변경
  const handleColor = (color: string) => {
    applyStyle('color', color);
    editorRef.current?.focus();
  };

  const handlePublish = () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
    } else if (!content.trim()) {
      alert('내용을 입력해주세요.');
    } else {

      const isMarkdown = editorMode === 'markdown' ? true : false;
      if (postToEdit && onUpdatePost) {
        onUpdatePost(postToEdit.id, title, content, isMarkdown);
      } else if (onAddPost) {
        onAddPost(title, content, isMarkdown);
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
                onClick={handleBold}
                disabled={editorMode === 'markdown'}
                className={`p-2 rounded transition-colors ${
                  editorMode === 'markdown' 
                    ? 'opacity-30 cursor-not-allowed' 
                    : currentStyles.isBold 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'hover:bg-gray-100'
                }`}
                title="Bold"
              >
                <span className="font-bold">B</span>
              </button>
              <button
                onClick={handleItalic}
                disabled={editorMode === 'markdown'}
                className={`p-2 rounded transition-colors ${
                  editorMode === 'markdown' 
                    ? 'opacity-30 cursor-not-allowed' 
                    : currentStyles.isItalic 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'hover:bg-gray-100'
                }`}
                title="Italic"
              >
                <span className="italic">I</span>
              </button>
              <button
                onClick={handleUnderline}
                disabled={editorMode === 'markdown'}
                className={`p-2 rounded transition-colors ${
                  editorMode === 'markdown' 
                    ? 'opacity-30 cursor-not-allowed' 
                    : currentStyles.isUnderline 
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
                  value={currentStyles.fontSize}
                  onChange={(e) => handleFontSize(e.target.value)}
                  disabled={editorMode === 'markdown'}
                  className={`p-2 rounded transition-colors ${
                    editorMode === 'markdown' 
                      ? 'opacity-30 cursor-not-allowed' 
                      :''
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
                  value={currentStyles.color}
                  onChange={(e) => handleColor(e.target.value)}
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
                    onInput={handleEditorInput}
                    className="w-full min-h-[500px] border-none focus:ring-0 focus:outline-none bg-transparent leading-relaxed p-0"
                    style={{ whiteSpace: 'pre-wrap' }}
                    suppressContentEditableWarning
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