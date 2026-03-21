import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LogoMark from '../component/LogoMark';
import { ROUTES } from '../types/routes';
import { getSiteName, getCachedSiteName } from '../api/siteConfigApi';

type AuthMode = 'login' | 'signup';

interface AuthScreenProp {
    goToMain : () => void;

}

const AuthScreen = ({goToMain} : AuthScreenProp) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [siteName, setSiteNameState] = useState<string | null>(getCachedSiteName());

  useEffect(() => {
    getSiteName().then(setSiteNameState).catch(() => {});
  }, []);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 유효성 검사
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      setLoading(false);
      return;
    }

    if (mode === 'signup' && !displayName.trim()) {
      setError('이름을 입력해주세요.');
      setLoading(false);
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    try {
      const { error } = mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password, displayName);

      if (error) {
        setError(error.message);
      }else{

        if(mode === 'signup'){
            alert('회원가입이 완료되었습니다.');
            goToMain();
        }else if(mode === 'login'){
            goToMain();
        }
      }
    } catch (err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
    
    
    
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setDisplayName('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden px-4 py-12 bg-gray-50">
      {/* Header/Logo Area */}
      <div className="mb-12 flex flex-col items-center gap-4">
        <button onClick={() => navigate(ROUTES.HOME)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <LogoMark size="lg" />
          {siteName && <span className="text-xl font-bold tracking-tight">{siteName}</span>}
        </button>
        <h1 className="text-gray-900 tracking-tight text-[32px] font-bold leading-tight">
          {mode === 'login' ? '다시 오신 것을 환영합니다' : '팀에 합류하세요'}
        </h1>
        <p className="text-gray-600 text-base font-normal">
          {mode === 'login' 
            ? '계속하려면 로그인하세요' 
            : '시작하려면 계정을 만드세요'}
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-[400px] flex flex-col gap-6">
        {/* Email Field */}
        <div className="flex flex-col w-full">
          <label className="flex flex-col w-full">
            <p className="text-gray-900 text-sm font-semibold leading-normal pb-2 uppercase tracking-wider">
              이메일 주소
            </p>
            <input
              className="form-input flex w-full rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-blue-600/20 border border-gray-300 bg-white focus:border-blue-600 h-14 placeholder:text-gray-400 p-[15px] text-base font-normal transition-all"
              placeholder="name@company.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </label>
        </div>

        {/* Display Name Field (회원가입 시에만) */}
        {mode === 'signup' && (
          <div className="flex flex-col w-full">
            <label className="flex flex-col w-full">
              <p className="text-gray-900 text-sm font-semibold leading-normal pb-2 uppercase tracking-wider">
                이름
              </p>
              <input
                className="form-input flex w-full rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-blue-600/20 border border-gray-300 bg-white focus:border-blue-600 h-14 placeholder:text-gray-400 p-[15px] text-base font-normal transition-all"
                placeholder="팀에서 사용할 이름을 입력하세요"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
              />
            </label>
          </div>
        )}

        {/* Password Field */}
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between pb-2">
            <p className="text-gray-900 text-sm font-semibold leading-normal uppercase tracking-wider">
              비밀번호
            </p>
          </div>
          <div className="relative flex w-full items-stretch rounded-lg">
            <input
              className="form-input flex w-full rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-blue-600/20 border border-gray-300 bg-white focus:border-blue-600 h-14 placeholder:text-gray-400 p-[15px] pr-12 text-base font-normal transition-all"
              placeholder="비밀번호를 입력하세요"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Confirm Password Field (회원가입 시에만) */}
        {mode === 'signup' && (
          <div className="flex flex-col w-full">
            <p className="text-gray-900 text-sm font-semibold leading-normal pb-2 uppercase tracking-wider">
              비밀번호 확인
            </p>
            <input
              className="form-input flex w-full rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-blue-600/20 border border-gray-300 bg-white focus:border-blue-600 h-14 placeholder:text-gray-400 p-[15px] text-base font-normal transition-all"
              placeholder="비밀번호를 다시 입력하세요"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-4 bg-blue-600 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="truncate">
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-xs font-medium uppercase tracking-widest">
            또는
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Toggle Mode Section */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-600 text-sm">
            {mode === 'login' 
              ? "계정이 없으신가요?" 
              : "이미 계정이 있으신가요?"}
          </p>
          <button
            type="button"
            onClick={toggleMode}
            className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-bold transition-all"
          >
            {mode === 'login' ? '가입하기' : '로그인'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AuthScreen;