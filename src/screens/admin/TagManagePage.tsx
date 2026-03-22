import { useState, useEffect } from 'react';
import { fetchTags, createTag, deleteTag, Tag } from '../../api/tagApi';

const TagManagePage = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    fetchTags()
      .then(setTags)
      .catch(() => setError('태그 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    const name = nameInput.trim();
    if (!name) return;

    setAdding(true);
    setAddError(null);
    try {
      const newTag = await createTag(name);
      setTags(prev => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
      setNameInput('');
    } catch (e: any) {
      setAddError(e.message?.includes('unique') ? '이미 존재하는 태그입니다.' : '태그 추가에 실패했습니다.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (tag: Tag) => {
    const count = tag.post_count ?? 0;
    const confirmMsg = count > 0
      ? `"${tag.name}" 태그를 삭제하시겠습니까?\n현재 ${count}개의 글에 사용 중입니다. 해당 글에서도 태그가 제거됩니다.`
      : `"${tag.name}" 태그를 삭제하시겠습니까?`;
    if (!window.confirm(confirmMsg)) return;
    try {
      await deleteTag(tag.id);
      setTags(prev => prev.filter(t => t.id !== tag.id));
    } catch {
      setError('태그 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">태그 관리</h1>
        <p className="text-slate-500 text-sm mt-1">관리자가 지정한 태그만 글에 사용할 수 있습니다.</p>
      </div>

      {/* 태그 추가 폼 */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">새 태그 추가</h2>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">태그 이름</label>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="예: JavaScript"
                className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAdd}
                disabled={adding || !nameInput.trim()}
                className={`h-9 px-4 text-sm font-semibold rounded-lg transition-colors ${
                  adding || !nameInput.trim()
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {adding ? '추가 중...' : '태그 추가'}
              </button>
            </div>
          </div>
          {addError && <p className="text-xs text-red-500">{addError}</p>}
        </div>
      </div>

      {/* 태그 목록 */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">태그 목록</h2>
          <span className="text-xs text-slate-400">{tags.length}개</span>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-slate-400 text-sm">불러오는 중...</div>
        ) : error ? (
          <div className="px-6 py-8 text-center text-red-500 text-sm">{error}</div>
        ) : tags.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-400 text-sm">등록된 태그가 없습니다.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {tags.map(tag => (
              <li key={tag.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {tag.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    글 {tag.post_count ?? 0}개
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(tag)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  title="삭제"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TagManagePage;
