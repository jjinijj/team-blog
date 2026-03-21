import { useState, useEffect } from 'react';
import LogoMark from './LogoMark';
import { getSiteName, getCachedSiteName } from '../api/siteConfigApi';

const SiteFooter = () => {
  const [siteName, setSiteName] = useState<string | null>(getCachedSiteName());

  useEffect(() => {
    getSiteName().then(setSiteName).catch(() => {});
  }, []);

  return (
    <footer className="bg-slate-100 dark:bg-slate-900 px-4 lg:px-20 py-10 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <LogoMark size="sm" />
          {siteName && <span className="font-semibold text-slate-700 dark:text-slate-300">{siteName}</span>}
        </div>
        {siteName && <p className="text-slate-400 text-xs">© {new Date().getFullYear()} {siteName}. All rights reserved.</p>}
      </div>
    </footer>
  );
};

export default SiteFooter;
