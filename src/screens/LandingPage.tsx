import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../types/Post';
import { readPosts } from '../api/postApi';
import { fetchHomeScreenConfig, fetchTeamMembers, type HomeScreenConfig, type TeamMember } from '../api/homeScreenApi';
import SiteHeader from '../component/SiteHeader';
import LogoMark from '../component/LogoMark';
import { getAbsoluteDay } from '../utils/DataFormat';

const LandingPage = () => {
  const navigate = useNavigate();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [config, setConfig] = useState<HomeScreenConfig | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      readPosts(),
      fetchHomeScreenConfig(),
      fetchTeamMembers(),
    ]).then(([posts, cfg, members]) => {
      setRecentPosts(posts.slice(0, cfg.latest_posts_count ?? 3));
      setConfig(cfg);
      setTeamMembers(members.filter((m) => m.show_in_team));
    }).catch((e) => {
      console.error(e);
      setError(true);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (error) {
    return (
      <div className="relative flex min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-950">
        <SiteHeader />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-slate-400 text-sm">페이지를 불러오지 못했습니다. 새로고침 해주세요.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      <SiteHeader />

      <main className="flex-grow">

        {/* Hero Skeleton */}
        {loading && (
          <section className="px-4 lg:px-20 py-12">
            <div className="max-w-7xl mx-auto">
              <div className="rounded-3xl bg-slate-800 min-h-[480px] flex items-center animate-pulse">
                <div className="px-8 lg:px-16 max-w-2xl py-16 space-y-5 w-full">
                  <div className="h-5 w-32 bg-slate-700 rounded-full" />
                  <div className="space-y-3">
                    <div className="h-10 w-3/4 bg-slate-700 rounded-xl" />
                    <div className="h-10 w-1/2 bg-slate-700 rounded-xl" />
                  </div>
                  <div className="h-5 w-2/3 bg-slate-700 rounded-full" />
                  <div className="h-12 w-36 bg-slate-700 rounded-lg" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Hero Section */}
        {!loading && config?.hero_visible !== false && (
          <section className="px-4 lg:px-20 py-12">
            <div className="max-w-7xl mx-auto">
              <div className="relative overflow-hidden rounded-3xl bg-slate-900 min-h-[480px] flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-800" />
                <div className="relative z-10 px-8 lg:px-16 max-w-2xl py-16">
                  <span className="inline-block bg-primary/20 text-white border border-primary/30 text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
                    {config?.hero_badge_text || 'Engineering Blog'}
                  </span>
                  <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6 whitespace-pre-line">
                    {config?.hero_headline ?? '팀의 경험과\n인사이트를 공유합니다.'}
                  </h1>
                  <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                    {config?.hero_subheadline ?? '개발, 설계, 협업에서 얻은 실전 경험을 팀원들과 나눕니다.'}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => navigate(config?.hero_cta_url || '/blog')}
                      className="bg-primary text-white font-bold px-8 py-3 rounded-lg flex items-center gap-2 group hover:bg-primary/90 transition-colors"
                    >
                      {config?.hero_cta_text ?? '블로그 보기'}
                      <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Latest Posts */}
        {!loading && config?.latest_posts_visible !== false && (
          <section className="px-4 lg:px-20 py-12 bg-white dark:bg-slate-900/50">
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
              ) : config?.card_layout === 'list' ? (
                <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                  {recentPosts.map(post => (
                    <div
                      key={post.id}
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="flex items-start gap-5 p-5 group cursor-pointer bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                        style={{ backgroundColor: post.author_color ?? '#3b82f6' }}
                      >
                        {(post.author_name || post.author_email || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold mb-1 group-hover:text-primary transition-colors line-clamp-1">
                          {post.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-1 mb-1">
                          {post.content.replace(/!\[[^\]]*\]\([^)]*\)/g, '[이미지]').replace(/[#*`>\-_~\[\]]/g, '').slice(0, 100)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {post.author_name || post.author_email} · {getAbsoluteDay(post.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recentPosts.map(post => (
                    <div
                      key={post.id}
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="flex flex-col group cursor-pointer bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:shadow-md transition-all"
                    >
                      <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-5 line-clamp-3 leading-relaxed text-sm flex-1">
                        {post.content.replace(/!\[[^\]]*\]\([^)]*\)/g, '[이미지]').replace(/[#*`>\-_~\[\]]/g, '').slice(0, 120)}
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
        )}

        {/* Team Section */}
        {!loading && config?.team_visible && (
          <section className="px-4 lg:px-20 py-20 bg-slate-50 dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-row items-center gap-16">
                <div className="flex-1 text-right">
                  {/* 겹치는 아바타 */}
                  {teamMembers.length > 0 && (
                    <div className="flex justify-end -space-x-4 mb-8">
                      {teamMembers.slice(0, 5).map((member) => (
                        <div
                          key={member.id}
                          className="w-14 h-14 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center text-white font-bold text-base shadow-lg shrink-0"
                          style={{ backgroundColor: member.avatar_color ?? '#3b82f6' }}
                          title={member.display_name ?? ''}
                        >
                          {(member.display_name ?? '?')[0].toUpperCase()}
                        </div>
                      ))}
                      {teamMembers.length > 5 && (
                        <div className="w-14 h-14 rounded-full border-4 border-white dark:border-slate-900 bg-primary flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          +{teamMembers.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                  <h2 className="text-4xl font-black mb-6">팀을 소개합니다</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
                    {config.team_description}
                  </p>
                  <button
                    onClick={() => navigate('/team')}
                    className="inline-block bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    팀 소개
                  </button>
                </div>
                <div className="flex-1 relative flex items-center justify-center">
                  {config.team_image_url ? (
                    <img
                      src={config.team_image_url}
                      alt="팀 이미지"
                      className="w-72 h-72 object-cover rounded-[40px] shadow-xl"
                    />
                  ) : (
                    <>
                      <div className="w-72 h-72 bg-primary/10 dark:bg-primary/5 rounded-[40px] absolute -rotate-6" />
                      <div className="relative z-10 w-72 h-72 bg-primary/20 dark:bg-primary/10 rounded-[40px]" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-900 px-4 lg:px-20 py-10 border-t border-slate-200 dark:border-slate-800">
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
