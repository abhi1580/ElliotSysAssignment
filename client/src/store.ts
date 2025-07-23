import { configureStore } from '@reduxjs/toolkit';

// Import reducers (to be created)
// import authReducer from './features/auth/authSlice';
// import tasksReducer from './features/tasks/tasksSlice';

const store = configureStore({
  reducer: {
    // auth: authReducer,
    // tasks: tasksReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store; 