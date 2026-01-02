import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../api/config';
import type { Notification } from '../../types';
import type { RootState } from '../store';

interface NotificationsState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: NotificationsState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
};

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchAll',
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/api/notifications`, config);
            return response.data.notifications;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحميل الإشعارات');
        }
    }
);

// Fetch unread count
export const fetchUnreadCount = createAsyncThunk(
    'notifications/fetchUnreadCount',
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/api/notifications/unread-count`, config);
            return response.data.count;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحميل عدد الإشعارات');
        }
    }
);

// Mark notification as read
export const markAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId: string, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {}, config);
            return notificationId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحديث حالة الإشعار');
        }
    }
);

// Mark all notifications as read
export const markAllAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_BASE_URL}/api/notifications/read-all`, {}, config);
            return true;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحديث حالة الإشعارات');
        }
    }
);

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
                state.isLoading = false;
                state.notifications = action.payload;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch unread count
            .addCase(fetchUnreadCount.fulfilled, (state, action: PayloadAction<number>) => {
                state.unreadCount = action.payload;
            })
            // Mark as read
            .addCase(markAsRead.fulfilled, (state, action: PayloadAction<string>) => {
                const notification = state.notifications.find(n => n._id === action.payload);
                if (notification && !notification.isRead) {
                    notification.isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            // Mark all as read
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.notifications.forEach(n => {
                    n.isRead = true;
                });
                state.unreadCount = 0;
            });
    },
});

export const { clearError } = notificationsSlice.actions;
export default notificationsSlice.reducer;
