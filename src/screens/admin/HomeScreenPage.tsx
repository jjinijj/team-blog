import { useState } from 'react';

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

  const [heroVisible, setHeroVisible] = useState(true);
  const [latestPostsVisible, setLatestPostsVisible] = useState(true);
  const [teamVisible, setTeamVisible] = useState(false);

  const [heroHeadline, setHeroHeadline] = useState('현대 개발자를 위한 인사이트');
  const [heroSubheadline, setHeroSubheadline] = useState(
    '소프트웨어 엔지니어링, UI 디자인, 커리어 성장에 관한 최신 트렌드를 만나보세요.'
  );
  const [heroCtaText, setHeroCtaText] = useState('최신 글 읽기');

  const [displayCount, setDisplayCount] = useState(6);
  const [sortOrder, setSortOrder] = useState('newest');
  const [cardLayout, setCardLayout] = useState<'grid' | 'list'>('grid');

  const [teamDescription, setTeamDescription] = useState(
    '저희는 아름답고 기능적인 소프트웨어를 만드는 것에 열정적인 소규모 팀입니다.'
  );

  const tabs: { id: ConfigTab; label: string }[] = [
    { id: 'layout', label: '레이아웃 빌더' },
    { id: 'global', label: '전체 설정' },
    { id: 'seo', label: 'SEO 및 메타데이터' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex flex-wrap justify-between items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              홈 화면 설정
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl">
              블로그 랜딩 페이지의 레이아웃과 섹션 표시 여부를 설정하세요.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-all">
            <span className="material-symbols-outlined text-lg">save</span>
            저장
          </button>
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
                <div className="flex items-center gap-4">
                  <Toggle checked={heroVisible} onChange={setHeroVisible} />
                </div>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      헤드라인
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
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
                <div className="flex items-center gap-4">
                  <Toggle checked={latestPostsVisible} onChange={setLatestPostsVisible} />
                </div>
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
                <div className="flex items-center gap-4">
                  <Toggle checked={teamVisible} onChange={setTeamVisible} />
                </div>
              </div>
              <div className="p-5 space-y-4">
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
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    현재 표시:{' '}
                    <span className="text-slate-900 dark:text-slate-100 font-bold">전체 멤버</span>
                  </span>
                  <button className="text-xs font-bold text-blue-500 hover:underline">
                    멤버 선택
                  </button>
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
