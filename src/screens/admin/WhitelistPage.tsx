import React, { useState, useEffect } from 'react';
import { AllowedEmail } from '../../types/Auth';
import {
  readAllowedEmails,
  createAllowedEmail,
  deleteAllowedEmail,
} from '../../lib/AdminApi';

/**
 * 이메일 화이트리스트 관리 페이지
 */
const WhitelistPage: React.FC = () => {
  const [emails, setEmails] = useState<AllowedEmail[]>([]);
  const [newEmail, setNewEmail] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      setIsLoading(true);
      const data = await readAllowedEmails();
      setEmails(data);
    } catch (err) {
      console.error('이메일 목록 로드 실패:', err);
      setError('이메일 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newEmail.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    try {
      await createAllowedEmail(newEmail);
      setSuccess(`${newEmail} 추가 완료!`);
      setNewEmail('');
      setShowAddForm(false);
      loadEmails();
    } catch (err: any) {
      setError(err.message || '이메일 추가에 실패했습니다.');
    }
  };

  const handleDeleteEmail = async (id: string, email: string) => {
    if (!window.confirm(`정말 ${email}을(를) 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteAllowedEmail(id);
      setSuccess(`${email} 삭제 완료!`);
      loadEmails();
    } catch (err) {
      setError('이메일 삭제에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitial = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const filteredEmails = emails.filter(email =>
    email.email.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    email.added_by_email?.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <>
      {/* 페이지 헤더 */}
      <header className="p-8 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-slate-900 text-3xl font-black tracking-tight">이메일 화이트리스트</h2>
            <p className="text-slate-500 text-sm">팀 블로그 플랫폼의 승인된 이메일 주소를 관리합니다.</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-sm"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
            <span>새 이메일 추가</span>
          </button>
        </div>
      </header>

      {/* 알림 메시지 */}
      {error && (
        <div className="mx-8 mb-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="mx-8 mb-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="text-sm">{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
          </div>
        </div>
      )}

      {/* 이메일 추가 폼 */}
      {showAddForm && (
        <section className="px-8 mb-4">
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <form onSubmit={handleAddEmail} className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[280px]">
                <label className="block">
                  <span className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-2 block">
                    승인된 이메일 주소
                  </span>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-sm transition-all"
                    placeholder="예: name@company.com"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
              >
                사용자 추가
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewEmail('');
                }}
                className="h-11 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors"
              >
                취소
              </button>
            </form>
          </div>
        </section>
      )}

      {/* 검색바 */}
      <section className="px-8 mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '20px' }}>search</span>
          </div>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 outline-none text-sm shadow-sm"
            placeholder="이메일 주소 또는 날짜로 검색..."
          />
        </div>
      </section>

      {/* 이메일 테이블 */}
      <section className="px-8 pb-12">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    이메일 주소
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    추가한 관리자
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    추가 날짜
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-slate-500 text-sm">이메일 목록 불러오는 중...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredEmails.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      {searchKeyword ? '검색 결과가 없습니다.' : '등록된 이메일이 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  filteredEmails.map((email) => (
                    <tr key={email.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                            {getInitial(email.email)}
                          </div>
                          <span className="text-sm font-medium text-slate-900">{email.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {email.added_by_email || '알 수 없음'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(email.added_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteEmail(email.id, email.email)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          title="삭제"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
              총 {filteredEmails.length}개의 이메일
            </span>
          </div>
        </div>
      </section>
    </>
  );
};

export default WhitelistPage;