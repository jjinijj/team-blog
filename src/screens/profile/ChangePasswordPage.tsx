import { useState } from 'react';
import { updatePassword } from '../../api/userApi';

const ChangePasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!newPassword) { setError('새 비밀번호를 입력해주세요.'); return; }
    if (newPassword.length < 6) { setError('비밀번호는 6자 이상이어야 해요.'); return; }
    if (newPassword !== confirmPassword) { setError('비밀번호가 일치하지 않아요.'); return; }
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await updatePassword(newPassword);
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      setError('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">비밀번호 변경</h1>
        <p className="text-slate-500 dark:text-slate-400">새 비밀번호를 설정해요. 6자 이상이어야 해요.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">새 비밀번호</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setSuccess(false); setError(''); }}
              placeholder="6자 이상 입력하세요"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">새 비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setSuccess(false); setError(''); }}
              placeholder="비밀번호를 다시 입력하세요"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">비밀번호가 변경되었어요.</p>}

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-2.5 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? '변경 중...' : '변경'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;