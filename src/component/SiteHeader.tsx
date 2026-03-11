import { useNavigate, useLocation } from 'react-router-dom';
import LogoMark from './LogoMark';
import ProfileDropdown from './Profiledropdown';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Articles', path: '/blog' },
  { label: 'Team', path: '/team' },
  { label: 'Contact', path: '/contact' },
];

const SiteHeader = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 lg:px-20 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-3">
            <LogoMark size="md" />
            <h2 className="text-xl font-bold tracking-tight">Team Blog</h2>
          </button>
          <nav className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`text-sm transition-colors hover:text-primary ${
                  isActive(path)
                    ? 'font-semibold text-slate-900 dark:text-slate-100'
                    : 'font-medium text-slate-500 dark:text-slate-400'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
