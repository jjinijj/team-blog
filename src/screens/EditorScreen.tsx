import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Post } from '../types/Post';

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

  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title);
      setContent(postToEdit.content);
      setFontSize(postToEdit.fontSize);
      setIsBold(postToEdit.isBold);
      setIsItalic(postToEdit.isItalic);
      setIsUnderline(postToEdit.isUnderline);
      setTextColor(postToEdit.textColor);
    }
  }, [postToEdit]);

  const handlePublish = () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
    } else if (!content.trim()) {
      alert('내용을 입력해주세요.');
    } else {
      if (postToEdit && onUpdatePost) {
        onUpdatePost(postToEdit.id, title, content, fontSize, isBold, isItalic, isUnderline, textColor);
      } else if (onAddPost) {
        onAddPost(title, content, fontSize, isBold, isItalic, isUnderline, textColor);
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
              {postToEdit ? 'Edit Post' : 'Draft in TeamBlog'}
            </span>
          </div>
          <span className="text-xs text-gray-400 font-medium ml-2">Auto-saved</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onGoToMain}
            className="px-4 h-9 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            className="px-5 h-9 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            {postToEdit ? 'Update' : 'Publish'}
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
                className={`p-2 rounded transition-colors ${
                  isBold ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
                title="Bold"
              >
                <span className="font-bold">B</span>
              </button>
              <button
                onClick={() => setIsItalic(!isItalic)}
                className={`p-2 rounded transition-colors ${
                  isItalic ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
                title="Italic"
              >
                <span className="italic">I</span>
              </button>
              <button
                onClick={() => setIsUnderline(!isUnderline)}
                className={`p-2 rounded transition-colors ${
                  isUnderline ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
                title="Underline"
              >
                <span className="underline">U</span>
              </button>
              
              <div className="w-px h-4 bg-gray-200 mx-2"></div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Size:</span>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="text-xs px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                <span className="text-xs text-gray-500">Color:</span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <input
                type="text"
                className="w-full text-5xl font-bold border-none focus:ring-0 focus:outline-none placeholder:text-gray-200 bg-transparent resize-none"
                placeholder="Post Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              
              <div className="flex items-center gap-3 py-2 border-y border-gray-50">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  A
                </div>
                <span className="text-sm font-medium text-gray-500">
                  Writing as <span className="text-gray-900">Author</span>
                </span>
              </div>
              
              <div className="editor-content prose prose-slate max-w-none">
                <textarea
                  className="w-full min-h-[500px] border-none focus:ring-0 focus:outline-none bg-transparent leading-relaxed placeholder:text-gray-300 p-0 resize-none"
                  placeholder="Tell your story..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{
                    fontSize: `${fontSize}px`,
                    fontWeight: isBold ? 'bold' : 'normal',
                    fontStyle: isItalic ? 'italic' : 'normal',
                    textDecoration: isUnderline ? 'underline' : 'none',
                    color: textColor,
                  }}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto p-6">
          <div className="space-y-8">
            {/* Styling Options */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                Text Style
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Font Size</span>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="text-sm px-3 py-1 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={12}>12px</option>
                    <option value={14}>14px</option>
                    <option value={16}>16px</option>
                    <option value={18}>18px</option>
                    <option value={20}>20px</option>
                    <option value={24}>24px</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Bold</span>
                  <button
                    onClick={() => setIsBold(!isBold)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      isBold ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isBold ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Italic</span>
                  <button
                    onClick={() => setIsItalic(!isItalic)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      isItalic ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isItalic ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Underline</span>
                  <button
                    onClick={() => setIsUnderline(!isUnderline)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      isUnderline ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isUnderline ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Text Color</span>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer border border-gray-200"
                  />
                </div>
              </div>
            </section>

            {/* Preview */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                Preview
              </h3>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p
                  className="text-sm"
                  style={{
                    fontSize: `${fontSize}px`,
                    fontWeight: isBold ? 'bold' : 'normal',
                    fontStyle: isItalic ? 'italic' : 'normal',
                    textDecoration: isUnderline ? 'underline' : 'none',
                    color: textColor,
                  }}
                >
                  Sample text preview
                </p>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default EditorScreen;