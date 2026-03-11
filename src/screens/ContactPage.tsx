import SiteHeader from '../component/SiteHeader';
import LogoMark from '../component/LogoMark';

const ContactPage = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">

      <SiteHeader />

      <main className="flex-grow flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '48px' }}>mail</span>
          </div>
          <h1 className="text-3xl font-black mb-4">Contact</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">준비 중입니다.</p>
        </div>
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

export default ContactPage;
