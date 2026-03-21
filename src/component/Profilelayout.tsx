import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserProfile, UserProfile } from '../api/userApi';
import { getSiteName, getCachedSiteName } from '../api/siteConfigApi';
import { ROUTES } from '../types/routes';

const ProfileLayout = () => {
  const { user, avatarColor, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [siteName, setSiteNameState] = useState<string | null>(getCachedSiteName());

  useEffect(() => {
    if (!user) return;
    fetchUserProfile(user.id).then(setProfile).catch(console.error);
  }, [user]);

  useEffect(() => {
    getSiteName().then(setSiteNameState).catch(() => {});
  }, []);

  const handleLogout = async () => {
    if (!window.confirm('로그아웃 하시겠습니까?')) return;
    await signOut();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        <div className="p-6 flex-1">
          {/* 로고 */}
          <div
            className="flex items-center gap-3 mb-8 cursor-pointer"
            onClick={() => navigate(ROUTES.HOME)}
          >
            <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">terminal</span>
            </div>
            {siteName && <span className="text-lg font-bold tracking-tight">{siteName}</span>}
          </div>

          {/* 사용자 정보 */}
          <div className="flex items-center gap-3 p-3 mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0"
            style={{background : avatarColor }}>
              {profile ? (profile.display_name ?? profile.email)[0].toUpperCase() : '?'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">
                {profile?.display_name ?? '이름 없음'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {profile?.email ?? ''}
              </span>
            </div>
          </div>

          {/* 메뉴 */}
          <nav className="space-y-1">
            <NavLink
              to={ROUTES.PROFILE_EDIT}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600 dark:bg-blue-900/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-blue-600' : ''}`}>
                    person
                  </span>
                  프로필 수정
                </>
              )}
            </NavLink>

            <NavLink
              to={ROUTES.PROFILE_PASSWORD}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600 dark:bg-blue-900/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-blue-600' : ''}`}>
                    lock
                  </span>
                  비밀번호 변경
                </>
              )}
            </NavLink>
          </nav>
        </div>

        {/* 로그아웃 */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-500 hover:text-red-500 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-12 px-8">
          <Outlet context={{ profile, setProfile }} />
        </div>
      </main>
    </div>
  );
};

export default ProfileLayout;