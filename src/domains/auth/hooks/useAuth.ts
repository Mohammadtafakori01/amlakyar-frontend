import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../app/store';
import { logout as logoutAction, setUser, clearError } from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const logout = () => {
    dispatch(logoutAction());
  };

  const updateUser = (user: any) => {
    dispatch(setUser(user));
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    ...auth,
    logout,
    updateUser,
    clearError: clearAuthError,
  };
};

