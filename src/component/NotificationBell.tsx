import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationContext } from '../contexts/NotificationContext';
import { ROUTES } from '../types/routes';
import { getAbsoluteTime } from '../utils/DataFormat';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotificationContext();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif: typeof notifications[0]) => {
    if (!notif.is_read) await markAsRead(notif.id);
    setOpen(false);
    if (notif.post_id) navigate(ROUTES.POST_DETAIL(notif.post_id));
  };

  const label = (notif: typeof notifications[0]) => {
    const actor = notif.actor_name ?? '누군가';
    const post = notif.post_title ? `"${notif.post_title}"` : '글';
    if (notif.type === 'comment') return `${actor}님이 ${post}에 댓글을 남겼습니다.`;
    return '새 알림이 있습니다.';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
        title="알림"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-800">알림</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
              >
                모두 읽음
              </button>
            )}
          </div>

          {/* 목록 */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-400">불러오는 중...</div>
            ) : notifications.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
                <span className="material-symbols-outlined text-[36px]">notifications_off</span>
                <p className="text-sm">새 알림이 없습니다.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${!notif.is_read ? 'bg-blue-50/50' : ''}`}
                >
                  {/* 아바타 */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                    style={{ backgroundColor: notif.actor_color ?? '#3b82f6' }}
                  >
                    {(notif.actor_name ?? '?')[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">
                      {label(notif)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {getAbsoluteTime(notif.created_at)}
                    </p>
                  </div>

                  {!notif.is_read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
