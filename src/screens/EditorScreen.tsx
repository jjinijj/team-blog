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
    <div className="w-full min-h-screen py-10 px-5 bg-gray-100">
      <div className="max-w-3xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 m-0">
          {postToEdit ? '글 수정' : '새 글 작성'}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={onGoToMain}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg text-base cursor-pointer transition-colors hover:bg-gray-700"
          >
            취소
          </button>
          <button
            onClick={handlePublish}
            className="px-6 py-3 bg-green-600 text-white rounded-lg text-base cursor-pointer transition-colors hover:bg-green-700"
          >
            {postToEdit ? '수정' : '등록'}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-lg p-10">
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-3 mb-5 border border-gray-300 rounded text-base box-border focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
        />

        <div className="mb-5 flex items-center gap-2.5">
          <label className="text-sm font-bold text-gray-800 min-w-[100px]">글자 크기</label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded text-sm cursor-pointer focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          >
            <option value={12}>12px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
            <option value={20}>20px</option>
            <option value={24}>24px</option>
          </select>
        </div>

        <div className="mb-5 flex items-center gap-2.5">
          <label className="text-sm font-bold text-gray-800 min-w-[100px]">글자 스타일</label>
          <div className="flex gap-2">
            <button
              onClick={() => setIsBold(!isBold)}
              title="굵게"
              className={`px-4 py-2 border border-gray-300 rounded text-sm cursor-pointer transition-all font-bold ${
                isBold
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 hover:border-blue-600'
              }`}
            >
              B
            </button>
            <button
              onClick={() => setIsItalic(!isItalic)}
              title="기울임"
              className={`px-4 py-2 border border-gray-300 rounded text-sm cursor-pointer transition-all font-bold ${
                isItalic
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 hover:border-blue-600'
              }`}
            >
              I
            </button>
            <button
              onClick={() => setIsUnderline(!isUnderline)}
              title="밑줄"
              className={`px-4 py-2 border border-gray-300 rounded text-sm cursor-pointer transition-all font-bold ${
                isUnderline
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 hover:border-blue-600'
              }`}
            >
              U
            </button>
          </div>
        </div>

        <div className="mb-5 flex items-center gap-2.5">
          <label className="text-sm font-bold text-gray-800 min-w-[100px]">글자 색상</label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-10 h-8 cursor-pointer"
          />
        </div>

        <textarea
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[400px] px-3 py-3 border border-gray-300 rounded box-border resize-y focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
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
  );
}

export default EditorScreen;