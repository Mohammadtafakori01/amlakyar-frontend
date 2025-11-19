import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../domains/auth/store/authSlice';
import usersReducer from '../domains/users/store/usersSlice';
import profileReducer from '../domains/profile/store/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

