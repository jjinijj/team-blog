import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../types/routes';

export const ProfileDropdown = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, loading, profileReady, isAdmin, signOut, displayName, avatarColor } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await signOut();
    navigate(ROUTES.LOGIN);
  };

  const initial = (displayName ?? user?.email ?? 'U')[0].toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {loading || !profileReady ? (
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
      ) : user ? (
        <>
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg transition-all"
            style={{ backgroundColor: avatarColor }}
          >
            {initial}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50">
              {/* 유저 정보 */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initial}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {displayName ?? user.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              {/* 메뉴 */}
              <button
                onClick={() => { setIsProfileOpen(false); navigate(ROUTES.PROFILE); }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <span>사용자 정보</span>
              </button>

              <button
                onClick={() => { setIsProfileOpen(false); navigate(ROUTES.MY_POSTS); }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <span>내 글 보기</span>
              </button>

              <button
                onClick={() => { setIsProfileOpen(false); navigate(ROUTES.MY_COMMENTS); }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <span>내 댓글</span>
              </button>

              <button
                onClick={() => { setIsProfileOpen(false); navigate(ROUTES.BOOKMARKS); }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <span>북마크</span>
              </button>

              {isAdmin && (
                <>
                  <div className="my-1 h-px bg-gray-100" />
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate(ROUTES.ADMIN); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-3"
                  >
                    <span>⚙️</span>
                    <span>관리자 페이지</span>
                  </button>
                </>
              )}

              <div className="my-1 h-px bg-gray-100" />

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
              >
                <span>로그아웃</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <button
          onClick={() => navigate(ROUTES.CONTACT)}
          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          문의하기
        </button>
      )}
    </div>
  );
};

export default ProfileDropdown;