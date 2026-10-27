import React from 'react';
import { AlertCircle, Bell, Mail, Smartphone, X } from 'lucide-react';
import { useTicketContext } from '../context/TicketContext';

export const ToastNotification: React.FC = () => {
  const { activeToast, dismissToast, setIsNotificationCenterOpen } = useTicketContext();

  if (!activeToast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-xl shrink-0 ${
            activeToast.channel === 'SMS'
              ? 'bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400'
              : activeToast.channel === 'EMAIL'
              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
              : 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
          }`}
        >
          {activeToast.channel === 'SMS' && <Smartphone className="w-5 h-5" />}
          {activeToast.channel === 'EMAIL' && <Mail className="w-5 h-5" />}
          {activeToast.channel === 'PUSH' && <Bell className="w-5 h-5" />}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Alerta em Tempo Real · {activeToast.channel}
            </span>
            <button
              onClick={dismissToast}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
            {activeToast.title}
          </h4>

          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {activeToast.message}
          </p>

          <div className="pt-1.5 flex items-center justify-end gap-2">
            <button
              onClick={() => {
                dismissToast();
                setIsNotificationCenterOpen(true);
              }}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Abrir Central de Disparos &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
