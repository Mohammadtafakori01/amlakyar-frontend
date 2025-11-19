import { useEffect, useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import RoleGuard from '../../../src/shared/components/guards/RoleGuard';
import { useAuth } from '../../../src/domains/auth/hooks/useAuth';
import { AppDispatch } from '../../../src/app/store';
import { useDispatch } from 'react-redux';
import { registerConsultant, getConsultants } from '../../../src/domains/auth/store/authSlice';
import { UserRole } from '../../../src/shared/types';
import Loading from '../../../src/shared/components/common/Loading';
import { validatePhoneNumber, validateNationalId } from '../../../src/shared/utils/validation';

export default function ConsultantsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [consultants, setConsultants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    phoneNumber: '',
  });

  useEffect(() => {
    loadConsultants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConsultants = async () => {
    setIsLoading(true);
    try {
      const result = await dispatch(getConsultants());
      if (getConsultants.fulfilled.match(result)) {
        setConsultants(result.payload || []);
      }
    } catch (error) {
      console.error('Error loading consultants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      firstName: '',
      lastName: '',
      nationalId: '',
      phoneNumber: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    if (!validatePhoneNumber(formData.phoneNumber) || !validateNationalId(formData.nationalId)) {
      setSnackbar({ open: true, message: 'لطفا اطلاعات را به درستی وارد کنید', severity: 'error' });
      return;
    }

    try {
      const result = await dispatch(registerConsultant(formData));
      if (registerConsultant.fulfilled.match(result)) {
        setSnackbar({ open: true, message: 'مشاور با موفقیت ثبت شد', severity: 'success' });
        handleCloseDialog();
        loadConsultants();
      } else {
        setSnackbar({ open: true, message: result.payload as string || 'خطا در ثبت مشاور', severity: 'error' });
      }
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'خطا در ثبت مشاور', severity: 'error' });
    }
  };

  return (
    <PrivateRoute>
      <RoleGuard allowedRoles={[UserRole.SUPERVISOR]}>
        <DashboardLayout>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4">مدیریت مشاوران</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
              >
                ثبت مشاور جدید
              </Button>
            </Box>

            {isLoading ? (
              <Loading />
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>نام</TableCell>
                      <TableCell>شماره موبایل</TableCell>
                      <TableCell>کد ملی</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {consultants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          مشاوری ثبت نشده است
                        </TableCell>
                      </TableRow>
                    ) : (
                      consultants.map((consultant: any) => (
                        <TableRow key={consultant.id}>
                          <TableCell>{consultant.firstName} {consultant.lastName}</TableCell>
                          <TableCell>{consultant.phoneNumber}</TableCell>
                          <TableCell>{consultant.nationalId}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
              <DialogTitle>ثبت مشاور جدید</DialogTitle>
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
                    label="کد ملی"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    fullWidth
                    required
                    inputProps={{ maxLength: 10 }}
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
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>انصراف</Button>
                <Button onClick={handleSubmit} variant="contained">
                  ثبت
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

