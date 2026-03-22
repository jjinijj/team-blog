import { useState, useEffect, useRef } from 'react';
import { fetchTags, createTag, updateTag, deleteTag, Tag } from '../../api/tagApi';

const TagManagePage = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const editorRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLElement>(null);

  const isEditMode = selectedTag !== null;

  useEffect(() => {
    fetchTags()
      .then(setTags)
      .catch(() => setError('태그 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const inEditor = editorRef.current?.contains(target);
      const inList = listRef.current?.contains(target);
      if (!inEditor && !inList) {
        resetEditor();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetEditor = () => {
    setSelectedTag(null);
    setNameInput('');
    setSubmitError(null);
  };

  const handleSelectTag = (tag: Tag) => {
    if (selectedTag?.id === tag.id) {
      resetEditor();
      return;
    }
    setSelectedTag(tag);
    setNameInput(tag.name);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    const name = nameInput.trim();
    if (!name) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      if (isEditMode) {
        const updated = await updateTag(selectedTag.id, name);
        setTags(prev =>
          prev
            .map(t => t.id === updated.id ? { ...updated, post_count: t.post_count } : t)
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        resetEditor();
      } else {
        const newTag = await createTag(name);
        setTags(prev => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
        setNameInput('');
      }
    } catch (e: any) {
      setSubmitError(e.message?.includes('unique') ? '이미 존재하는 태그입니다.' : isEditMode ? '태그 수정에 실패했습니다.' : '태그 추가에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTag) return;
    const count = selectedTag.post_count ?? 0;
    const confirmMsg = count > 0
      ? `"${selectedTag.name}" 태그를 삭제하시겠습니까?\n현재 ${count}개의 글에 사용 중입니다. 해당 글에서도 태그가 제거됩니다.`
      : `"${selectedTag.name}" 태그를 삭제하시겠습니까?`;
    if (!window.confirm(confirmMsg)) return;
    try {
      await deleteTag(selectedTag.id);
      setTags(prev => prev.filter(t => t.id !== selectedTag.id));
      resetEditor();
    } catch {
      setSubmitError('태그 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">태그 관리</h1>
        <p className="text-slate-500 text-sm mt-1">관리자가 지정한 태그만 글에 사용할 수 있습니다.</p>
      </div>

      {/* 에디터 영역 */}
      <section ref={editorRef} className="bg-slate-50 border border-slate-100 rounded-xl p-6 mb-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
          {isEditMode ? '태그 수정' : '새 태그 추가'}
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="태그 이름 입력"
            className="flex-1 h-11 px-4 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isEditMode && (
            <button
              onClick={handleDelete}
              className="h-11 px-4 text-sm font-semibold border border-red-300 text-red-500 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              삭제
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting || !nameInput.trim()}
            className={`h-11 px-5 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              submitting || !nameInput.trim()
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{isEditMode ? 'save' : 'add'}</span>
            {submitting ? '처리 중...' : isEditMode ? '수정' : '추가'}
          </button>
        </div>
        {submitError && <p className="text-xs text-red-500 mt-2">{submitError}</p>}
      </section>

      {/* 태그 목록 */}
      <section ref={listRef} className="bg-slate-50 border border-slate-100 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">태그 목록</p>
          <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            총 {tags.length}개
          </span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-400 text-sm">불러오는 중...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-500 text-sm">{error}</div>
        ) : tags.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">등록된 태그가 없습니다.</div>
        ) : (
          <div className="flex flex-col">
            {tags.map((tag, index) => (
              <div key={tag.id}>
                {index > 0 && <div className="h-px bg-slate-100 mx-3" />}
                <div
                  onClick={() => handleSelectTag(tag)}
                  className={`flex items-center justify-between px-3 py-3.5 rounded-lg cursor-pointer transition-all border-l-4 ${
                    selectedTag?.id === tag.id
                      ? 'bg-blue-50 border-blue-500'
                      : 'border-transparent hover:bg-white'
                  }`}
                >
                  <div className="flex items-baseline gap-3">
                    <span className={`text-base font-semibold ${selectedTag?.id === tag.id ? 'text-blue-700' : 'text-slate-900'}`}>
                      {tag.name}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      selectedTag?.id === tag.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {tag.post_count ?? 0}개
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TagManagePage;
