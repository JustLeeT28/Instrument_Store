import { useEffect, useState } from 'react';

interface CartNotificationProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export const CartNotification: React.FC<CartNotificationProps> = ({
  message,
  visible,
  onClose,
  duration = 2000,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      // Trigger animation
      requestAnimationFrame(() => setIsVisible(true));

      const timer = setTimeout(() => {
        setIsVisible(false);
        // Wait for fade-out animation before calling onClose
        setTimeout(onClose, 300);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [visible, duration, onClose]);

  if (!visible && !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Notification card */}
      <div
        className={`relative flex flex-col items-center gap-4 rounded-2xl bg-white px-12 py-10 shadow-2xl transition-all duration-300 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-75 translate-y-4'
        }`}
      >
        {/* Checkmark circle */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <span
            className="material-symbols-outlined text-emerald-600"
            style={{ fontSize: '40px', fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>

        <p className="text-lg font-semibold text-slate-900">{message}</p>
      </div>
    </div>
  );
};