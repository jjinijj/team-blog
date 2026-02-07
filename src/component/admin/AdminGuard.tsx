import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * 관리자 권한 체크 가드
 * 로그인 && 관리자인 경우에만 자식 라우트 접근 허용
 */
const AdminGuard: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">로딩 중...</p>
        </div>
      </div>
    );
  }


  // 로그인이 안되어있거나 관리자가 아님
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <span className="material-symbols-outlined text-red-600 text-6xl mb-4">block</span>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">접근 권한 없음</h2>
          <p className="text-slate-600 mb-6">관리자만 접근할 수 있는 페이지입니다.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 관리자 확인 → 자식 라우트 렌더링
  return <Outlet />;
};

export default AdminGuard;