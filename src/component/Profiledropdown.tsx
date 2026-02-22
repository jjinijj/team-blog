import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProfileDropdown = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
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
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {user ? (
        <>
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold hover:shadow-lg transition-all"
          >
            {user.email?.[0].toUpperCase() || 'U'}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50">
              {/* 유저 정보 */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">로그인됨</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
              </div>

              {/* 메뉴 */}
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <span>사용자 정보</span>
              </button>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/my-posts');
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <span>내 글 보기</span>
              </button>

              {/* 관리자 메뉴 */}
              {isAdmin && (
                <>
                  <div className="my-1 h-px bg-gray-100" />
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/admin');
                    }}
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
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          로그인
        </button>
      )}
    </div>
  );
};

export default ProfileDropdown;