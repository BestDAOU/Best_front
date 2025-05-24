import React, { useState, useEffect, createContext, useContext } from 'react';

// 알림 컨텍스트 생성
const NotificationContext = createContext();

// 간단한 아이콘 컴포넌트들 (SVG)
const CheckCircle = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AlertCircle = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const AlertTriangle = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Info = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const X = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 알림 타입별 스타일 및 아이콘
const notificationTypes = {
  success: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-500',
    icon: CheckCircle
  },
  error: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-500',
    icon: AlertCircle
  },
  warning: {
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-500',
    icon: AlertTriangle
  },
  info: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500',
    icon: Info
  }
};

// 개별 알림 컴포넌트
const Notification = ({ notification, onRemove }) => {
  const { id, type, title, message, duration } = notification;
  const config = notificationTypes[type] || notificationTypes.info;
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  return (
    <div 
      className={`
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        border rounded-lg shadow-lg p-4 mb-3 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
      `}
      style={{
        animation: 'fadeInScale 0.3s ease-out'
      }}
    >
      <div className="flex items-start">
        <Icon className={`${config.iconColor} h-5 w-5 mt-0.5 mr-3 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-medium text-sm mb-1">{title}</h4>
          )}
          <p className="text-sm opacity-90">{message}</p>
        </div>
        <button
          onClick={() => onRemove(id)}
          className={`${config.textColor} hover:opacity-70 ml-2 flex-shrink-0 cursor-pointer`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* 애니메이션을 위한 스타일 */}
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// 알림 컨테이너 컴포넌트
const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div 
      className="fixed z-50 pointer-events-none"
      style={{ 
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999 
      }}
    >
      <div className="space-y-2 pointer-events-auto">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

// 알림 프로바이더 컴포넌트
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      duration: 5000, // 기본 5초
      ...notification
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const removeAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    removeAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

// 알림 훅
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification은 NotificationProvider 내부에서 사용해야 합니다');
  }

  const { addNotification, removeNotification, removeAllNotifications } = context;

  const showSuccess = (message, title, options = {}) => {
    return addNotification({ type: 'success', message, title, ...options });
  };

  const showError = (message, title, options = {}) => {
    return addNotification({ type: 'error', message, title, ...options });
  };

  const showWarning = (message, title, options = {}) => {
    return addNotification({ type: 'warning', message, title, ...options });
  };

  const showInfo = (message, title, options = {}) => {
    return addNotification({ type: 'info', message, title, ...options });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    removeAllNotifications
  };
};