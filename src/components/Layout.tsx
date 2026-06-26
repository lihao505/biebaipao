import type { ReactNode } from 'react';
import Header from './Header';
import BottomDock from './BottomDock';
import ToastContainer from './Toast';

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
  mainClassName?: string;
}

export default function Layout({ children, hideFooter = false, mainClassName }: LayoutProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(0,113,227,0.16),transparent_60%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(52,199,89,0.06),transparent_50%)]" />
      <Header />
      <main
        className={
          'relative z-10 mx-auto w-full max-w-md px-4 pb-[calc(140px+env(safe-area-inset-bottom))] pt-6 page-slide-up ' +
          (mainClassName || '')
        }
      >
        {children}
      </main>
      {!hideFooter && (
        <footer className="relative z-10 pb-28 text-center text-xs text-[#86868b]">
          别白跑 · AI 线下办事教练
        </footer>
      )}
      <BottomDock />
      <ToastContainer />
    </div>
  );
}
