import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { updateDisplayName, UserProfile } from '../../api/userApi';

interface OutletContext {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
}

const EditProfilePage = () => {
  const { profile, setProfile } = useOutletContext<OutletContext>();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!profile) return null;

  const handleSubmit = async () => {
    if (!displayName.trim()) { setError('이름을 입력해주세요.'); return; }
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await updateDisplayName(profile.id, displayName);
      setProfile({ ...profile, display_name: displayName.trim() });
      setSuccess(true);
    } catch (e) {
      setError('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">프로필 수정</h1>
        <p className="text-slate-500 dark:text-slate-400">이름 등 개인 정보를 수정할 수 있어요.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* 아바타 */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold shrink-0">
            {(profile.display_name ?? profile.email)[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {profile.display_name ?? '이름 없음'}
            </p>
            <p className="text-xs text-slate-400 mt-1">{profile.email}</p>
          </div>
        </div>

        {/* 폼 */}
        <div className="p-8 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">이름</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setSuccess(false); setError(''); }}
              placeholder="이름을 입력하세요"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">이메일</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 outline-none cursor-not-allowed"
            />
            <p className="text-xs text-slate-400">이메일은 변경할 수 없어요.</p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">저장되었습니다.</p>}

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-2.5 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;