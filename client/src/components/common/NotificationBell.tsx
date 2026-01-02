import { useEffect, useState } from 'react';
import { Bell, Check, X, Calendar, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchNotifications, markAsRead, markAllAsRead } from '../../redux/slices/notificationsSlice';
import type { Notification } from '../../types';

const NotificationBell = () => {
    const dispatch = useAppDispatch();
    const { notifications, unreadCount, isLoading } = useAppSelector(state => state.notifications);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchNotifications());

        // Poll for new notifications every 30 seconds
        const interval = setInterval(() => {
            dispatch(fetchNotifications());
        }, 30000);

        return () => clearInterval(interval);
    }, [dispatch]);

    const handleMarkAsRead = (notification: Notification) => {
        if (!notification.isRead) {
            dispatch(markAsRead(notification._id));
        }
    };

    const handleMarkAllAsRead = () => {
        dispatch(markAllAsRead());
    };

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'interview_scheduled':
            case 'interview_reminder':
                return <Calendar size={16} className="text-amber-400" />;
            case 'student_accepted':
                return <Check size={16} className="text-emerald-400" />;
            case 'student_rejected':
                return <X size={16} className="text-red-400" />;
            default:
                return <Bell size={16} className="text-blue-400" />;
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        return `منذ ${days} يوم`;
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl bg-(--bg-tertiary) hover:bg-(--bg-card) transition-colors"
            >
                <Bell size={20} className="text-(--text-secondary)" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Notifications Panel */}
                    <div className="absolute left-0 top-full mt-2 w-80 max-h-96 bg-[var(--bg-card)] border border-(--border-color) rounded-xl shadow-2xl z-50 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-(--border-color)">
                            <h3 className="font-bold text-(--text-primary)">الإشعارات</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-(--accent-primary) hover:underline"
                                >
                                    تحديد الكل كمقروء
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-72 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 size={24} className="animate-spin text-(--accent-primary)" />
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.slice(0, 10).map((notification) => (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleMarkAsRead(notification)}
                                        className={`p-4 border-b border-(--border-color) cursor-pointer hover:bg-(--bg-tertiary) transition-colors ${!notification.isRead ? 'bg-(--accent-primary)/5' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-(--bg-tertiary)">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-(--text-primary) line-clamp-1">
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-(--text-secondary) line-clamp-2 mt-1">
                                                    {notification.message}
                                                </p>
                                                <span className="text-xs text-(--text-muted) mt-2 block">
                                                    {formatTime(notification.createdAt)}
                                                </span>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-(--text-muted)">
                                    <Bell size={32} className="mb-2 opacity-50" />
                                    <p className="text-sm">لا توجد إشعارات</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 10 && (
                            <div className="p-3 border-t border-(--border-color) text-center">
                                <button className="text-sm text-(--accent-primary) hover:underline">
                                    عرض كل الإشعارات
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
