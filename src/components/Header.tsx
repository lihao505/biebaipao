import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {!isHome && (
            <button
              onClick={() => navigate(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[#1d1d1f] shadow-sm transition-all hover:bg-white active:scale-95"
              aria-label="返回"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0071e3] text-xs font-semibold text-white shadow-[0_8px_18px_rgba(0,113,227,0.28)]">跑</span>
            <span className="text-[17px] font-semibold tracking-tight text-[#1d1d1f]">别白跑</span>
            <span className="hidden text-xs text-[#86868b] sm:inline">AI 线下办事教练</span>
          </button>
        </div>
        <div className="rounded-full bg-white/75 px-2.5 py-1 text-[11px] font-semibold text-[#0071e3] shadow-sm">
          v1.0
        </div>
      </div>
    </header>
  );
}
