import { useState, useEffect, useRef } from 'react';
import {
  fetchHomeScreenConfig,
  saveHomeScreenConfig,
  fetchTeamMembers,
  updateTeamMemberVisibility,
  type TeamMember,
} from '../../api/homeScreenApi';
import { uploadTeamImage, deleteTeamImage } from '../../api/imageApi';

type ConfigTab = 'layout' | 'global' | 'seo';

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <label className="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <div
      className={`relative w-11 h-6 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all ${
        checked ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
      } peer-checked:after:translate-x-full peer-checked:after:border-white`}
    />
    <span className={`ms-3 text-sm font-medium ${checked ? 'text-blue-500' : 'text-slate-400'}`}>
      {checked ? '표시' : '숨김'}
    </span>
  </label>
);

const HomeScreenPage = () => {
  const [activeTab, setActiveTab] = useState<ConfigTab>('layout');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<'success' | 'error' | null>(null);

  const [heroVisible, setHeroVisible] = useState(true);
  const [heroBadgeText, setHeroBadgeText] = useState('');
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubheadline, setHeroSubheadline] = useState('');
  const [heroCtaText, setHeroCtaText] = useState('');
  const [heroCtaUrl, setHeroCtaUrl] = useState('');

  const [latestPostsVisible, setLatestPostsVisible] = useState(true);
  const [displayCount, setDisplayCount] = useState(6);
  const [sortOrder, setSortOrder] = useState('newest');
  const [cardLayout, setCardLayout] = useState<'grid' | 'list'>('grid');

  const [teamVisible, setTeamVisible] = useState(false);
  const [teamDescription, setTeamDescription] = useState('');
  const [teamImageUrl, setTeamImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const tabs: { id: ConfigTab; label: string }[] = [
    { id: 'layout', label: '레이아웃 빌더' },
    { id: 'global', label: '전체 설정' },
    { id: 'seo', label: 'SEO 및 메타데이터' },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const [config, members] = await Promise.all([
          fetchHomeScreenConfig(),
          fetchTeamMembers(),
        ]);

        setHeroVisible(config.hero_visible);
        setHeroBadgeText(config.hero_badge_text);
        setHeroHeadline(config.hero_headline);
        setHeroSubheadline(config.hero_subheadline);
        setHeroCtaText(config.hero_cta_text);
        setHeroCtaUrl(config.hero_cta_url);
        setLatestPostsVisible(config.latest_posts_visible);
        setDisplayCount(config.latest_posts_count);
        setSortOrder(config.latest_posts_sort);
        setCardLayout(config.card_layout ?? 'grid');
        setTeamVisible(config.team_visible);
        setTeamDescription(config.team_description);
        setTeamImageUrl(config.team_image_url);
        setTeamMembers(members);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      await saveHomeScreenConfig({
        hero_visible: heroVisible,
        hero_badge_text: heroBadgeText,
        hero_headline: heroHeadline,
        hero_subheadline: heroSubheadline,
        hero_cta_text: heroCtaText,
        hero_cta_url: heroCtaUrl,
        latest_posts_visible: latestPostsVisible,
        latest_posts_count: displayCount,
        latest_posts_sort: sortOrder,
        card_layout: cardLayout,
        team_visible: teamVisible,
        team_description: teamDescription,
        team_image_url: teamImageUrl,
      });
      setSaveMessage('success');
    } catch {
      setSaveMessage('error');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleTeamImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setIsUploadingImage(true);
    try {
      if (teamImageUrl) await deleteTeamImage(teamImageUrl);
      const { url } = await uploadTeamImage(file);
      setTeamImageUrl(url);
    } catch (err) {
      alert('이미지 업로드에 실패했습니다.');
      console.error(err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleTeamImageRemove = async () => {
    if (!teamImageUrl) return;
    try {
      await deleteTeamImage(teamImageUrl);
      setTeamImageUrl(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTeamMemberToggle = async (userId: string, current: boolean) => {
    const next = !current;
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === userId ? { ...m, show_in_team: next } : m))
    );
    try {
      await updateTeamMemberVisibility(userId, next);
    } catch {
      // 실패 시 롤백
      setTeamMembers((prev) =>
        prev.map((m) => (m.id === userId ? { ...m, show_in_team: current } : m))
      );
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col gap-1 border-b border-slate-200 dark:border-slate-800 pb-6">
            <h2 className="text-slate-900 text-3xl font-black tracking-tight">홈 화면 설정</h2>
            <p className="text-slate-500 text-sm mt-1">블로그 랜딩 페이지의 레이아웃과 섹션 표시 여부를 설정하세요.</p>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <p className="text-red-400 text-sm">설정을 불러오지 못했습니다. 새로고침 해주세요.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex flex-wrap justify-between items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-slate-900 text-3xl font-black tracking-tight">
              홈 화면 설정
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              블로그 랜딩 페이지의 레이아웃과 섹션 표시 여부를 설정하세요.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saveMessage === 'success' && (
              <span className="text-sm text-green-600 font-medium">저장되었습니다.</span>
            )}
            {saveMessage === 'error' && (
              <span className="text-sm text-red-500 font-medium">저장에 실패했습니다.</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 disabled:opacity-60 transition-all"
            >
              <span className="material-symbols-outlined text-lg">save</span>
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 border-b-2 text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'layout' && (
          <div className="grid grid-cols-1 gap-6 pb-20">
            {/* 1. 히어로 섹션 */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-primary">campaign</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">1. 히어로 섹션</h3>
                    <p className="text-xs text-slate-500">페이지 상단의 메인 배너</p>
                  </div>
                </div>
                <Toggle checked={heroVisible} onChange={setHeroVisible} />
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      배지 텍스트
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      value={heroBadgeText}
                      onChange={(e) => setHeroBadgeText(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      헤드라인 <span className="text-xs text-slate-400 font-normal">(Enter로 줄바꿈)</span>
                    </label>
                    <textarea
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                      rows={2}
                      value={heroHeadline}
                      onChange={(e) => setHeroHeadline(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      서브 헤드라인
                    </label>
                    <textarea
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      rows={2}
                      value={heroSubheadline}
                      onChange={(e) => setHeroSubheadline(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      버튼 텍스트
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      value={heroCtaText}
                      onChange={(e) => setHeroCtaText(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      버튼 링크 URL
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="/blog"
                      value={heroCtaUrl}
                      onChange={(e) => setHeroCtaUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 2. 최신 글 섹션 */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-primary">feed</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">2. 최신 글 섹션</h3>
                    <p className="text-xs text-slate-500">최근 작성된 글 목록</p>
                  </div>
                </div>
                <Toggle checked={latestPostsVisible} onChange={setLatestPostsVisible} />
              </div>
              <div className="p-5 flex flex-wrap gap-12">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    표시 개수
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDisplayCount((c) => Math.max(1, c - 1))}
                      className="size-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold">{displayCount}</span>
                    <button
                      onClick={() => setDisplayCount((c) => c + 1)}
                      className="size-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    정렬 순서
                  </label>
                  <select
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm p-2 px-3 focus:ring-blue-500 outline-none"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="newest">최신순</option>
                    <option value="popular">인기순</option>
                    <option value="random">랜덤</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    카드 레이아웃
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCardLayout('grid')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        cardLayout === 'grid'
                          ? 'bg-blue-500 text-white'
                          : 'border border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      그리드
                    </button>
                    <button
                      onClick={() => setCardLayout('list')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        cardLayout === 'list'
                          ? 'bg-blue-500 text-white'
                          : 'border border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      리스트
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. 팀 소개 섹션 */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-primary">diversity_3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">3. 팀 소개 섹션</h3>
                    <p className="text-xs text-slate-500">팀원을 소개하는 섹션</p>
                  </div>
                </div>
                <Toggle checked={teamVisible} onChange={setTeamVisible} />
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    팀 소개 문구
                  </label>
                  <textarea
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="팀을 간략히 소개해 주세요..."
                    rows={2}
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                  />
                </div>

                {/* 팀 이미지 */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    팀 이미지
                  </label>
                  {teamImageUrl ? (
                    <div className="space-y-2">
                      <img
                        src={teamImageUrl}
                        alt="팀 이미지"
                        className="w-full max-w-sm h-48 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => imageInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                        >
                          {isUploadingImage ? '업로드 중...' : '이미지 교체'}
                        </button>
                        <button
                          onClick={handleTeamImageRemove}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          이미지 제거
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="w-full max-w-sm h-32 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-400 disabled:opacity-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-3xl">
                        {isUploadingImage ? 'hourglass_empty' : 'add_photo_alternate'}
                      </span>
                      <span className="text-xs font-medium">
                        {isUploadingImage ? '업로드 중...' : '이미지 업로드'}
                      </span>
                    </button>
                  )}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleTeamImageUpload}
                  />
                </div>

                {/* 팀원 목록 */}
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                    팀원 노출 설정
                  </p>
                  <div className="space-y-2">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: member.avatar_color ?? '#3b82f6' }}
                          >
                            {(member.display_name ?? '?')[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {member.display_name ?? '이름 없음'}
                          </span>
                        </div>
                        <Toggle
                          checked={member.show_in_team}
                          onChange={() => handleTeamMemberToggle(member.id, member.show_in_team)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'global' && (
          <div className="pb-20">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex items-center justify-center min-h-40">
              <p className="text-slate-400 text-sm">전체 설정 — 준비 중입니다.</p>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="pb-20">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex items-center justify-center min-h-40">
              <p className="text-slate-400 text-sm">SEO 및 메타데이터 — 준비 중입니다.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreenPage;
