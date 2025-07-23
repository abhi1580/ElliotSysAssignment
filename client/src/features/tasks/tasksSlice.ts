import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'incomplete' | 'complete';
}

interface TasksState {
  tasks: Task[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  total: 0,
  loading: false,
  error: null,
};

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params: any, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/tasks', { ...getAuthHeader(), params });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Fetch tasks failed');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (task: Partial<Task>, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/tasks', task, getAuthHeader());
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Create task failed');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, updates }: { id: string; updates: Partial<Task> }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/tasks/${id}`, updates, getAuthHeader());
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Update task failed');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/tasks/${id}`, getAuthHeader());
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Delete task failed');
    }
  }
);

export const toggleTaskStatus = createAsyncThunk(
  'tasks/toggleTaskStatus',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`/api/tasks/${id}/toggle`, {}, getAuthHeader());
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Toggle status failed');
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.total = action.payload.total;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(t => t._id === action.payload._id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t._id !== action.payload);
        state.total -= 1;
      })
      .addCase(toggleTaskStatus.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(t => t._id === action.payload._id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      });
  },
});

export default tasksSlice.reducer; 