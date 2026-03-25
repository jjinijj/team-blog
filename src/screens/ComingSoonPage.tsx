import { useState } from 'react';
import emailjs from '@emailjs/browser';
import SiteFooter from '../component/SiteFooter';
import LogoMark from '../component/LogoMark';

function ComingSoonPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        { from_email: email, message },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );
      setStatus('success');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Main */}
      <main className="flex-grow flex flex-col items-center justify-center px-8 py-20 text-center relative overflow-hidden">
        {/* Background blur elements */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] blur-[120px] rounded-full" style={{ background: 'rgba(19,127,236,0.05)' }} />
          <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[50%] blur-[100px] rounded-full" style={{ background: 'rgba(14,165,233,0.05)' }} />
        </div>

        <div className="relative z-10 w-full">
          {/* Logo */}
          <div className="mb-16 flex flex-col items-center gap-4">
            <LogoMark size="lg" />
          </div>

          {/* Hero */}
          <div className="max-w-[740px] mx-auto">
            <h1 className="text-4xl md:text-[3rem] font-bold leading-tight tracking-tight text-slate-900 mb-6">
              곧 찾아뵙겠습니다.
            </h1>
            <p className="text-lg leading-relaxed text-slate-500 mb-12">
              저희 Team Kla Studio는 현재 단장 중입니다.
            </p>

            {/* Contact Form */}
            <div className="max-w-md mx-auto">
              {status === 'success' ? (
                <div className="py-10 flex flex-col items-center gap-3">
                  <span className="text-3xl">✓</span>
                  <p className="text-slate-700 font-semibold">문의가 전송되었습니다.</p>
                  <p className="text-slate-400 text-sm">빠른 시일 내에 회신드리겠습니다.</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-4 text-sm text-blue-500 underline"
                  >
                    다시 문의하기
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
                  <textarea
                    required
                    placeholder="문의 내용"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 rounded-lg text-slate-900 placeholder:text-slate-400 outline-none resize-none transition-all"
                  />
                  <input
                    type="email"
                    required
                    placeholder="회신받을 이메일 주소"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 rounded-lg text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                  />
                  {status === 'error' && (
                    <p className="text-red-500 text-sm">전송에 실패했습니다. 다시 시도해 주세요.</p>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full px-8 py-4 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                    style={{ backgroundColor: '#137fec' }}
                  >
                    {status === 'sending' ? '전송 중...' : '문의하기'}
                  </button>
                </form>
              )}

              <div className="mt-6 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(19,127,236,0.4)' }} />
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">
                  궁금한 점이 있으시면 언제든 문의해 주세요.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default ComingSoonPage;
