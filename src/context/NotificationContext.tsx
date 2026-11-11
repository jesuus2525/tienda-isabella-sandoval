import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
// 👇 estas son las exportaciones
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

interface NotificationContextType {
  notify: (args: { title?: string; message: string; type?: NotificationType; duration?: number }) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const typeStyles: Record<NotificationType, { bg: string; accent: string; icon: ReactNode }> = {
  success: {
    bg: 'bg-emerald-600/95',
    accent: 'border-emerald-300/30',
    icon: <CheckCircle2 size={18} className="text-white" />,
  },
  error: {
    bg: 'bg-rose-600/95',
    accent: 'border-rose-300/30',
    icon: <AlertCircle size={18} className="text-white" />,
  },
  info: {
    bg: 'bg-sky-600/95',
    accent: 'border-sky-300/30',
    icon: <Info size={18} className="text-white" />,
  },
  warning: {
    bg: 'bg-amber-500/95',
    accent: 'border-amber-300/30',
    icon: <AlertCircle size={18} className="text-white" />,
  },
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const notify = ({ title, message, type = 'info', duration = 4000 }: { title?: string; message: string; type?: NotificationType; duration?: number }) => {
    const id = Date.now() + Math.random();
    const item: NotificationItem = { id, title: title || (type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : type === 'warning' ? 'Advertencia' : 'Información'), message, type, duration };

    setNotifications((current) => [...current, item]);

    window.setTimeout(() => {
      setNotifications((current) => current.filter((notification) => notification.id !== id));
    }, duration);
  };

  const value = useMemo(() => ({ notify }), []);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[min(92vw,360px)] flex-col gap-3">
        {notifications.map((notification) => {
          const style = typeStyles[notification.type];
          return (
            <div
              key={notification.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border ${style.accent} ${style.bg} p-4 text-white shadow-2xl backdrop-blur-sm transition-all duration-300`}
            >
              <div className="mt-0.5 flex-shrink-0">{style.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/80">{notification.title}</p>
                <p className="mt-1 text-sm font-medium text-white">{notification.message}</p>
              </div>
              <button
                type="button"
                aria-label="Cerrar notificación"
                onClick={() => setNotifications((current) => current.filter((item) => item.id !== notification.id))}
                className="rounded-full p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider');
  }

  return context;
};
