import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../types/Post';
import { readPosts } from '../api/supabaseApi';
import SiteHeader from '../component/SiteHeader';
import LogoMark from '../component/LogoMark';
import { getAbsoluteDay } from '../utils/DataFormat';

// TODO: DB 연동 후 team_info 테이블에서 불러올 내용
const HERO_CONTENT = {
  badge: 'Engineering Blog',
  title: '팀의 경험과\n인사이트를 공유합니다.',
  description: '개발, 설계, 협업에서 얻은 실전 경험을 팀원들과 나눕니다.',
};

const TEAM_CONTENT = {
  title: '팀을 소개합니다',
  description: '함께 만들고, 함께 배우는 팀입니다. 이 블로그는 그 과정을 기록하는 공간입니다.',
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);

  useEffect(() => {
    readPosts().then(posts => setRecentPosts(posts.slice(0, 3)));
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">

      <SiteHeader />

      <main className="flex-grow">

        {/* Hero Section */}
        <section className="px-4 lg:px-20 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 min-h-[480px] flex items-center">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-800" />
              <div className="relative z-10 px-8 lg:px-16 max-w-2xl py-16">
                <span className="inline-block bg-primary/20 text-white border border-primary/30 text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
                  {HERO_CONTENT.badge}
                </span>
                <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6 whitespace-pre-line">
                  {HERO_CONTENT.title}
                </h1>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                  {HERO_CONTENT.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => navigate('/blog')}
                    className="bg-primary text-white font-bold px-8 py-3 rounded-lg flex items-center gap-2 group hover:bg-primary/90 transition-colors"
                  >
                    블로그 보기
                    <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Posts */}
        <section className="px-4 lg:px-20 py-12 bg-white dark:bg-slate-900/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-2">최근 게시글</h2>
                <p className="text-slate-500 dark:text-slate-400">팀의 최신 이야기</p>
              </div>
              <button
                onClick={() => navigate('/blog')}
                className="text-primary font-bold flex items-center gap-1 hover:underline text-sm"
              >
                전체 보기 <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>

            {recentPosts.length === 0 ? (
              <p className="text-slate-400 text-sm">아직 게시글이 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentPosts.map(post => (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/post/${post.id}`)}
                    className="flex flex-col group cursor-pointer bg-background-light dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:shadow-md transition-all"
                  >
                    <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-5 line-clamp-3 leading-relaxed text-sm flex-1">
                      {post.content.replace(/[#*`>\-_~\[\]]/g, '').slice(0, 120)}
                    </p>
                    <div className="flex items-center gap-3 mt-auto">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: post.author_color ?? '#3b82f6' }}
                      >
                        {(post.author_name || post.author_email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{post.author_name || post.author_email}</p>
                        <p className="text-xs text-slate-500">{getAbsoluteDay(post.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Team Section */}
        {/* TODO: DB 연동 후 team_info 테이블에서 내용을 불러와 동적으로 렌더링 */}
        <section className="px-4 lg:px-20 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1">
                <h2 className="text-4xl font-black mb-6">{TEAM_CONTENT.title}</h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
                  {TEAM_CONTENT.description}
                </p>
                <button
                  onClick={() => navigate('/team')}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                  팀 소개
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-64 h-64 bg-primary/10 rounded-[40px] flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '96px' }}>groups</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-950 px-4 lg:px-20 py-10 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <LogoMark size="sm" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Team Blog</span>
          </div>
          <p className="text-slate-400 text-xs">© {new Date().getFullYear()} Team Blog. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
