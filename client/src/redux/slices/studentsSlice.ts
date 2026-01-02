import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../api/config';
import type { Student } from '../../types';
import type { RootState } from '../store';

interface StudentsState {
    students: Student[];
    currentStudent: Student | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: StudentsState = {
    students: [],
    currentStudent: null,
    isLoading: false,
    error: null,
};

export const fetchStudents = createAsyncThunk(
    'students/fetchAll',
    async (filters: { halqa?: string; stage?: string } | undefined, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            let url = `${API_BASE_URL}/api/students`;
            if (filters) {
                const params = new URLSearchParams();
                if (filters.halqa) params.append('halqa', filters.halqa);
                if (filters.stage) params.append('stage', filters.stage);
                url += `?${params.toString()}`;
            }
            const response = await axios.get(url, config);
            return response.data.students;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحميل الطلاب');
        }
    }
);

export const fetchStudentsByHalqa = createAsyncThunk(
    'students/fetchByHalqa',
    async (halqaId: string, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/api/students/halqa/${halqaId}`, config);
            return response.data.students;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحميل طلاب الحلقة');
        }
    }
);

export const createStudent = createAsyncThunk(
    'students/create',
    async (studentData: Partial<Student> & { guardian: any }, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.post(`${API_BASE_URL}/api/students`, studentData, config);
            return response.data.student;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تسجيل الطالب');
        }
    }
);

export const updateStudent = createAsyncThunk(
    'students/update',
    async ({ id, data }: { id: string; data: Partial<Student> }, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.put(`${API_BASE_URL}/api/students/${id}`, data, config);
            return response.data.student;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل تحديث بيانات الطالب');
        }
    }
);

export const deleteStudent = createAsyncThunk(
    'students/delete',
    async (id: string, { rejectWithValue, getState }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API_BASE_URL}/api/students/${id}`, config);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'فشل حذف الطالب');
        }
    }
);

const studentsSlice = createSlice({
    name: 'students',
    initialState,
    reducers: {
        setCurrentStudent: (state, action: PayloadAction<Student | null>) => {
            state.currentStudent = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudents.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchStudents.fulfilled, (state, action: PayloadAction<Student[]>) => {
                state.isLoading = false;
                state.students = action.payload;
            })
            .addCase(fetchStudents.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchStudentsByHalqa.fulfilled, (state, action: PayloadAction<Student[]>) => {
                state.students = action.payload;
            })
            .addCase(createStudent.fulfilled, (state, action: PayloadAction<Student>) => {
                state.students.push(action.payload);
            })
            .addCase(updateStudent.fulfilled, (state, action: PayloadAction<Student>) => {
                const index = state.students.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.students[index] = action.payload;
                }
            })
            .addCase(deleteStudent.fulfilled, (state, action: PayloadAction<string>) => {
                state.students = state.students.filter(s => s._id !== action.payload);
            });
    },
});

export const { setCurrentStudent } = studentsSlice.actions;
export default studentsSlice.reducer;
