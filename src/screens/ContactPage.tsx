import SiteHeader from '../component/SiteHeader';
import SiteFooter from '../component/SiteFooter';

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

      <SiteFooter />

    </div>
  );
};

export default ContactPage;
