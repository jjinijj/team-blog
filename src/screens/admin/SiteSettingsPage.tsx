import React, { useState, useEffect } from 'react';
import {
  getSiteName, setSiteName,
  getPostsPerPage, setPostsPerPage,
} from '../../api/siteConfigApi';

const BRAND_COLORS = [
  { label: 'Blue',    value: '#3b82f6' },
  { label: 'Slate',   value: '#1e293b' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Violet',  value: '#7c3aed' },
  { label: 'Rose',    value: '#f43f5e' },
];

const SiteSettingsPage: React.FC = () => {
  const [siteName, setSiteNameState] = useState('');
  const [siteNameInput, setSiteNameInput] = useState('');
  const [postsPerPage, setPostsPerPageState] = useState(10);
  const [postsPerPageInput, setPostsPerPageInput] = useState(10);
  const [selectedColor, setSelectedColor] = useState(BRAND_COLORS[0].value);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([getSiteName(), getPostsPerPage()])
      .then(([name, perPage]) => {
        setSiteNameState(name);
        setSiteNameInput(name);
        setPostsPerPageState(perPage);
        setPostsPerPageInput(perPage);
      })
      .catch(() => setError('설정을 불러오는데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(''); setSuccess(''); }, 3000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  const isDirty = siteNameInput !== siteName || postsPerPageInput !== postsPerPage;

  const handleSave = async () => {
    if (!siteNameInput.trim()) {
      setError('사이트 이름을 입력해주세요.');
      return;
    }
    setSaving(true);
    try {
      await Promise.all([
        siteNameInput !== siteName ? setSiteName(siteNameInput.trim()) : Promise.resolve(),
        postsPerPageInput !== postsPerPage ? setPostsPerPage(postsPerPageInput) : Promise.resolve(),
      ]);
      setSiteNameState(siteNameInput.trim());
      setPostsPerPageState(postsPerPageInput);
      setSuccess('설정이 저장되었습니다.');
    } catch {
      setError('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSiteNameInput(siteName);
    setPostsPerPageInput(postsPerPage);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-[740px] mx-auto animate-pulse space-y-8">
        <div className="h-10 w-56 bg-slate-200 rounded-xl" />
        <div className="space-y-4">
          <div className="h-4 w-24 bg-slate-200 rounded-full" />
          <div className="h-12 bg-slate-200 rounded-xl" />
        </div>
        <div className="space-y-4">
          <div className="h-4 w-32 bg-slate-200 rounded-full" />
          <div className="h-6 bg-slate-200 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-[740px] mx-auto">

        {/* 페이지 헤더 */}
        <div className="mb-2">
          <span className="text-[10px] uppercase tracking-widest text-blue-600 font-bold">Admin Console</span>
        </div>
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">Site Configuration</h1>
          <p className="text-slate-500 leading-relaxed">사이트 이름, 글 표시 수, 브랜드 색상 등 기본 설정을 관리합니다.</p>
        </div>

        {/* 알림 */}
        {error && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {success}
          </div>
        )}

        <div className="space-y-12">

          {/* Section: General Identity */}
          <section className="space-y-6">
            <div className="pb-2 border-b border-slate-100">
              <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold">General Identity</h2>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2" htmlFor="site_name">
                Site Name
              </label>
              <input
                id="site_name"
                type="text"
                value={siteNameInput}
                onChange={e => setSiteNameInput(e.target.value)}
                placeholder="사이트 이름 입력..."
                className="w-full px-0 py-3 text-2xl font-semibold bg-transparent border-0 border-b-2 border-slate-100 focus:ring-0 focus:border-blue-500 placeholder-slate-300 transition-all outline-none"
              />
            </div>
          </section>

          {/* Section: Content Strategy */}
          <section className="space-y-6">
            <div className="pb-2 border-b border-slate-100">
              <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Content Strategy</h2>
            </div>
            <div>
              <div className="flex justify-between items-end mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="posts_per_page">
                  Posts Per Page
                </label>
                <span className="text-3xl font-black text-blue-600">{postsPerPageInput}</span>
              </div>
              <input
                id="posts_per_page"
                type="range"
                min={4}
                max={48}
                step={4}
                value={postsPerPageInput}
                onChange={e => setPostsPerPageInput(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                <span>Min: 4</span>
                <span>Max: 48</span>
              </div>
            </div>
          </section>

          {/* Section: Visual System */}
          <section className="space-y-6">
            <div className="pb-2 border-b border-slate-100">
              <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Visual System</h2>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Primary Brand Color
              </label>
              <p className="text-xs text-slate-400 mb-4">브랜드 컬러 설정은 준비 중입니다. 미리보기만 가능합니다.</p>
              <div className="flex items-center gap-3">
                {BRAND_COLORS.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    title={color.label}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-12 h-12 rounded-xl shadow-sm transition-all ${
                      selectedColor === color.value
                        ? 'border-2 border-white ring-2 ring-offset-1'
                        : 'hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: color.value,
                      ringColor: selectedColor === color.value ? color.value : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="pt-8 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty || saving}
              className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Reset
            </button>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleReset}
                disabled={!isDirty || saving}
                className="px-8 py-3 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isDirty || saving}
                className="px-10 py-3 bg-blue-600 text-white rounded-lg text-sm font-black shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? '저장 중...' : 'Save Changes'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SiteSettingsPage;
