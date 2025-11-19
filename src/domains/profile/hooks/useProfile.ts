import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '../../../app/store';
import { fetchProfile, clearError } from '../store/profileSlice';

export const useProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.profile);

  const fetchProfileMemoized = useCallback(() => {
    return dispatch(fetchProfile());
  }, [dispatch]);

  const clearErrorMemoized = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    ...profile,
    fetchProfile: fetchProfileMemoized,
    clearError: clearErrorMemoized,
  };
};

