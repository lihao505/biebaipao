import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/cn';
import Portal from './Portal';

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <Portal>
      <div className="fixed left-1/2 top-[calc(56px+env(safe-area-inset-top))] z-[200] flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex w-full items-center gap-2.5 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-xl animate-toast-in',
              toast.type === 'success' && 'bg-white/90 border-green-200',
              toast.type === 'info' && 'bg-white/90 border-blue-200',
              toast.type === 'warning' && 'bg-white/90 border-amber-200'
            )}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} className="flex-shrink-0 text-green-500" />}
            {toast.type === 'info' && <Info size={18} className="flex-shrink-0 text-blue-500" />}
            {toast.type === 'warning' && <AlertTriangle size={18} className="flex-shrink-0 text-amber-500" />}
            <span className="flex-1 text-sm text-gray-800">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </Portal>
  );
}
