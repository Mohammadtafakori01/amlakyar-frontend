import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../app/store';
import { fetchUsers, fetchUserById, createUser, updateUser, deleteUser, setSelectedUser, setFilters, clearError, createStaff, searchUsers, clearSearch } from '../store/usersSlice';
import { UserFilters, CreateUserRequest, UpdateUserRequest, CreateStaffRequest, SearchUsersQuery } from '../types';

export const useUsers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector((state: RootState) => state.users);

  return {
    ...users,
    fetchUsers: (filters?: UserFilters) => dispatch(fetchUsers(filters)),
    fetchUserById: (id: string) => dispatch(fetchUserById(id)),
    createUser: (data: CreateUserRequest) => dispatch(createUser(data)),
    createStaff: (data: CreateStaffRequest) => dispatch(createStaff(data)),
    updateUser: (id: string, data: UpdateUserRequest) => dispatch(updateUser({ id, data })),
    deleteUser: (id: string) => dispatch(deleteUser(id)),
    setSelectedUser: (user: any) => dispatch(setSelectedUser(user)),
    setFilters: (filters: UserFilters) => dispatch(setFilters(filters)),
    clearError: () => dispatch(clearError()),
    searchUsers: (query: SearchUsersQuery) => dispatch(searchUsers(query)),
    clearSearch: () => dispatch(clearSearch()),
  };
};

