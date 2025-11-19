import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import RoleGuard from '../../../src/shared/components/guards/RoleGuard';
import { useUsers } from '../../../src/domains/users/hooks/useUsers';
import { useAuth } from '../../../src/domains/auth/hooks/useAuth';
import { UserRole, CreateUserRequest, UpdateUserRequest, UserFilters } from '../../../src/shared/types';
import Loading from '../../../src/shared/components/common/Loading';
import ErrorDisplay from '../../../src/shared/components/common/ErrorDisplay';
import { validatePhoneNumber, validateNationalId, validatePassword } from '../../../src/shared/utils/validation';
import { AppDispatch } from '../../../src/app/store';
import { fetchUsers as fetchUsersThunk } from '../../../src/domains/users/store/usersSlice';

export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, fetchUsers, createUser, updateUser, deleteUser, isLoading, error, selectedUser, setSelectedUser, filters } = useUsers();
  const { user: currentUser } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [showFilters, setShowFilters] = useState(false);
  const hasFetched = useRef(false);
  
  const [formData, setFormData] = useState<CreateUserRequest & { isActive?: boolean; isApproved?: boolean }>({
    phoneNumber: '',
    firstName: '',
    lastName: '',
    nationalId: '',
    password: '',
    role: UserRole.CUSTOMER,
    isActive: true,
    isApproved: true,
  });

  const [localFilters, setLocalFilters] = useState<UserFilters>({
    role: filters?.role,
    estateId: filters?.estateId,
  });

  useEffect(() => {
    // Only fetch once on mount to prevent infinite loops
    if (!hasFetched.current) {
      hasFetched.current = true;
      dispatch(fetchUsersThunk(localFilters));
    }
  }, [dispatch]);

  const handleApplyFilters = () => {
    dispatch(fetchUsersThunk(localFilters));
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    dispatch(fetchUsersThunk());
  };

  const handleOpenDialog = (user?: any) => {
    if (user) {
      setIsEdit(true);
      setSelectedUser(user);
      setFormData({
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        nationalId: user.nationalId,
        password: '',
        role: user.role,
        estateId: user.estateId,
        isActive: user.isActive,
        isApproved: user.isApproved,
      });
    } else {
      setIsEdit(false);
      setSelectedUser(null);
      setFormData({
        phoneNumber: '',
        firstName: '',
        lastName: '',
        nationalId: '',
        password: '',
        role: UserRole.CUSTOMER,
        isActive: true,
        isApproved: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSubmit = async () => {
    if (!validatePhoneNumber(formData.phoneNumber) || 
        !validateNationalId(formData.nationalId)) {
      setSnackbar({ open: true, message: 'لطفا اطلاعات را به درستی وارد کنید', severity: 'error' });
      return;
    }
    
    // Validate password if provided (it's optional for create, but if provided must be at least 6 chars)
    if (formData.password && !validatePassword(formData.password)) {
      setSnackbar({ open: true, message: 'رمز عبور باید حداقل 6 کاراکتر باشد', severity: 'error' });
      return;
    }

    try {
      if (isEdit && selectedUser) {
        const updateData: UpdateUserRequest = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          nationalId: formData.nationalId,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
          isActive: formData.isActive,
          isApproved: formData.isApproved,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        if (formData.estateId !== undefined) {
          updateData.estateId = formData.estateId;
        }
        await updateUser(selectedUser.id, updateData);
        setSnackbar({ open: true, message: 'کاربر با موفقیت به‌روزرسانی شد', severity: 'success' });
      } else {
        const createData: CreateUserRequest = {
          phoneNumber: formData.phoneNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          nationalId: formData.nationalId,
          password: formData.password,
          role: formData.role,
        };
        if (formData.estateId) {
          createData.estateId = formData.estateId;
        }
        await createUser(createData);
        setSnackbar({ open: true, message: 'کاربر با موفقیت ایجاد شد', severity: 'success' });
      }
      handleCloseDialog();
      dispatch(fetchUsersThunk(localFilters));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'خطا در انجام عملیات';
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
      try {
        await deleteUser(userId);
        setSnackbar({ open: true, message: 'کاربر با موفقیت حذف شد', severity: 'success' });
        dispatch(fetchUsersThunk(localFilters));
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'خطا در حذف کاربر';
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      }
    }
  };

  const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      [UserRole.CUSTOMER]: 'مشتری',
      [UserRole.CONSULTANT]: 'مشاور',
      [UserRole.SECRETARY]: 'منشی',
      [UserRole.SUPERVISOR]: 'ناظر',
      [UserRole.ADMIN]: 'مدیر',
      [UserRole.MASTER]: 'مستر',
    };
    return labels[role] || role;
  };

  const allowedRoles = currentUser?.role === UserRole.MASTER
    ? [UserRole.CUSTOMER, UserRole.CONSULTANT, UserRole.SECRETARY, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.MASTER]
    : currentUser?.role === UserRole.ADMIN
    ? [UserRole.CONSULTANT, UserRole.SECRETARY, UserRole.SUPERVISOR]
    : [];

  const allRoles = [
    UserRole.CUSTOMER,
    UserRole.CONSULTANT,
    UserRole.SECRETARY,
    UserRole.SUPERVISOR,
    UserRole.ADMIN,
    UserRole.MASTER,
  ];

  return (
    <PrivateRoute>
      <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.MASTER]}>
        <DashboardLayout>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4">مدیریت کاربران</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  فیلترها
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  افزودن کاربر
                </Button>
              </Box>
            </Box>

            {showFilters && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>نقش</InputLabel>
                      <Select
                        value={localFilters.role || ''}
                        label="نقش"
                        onChange={(e) => setLocalFilters({ ...localFilters, role: e.target.value as UserRole || undefined })}
                      >
                        <MenuItem value="">همه</MenuItem>
                        {allRoles.map((role) => (
                          <MenuItem key={role} value={role}>
                            {getRoleLabel(role)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="شناسه املاک"
                      value={localFilters.estateId || ''}
                      onChange={(e) => setLocalFilters({ ...localFilters, estateId: e.target.value || undefined })}
                      fullWidth
                      placeholder="UUID"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="contained" onClick={handleApplyFilters}>
                        اعمال فیلتر
                      </Button>
                      <Button variant="outlined" onClick={handleClearFilters}>
                        پاک کردن
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}

            <ErrorDisplay error={error} />

            {isLoading ? (
              <Loading />
            ) : (
              <TableContainer component={Paper} sx={{ mx: 'auto', maxWidth: '100%' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>نام</TableCell>
                      <TableCell>شماره موبایل</TableCell>
                      <TableCell>کد ملی</TableCell>
                      <TableCell>نقش</TableCell>
                      <TableCell>وضعیت</TableCell>
                      <TableCell>تایید شده</TableCell>
                      {currentUser?.role === UserRole.MASTER && <TableCell>شناسه املاک</TableCell>}
                      <TableCell>عملیات</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={currentUser?.role === UserRole.MASTER ? 8 : 7} align="center">
                          <Typography variant="body2" color="text.secondary">
                            کاربری یافت نشد
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.firstName} {user.lastName}</TableCell>
                          <TableCell>{user.phoneNumber}</TableCell>
                          <TableCell>{user.nationalId}</TableCell>
                          <TableCell>
                            <Chip label={getRoleLabel(user.role)} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.isActive ? 'فعال' : 'غیرفعال'}
                              color={user.isActive ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.isApproved ? 'بله' : 'خیر'}
                              color={user.isApproved ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          {currentUser?.role === UserRole.MASTER && (
                            <TableCell>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                {user.estateId || '-'}
                              </Typography>
                            </TableCell>
                          )}
                          <TableCell>
                            <IconButton size="small" onClick={() => handleOpenDialog(user)}>
                              <EditIcon />
                            </IconButton>
                            {currentUser?.role === UserRole.MASTER && (
                              <IconButton size="small" onClick={() => handleDelete(user.id)} color="error">
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
              <DialogTitle>{isEdit ? 'ویرایش کاربر' : 'افزودن کاربر'}</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <TextField
                    label="نام"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    fullWidth
                    required
                  />
                  <TextField
                    label="نام خانوادگی"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    fullWidth
                    required
                  />
                  <TextField
                    label="شماره موبایل"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    fullWidth
                    required
                    placeholder="09123456789"
                    inputProps={{ maxLength: 11 }}
                  />
                  <TextField
                    label="کد ملی"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    fullWidth
                    required
                    inputProps={{ maxLength: 10 }}
                  />
                  <TextField
                    label="نقش"
                    select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    fullWidth
                    required
                  >
                    {allowedRoles.map((role) => (
                      <MenuItem key={role} value={role}>
                        {getRoleLabel(role)}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="رمز عبور"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    fullWidth
                    required={false}
                    helperText={isEdit ? 'در صورت خالی بودن تغییر نمی‌کند' : 'اختیاری - حداقل 6 کاراکتر در صورت وارد کردن'}
                  />
                  {currentUser?.role === UserRole.MASTER && (
                    <TextField
                      label="شناسه املاک (اختیاری)"
                      value={formData.estateId || ''}
                      onChange={(e) => setFormData({ ...formData, estateId: e.target.value || undefined })}
                      fullWidth
                      placeholder="UUID"
                    />
                  )}
                  {isEdit && (
                    <>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isActive ?? true}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          />
                        }
                        label="فعال"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isApproved ?? true}
                            onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                          />
                        }
                        label="تایید شده"
                      />
                    </>
                  )}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>انصراف</Button>
                <Button onClick={handleSubmit} variant="contained">
                  {isEdit ? 'ذخیره' : 'ایجاد'}
                </Button>
              </DialogActions>
            </Dialog>

            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
              <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
          </Box>
        </DashboardLayout>
      </RoleGuard>
    </PrivateRoute>
  );
}

