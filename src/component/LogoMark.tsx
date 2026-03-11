interface LogoMarkProps {
  size?: 'sm' | 'md' | 'lg';
}

const LogoMark = ({ size = 'md' }: LogoMarkProps) => {
  const config = {
    sm: { bracket: 'text-sm font-bold', box: 'w-4 h-4 text-[10px] rounded', gap: 'gap-0.5' },
    md: { bracket: 'text-lg font-bold', box: 'w-6 h-6 text-xs rounded-md', gap: 'gap-1' },
    lg: { bracket: 'text-3xl font-bold', box: 'w-10 h-10 text-lg rounded-lg', gap: 'gap-1.5' },
  }[size];

  return (
    <div className={`flex items-center ${config.gap}`}>
      <span className="text-[#3B82F6] font-black leading-none" style={{ fontFamily: 'monospace' }}>&lt;</span>
      <div className={`bg-[#1F2937] text-white font-black flex items-center justify-center ${config.box}`} style={{ fontFamily: 'monospace' }}>
        K
      </div>
      <span className="text-[#3B82F6] font-black leading-none" style={{ fontFamily: 'monospace' }}>/&gt;</span>
    </div>
  );
};

export default LogoMark;
