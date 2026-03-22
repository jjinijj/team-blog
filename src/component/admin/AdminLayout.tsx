import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../types/routes';

/**
 * 관리자 페이지 레이아웃
 * 사이드바 네비게이션 + 메인 컨텐츠 영역
 */
const AdminLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 사이드바 */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="flex flex-col h-full p-4">
          {/* 로고 */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="bg-blue-600 flex items-center justify-center rounded-lg size-10">
              <span className="material-symbols-outlined text-white">admin_panel_settings</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-slate-900 text-base font-bold leading-none">블로그 관리</h1>
              <p className="text-slate-500 text-xs font-normal">관리자 콘솔</p>
            </div>
          </div>

          {/* 네비게이션 */}
          <nav className="flex flex-col gap-1 grow">
            {/* Dashboard */}
            <NavLink
              to={ROUTES.ADMIN_DASHBOARD}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '20px',
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    dashboard
                  </span>
                  <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    대시보드
                  </span>
                </>
              )}
            </NavLink>

            {/* Home Screen */}
            <NavLink
              to={ROUTES.ADMIN_HOME_SCREEN}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '20px',
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    home_app_logo
                  </span>
                  <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    홈 화면
                  </span>
                </>
              )}
            </NavLink>

            {/* Whitelist */}
            <NavLink
              to={ROUTES.ADMIN_WHITELIST}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '20px',
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    verified_user
                  </span>
                  <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    화이트리스트
                  </span>
                </>
              )}
            </NavLink>

            {/* Blog Posts */}
            <NavLink
              to={ROUTES.ADMIN_POSTS}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '20px',
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    article
                  </span>
                  <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    게시글 관리
                  </span>
                </>
              )}
            </NavLink>

            {/* Tags */}
            <NavLink
              to={ROUTES.ADMIN_TAGS}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '20px',
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    label
                  </span>
                  <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    태그 관리
                  </span>
                </>
              )}
            </NavLink>

            {/* Settings */}
            <NavLink
              to={ROUTES.ADMIN_SETTINGS}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '20px',
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    settings
                  </span>
                  <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    설정
                  </span>
                </>
              )}
            </NavLink>

            {/* 하단 메뉴 */}
            <div className="mt-auto border-t border-slate-200 pt-4 space-y-1">
              <button
                onClick={() => navigate(ROUTES.HOME)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors w-full text-left"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  home
                </span>
                <span className="text-sm font-medium">메인으로</span>
              </button>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors w-full text-left"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  logout
                </span>
                <span className="text-sm font-medium">로그아웃</span>
              </button>
            </div>
          </nav>

          {/* 사용자 정보 */}
          <div className="mt-4 px-3 py-2.5 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">로그인 계정</p>
            <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
          </div>
        </div>
      </aside>

      {/* 메인 컨텐츠 영역 - 각 페이지가 여기에 렌더링됨 */}
      <main className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;