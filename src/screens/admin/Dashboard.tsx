import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { readPosts } from '../../api/postApi';
import { readAllowedEmails } from '../../api/allowedEmailApi';
import {ROUTES} from '../../types/routes'

/**
 * 관리자 대시보드
 * 전체 통계 및 최근 활동을 보여줌
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalEmails: 0,
    recentPosts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [posts, emails] = await Promise.all([
        readPosts(),
        readAllowedEmails(),
      ]);

      // 최근 7일간 작성된 글 수
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentPosts = posts.filter(
        post => new Date(post.created_at) > sevenDaysAgo
      ).length;

      setStats({
        totalPosts: posts.length,
        totalEmails: emails.length,
        recentPosts,
      });
    } catch (error) {
      console.error('통계 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <header className="p-8 pb-4">
          <h1 className="text-slate-900 text-3xl font-black tracking-tight">대시보드</h1>
          <p className="text-slate-500 text-sm mt-1">팀 블로그 관리 현황을 한눈에 확인하세요.</p>
        </header>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </>
    );
  }

  return (
    <>
      {/* 페이지 헤더 */}
      <header className="p-8 pb-4">
        <h1 className="text-slate-900 text-3xl font-black tracking-tight">대시보드</h1>
        <p className="text-slate-500 text-sm mt-1">팀 블로그 관리 현황을 한눈에 확인하세요.</p>
      </header>

      <div className="px-8 pb-8">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 총 게시글 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-blue-600 text-3xl">article</span>
            <span className="text-xs font-bold uppercase text-slate-500">전체 게시글</span>
          </div>
          <p className="text-3xl font-black text-slate-900 mb-1">{stats.totalPosts}</p>
          <p className="text-sm text-slate-500">전체 게시글</p>
        </div>

        {/* 총 화이트리스트 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-green-600 text-3xl">verified_user</span>
            <span className="text-xs font-bold uppercase text-slate-500">승인 이메일</span>
          </div>
          <p className="text-3xl font-black text-slate-900 mb-1">{stats.totalEmails}</p>
          <p className="text-sm text-slate-500">승인된 이메일</p>
        </div>

        {/* 최근 게시글 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-purple-600 text-3xl">schedule</span>
            <span className="text-xs font-bold uppercase text-slate-500">최근 게시글</span>
          </div>
          <p className="text-3xl font-black text-slate-900 mb-1">{stats.recentPosts}</p>
          <p className="text-sm text-slate-500">최근 7일 게시글</p>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">빠른 작업</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate(ROUTES.ADMIN_POSTS)}
            className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <span className="material-symbols-outlined text-blue-600">article</span>
            <div>
              <p className="font-semibold text-slate-900">게시글 관리</p>
              <p className="text-sm text-slate-500">모든 게시글 확인 및 수정</p>
            </div>
          </button>

          <button
            onClick={() => navigate(ROUTES.ADMIN_WHITELIST)}
            className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <span className="material-symbols-outlined text-green-600">verified_user</span>
            <div>
              <p className="font-semibold text-slate-900">화이트리스트 관리</p>
              <p className="text-sm text-slate-500">승인된 이메일 추가/삭제</p>
            </div>
          </button>

          <button
            onClick={() => navigate(ROUTES.WRITE)}
            className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <span className="material-symbols-outlined text-purple-600">add</span>
            <div>
              <p className="font-semibold text-slate-900">새 글 작성</p>
              <p className="text-sm text-slate-500">에디터에서 새 게시글 작성</p>
            </div>
          </button>

          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <span className="material-symbols-outlined text-orange-600">home</span>
            <div>
              <p className="font-semibold text-slate-900">메인 페이지</p>
              <p className="text-sm text-slate-500">블로그 메인으로 이동</p>
            </div>
          </button>
        </div>
      </div>
      </div>
    </>
  );
};

export default Dashboard;