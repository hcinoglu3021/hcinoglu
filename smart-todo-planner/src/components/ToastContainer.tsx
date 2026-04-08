import { useToastStore } from '../hooks/useToast';

export default function ToastContainer() {
  const toasts = useToastStore(s => s.toasts);
  const removeToast = useToastStore(s => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none" aria-live="polite">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto px-4 py-2.5 rounded-xl shadow-lg text-[13px] font-medium flex items-center gap-2 animate-toast-in min-w-[220px] max-w-[340px] ${
            toast.type === 'success' ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' :
            toast.type === 'error' ? 'bg-red-600 text-white' :
            'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
          }`}
          role="status"
        >
          {toast.type === 'success' && (
            <svg className="w-4 h-4 shrink-0 text-green-400 dark:text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          )}
          {toast.type === 'error' && (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
          )}
          <span className="flex-1 truncate">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-1 opacity-60 hover:opacity-100 shrink-0" aria-label="Dismiss">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
    </div>
  );
}
