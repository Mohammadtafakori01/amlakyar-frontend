import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton,
  Fade,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Snackbar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Phone,
  Lock,
  Person,
  Badge,
  VpnKey,
  CheckCircle,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../src/app/store';
import { login, registerCustomer, sendOTP, verifyOTP, forgotPassword, resetPassword } from '../src/domains/auth/store/authSlice';
import { useAuth } from '../src/domains/auth/hooks/useAuth';
import ErrorDisplay from '../src/shared/components/common/ErrorDisplay';
import PublicRoute from '../src/shared/components/guards/PublicRoute';
import { validatePhoneNumber, validateNationalId, validatePassword, validateOTPCode } from '../src/shared/utils/validation';
import { goldenYellow, burntOrange, creamyWhite, mediumBlue } from '../lib/theme/colors';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Fade in={value === index} timeout={300}>
          <Box sx={{ pt: 4 }}>{children}</Box>
        </Fade>
      )}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, error } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp' | 'forgot'>('password');

  // Login form
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regNationalId, setRegNationalId] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // OTP form
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Forgot password form
  const [forgotPhone, setForgotPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'phone' | 'reset'>('phone');
  const [resetCountdown, setResetCountdown] = useState(0);

  // Countdown timer for OTP
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Countdown timer for reset password
  useEffect(() => {
    if (resetCountdown > 0) {
      const timer = setTimeout(() => setResetCountdown(resetCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resetCountdown]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 0) {
      setLoginMethod('password');
      setOtpSent(false);
      setResetStep('phone');
      setOtpCountdown(0);
      setResetCountdown(0);
    }
  };

  const handleLoginMethodChange = (_event: React.MouseEvent<HTMLElement>, newMethod: 'password' | 'otp' | 'forgot' | null) => {
    if (newMethod !== null) {
      setLoginMethod(newMethod);
      setOtpSent(false);
      setResetStep('phone');
      setOtpCountdown(0);
      setResetCountdown(0);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhoneNumber(loginPhone)) {
      return;
    }
    await dispatch(login({ phoneNumber: loginPhone, password: loginPassword }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhoneNumber(regPhone) || !validateNationalId(regNationalId) || !validatePassword(regPassword)) {
      return;
    }
    await dispatch(registerCustomer({
      firstName: regFirstName,
      lastName: regLastName,
      nationalId: regNationalId,
      phoneNumber: regPhone,
      password: regPassword,
    }));
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhoneNumber(otpPhone)) {
      return;
    }
    const result = await dispatch(sendOTP({ phoneNumber: otpPhone }));
    if (sendOTP.fulfilled.match(result)) {
      setOtpSent(true);
      setOtpCountdown(120);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateOTPCode(otpCode)) {
      return;
    }
    await dispatch(verifyOTP({ phoneNumber: otpPhone, code: otpCode }));
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhoneNumber(forgotPhone)) {
      return;
    }
    const result = await dispatch(forgotPassword({ phoneNumber: forgotPhone }));
    if (forgotPassword.fulfilled.match(result)) {
      setResetStep('reset');
      setResetCountdown(120);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateOTPCode(resetCode) || !validatePassword(newPassword)) {
      return;
    }
    await dispatch(resetPassword({
      phoneNumber: forgotPhone,
      code: resetCode,
      newPassword,
    }));
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned;
    }
    return cleaned.slice(0, 11);
  };

  const formatNationalId = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 10);
  };

  const formatOTPCode = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 6);
  };

  const gradientBackground = `linear-gradient(135deg, ${goldenYellow} 0%, ${burntOrange} 100%)`;
  const gradientBackgroundHover = `linear-gradient(135deg, ${burntOrange} 0%, ${goldenYellow} 100%)`;

  return (
    <PublicRoute>
      <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${mediumBlue}15 0%, ${goldenYellow}15 100%)`,
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={500}>
          <Card
            elevation={24}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: creamyWhite,
            }}
          >
            {/* Header Section */}
            <Box
              sx={{
                background: gradientBackground,
                py: 4,
                px: 3,
                textAlign: 'center',
                color: 'white',
              }}
            >
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
            املاکیار
          </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95 }}>
            پلتفرم مدیریت املاک
          </Typography>
        </Box>

            <CardContent sx={{ p: 4 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    '& .MuiTab-root': {
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      minHeight: 56,
                    },
                    '& .Mui-selected': {
                      color: goldenYellow,
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: goldenYellow,
                      height: 3,
                    },
                  }}
                >
                  <Tab label="ورود" icon={<Lock sx={{ mb: 0.5 }} />} iconPosition="top" />
                  <Tab label="ثبت‌نام" icon={<Person sx={{ mb: 0.5 }} />} iconPosition="top" />
                </Tabs>
              </Box>

              <ErrorDisplay error={error} />

              {/* Login Tab - Merged with OTP and Forgot Password */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ mb: 3 }}>
                  <ToggleButtonGroup
                    value={loginMethod}
                    exclusive
                    onChange={handleLoginMethodChange}
                    fullWidth
                    sx={{
                      '& .MuiToggleButton-root': {
                        textTransform: 'none',
                        fontWeight: 500,
                        borderColor: goldenYellow,
                        color: 'text.primary',
                        '&.Mui-selected': {
                          backgroundColor: goldenYellow,
                          color: 'white',
                          '&:hover': {
                            backgroundColor: burntOrange,
                          },
                        },
                        '&:hover': {
                          backgroundColor: `${goldenYellow}20`,
                        },
                      },
                    }}
                  >
                    <ToggleButton value="password">
                      <Lock sx={{ mr: 1, fontSize: 18 }} />
                      ورود با رمز
                    </ToggleButton>
                    <ToggleButton value="otp">
                      <VpnKey sx={{ mr: 1, fontSize: 18 }} />
                      ورود با کد
                    </ToggleButton>
                    <ToggleButton value="forgot">
                      <Phone sx={{ mr: 1, fontSize: 18 }} />
                      بازیابی رمز
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {/* Password Login */}
                {loginMethod === 'password' && (
                  <Fade in={loginMethod === 'password'} timeout={300}>
                    <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <TextField
                        label="شماره موبایل"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(formatPhoneNumber(e.target.value))}
                        required
                        fullWidth
                        placeholder="09123456789"
                        inputProps={{ maxLength: 11 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone sx={{ color: goldenYellow }} />
                            </InputAdornment>
                          ),
                        }}
                        error={loginPhone.length > 0 && !validatePhoneNumber(loginPhone)}
                        helperText={loginPhone.length > 0 && !validatePhoneNumber(loginPhone) ? 'شماره موبایل معتبر نیست' : ''}
                      />
                      <TextField
                        label="رمز عبور"
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: goldenYellow }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                size="small"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={isLoading || !validatePhoneNumber(loginPhone) || !loginPassword}
                        sx={{
                          py: 1.5,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          borderRadius: 2,
                          background: gradientBackground,
                          '&:hover': {
                            background: gradientBackgroundHover,
                          },
                        }}
                      >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'ورود به حساب کاربری'}
                      </Button>
                    </Box>
                  </Fade>
                )}

                {/* OTP Login */}
                {loginMethod === 'otp' && (
                  <Fade in={loginMethod === 'otp'} timeout={300}>
                    <Box>
                      {!otpSent ? (
                        <Box component="form" onSubmit={handleSendOTP} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <TextField
                            label="شماره موبایل"
                            value={otpPhone}
                            onChange={(e) => setOtpPhone(formatPhoneNumber(e.target.value))}
                            required
                            fullWidth
                            placeholder="09123456789"
                            inputProps={{ maxLength: 11 }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Phone sx={{ color: goldenYellow }} />
                                </InputAdornment>
                              ),
                            }}
                            error={otpPhone.length > 0 && !validatePhoneNumber(otpPhone)}
                            helperText={otpPhone.length > 0 && !validatePhoneNumber(otpPhone) ? 'شماره موبایل معتبر نیست' : ''}
                          />
                          <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={isLoading || !validatePhoneNumber(otpPhone)}
                            sx={{
                              py: 1.5,
                              fontSize: '1.1rem',
                              fontWeight: 600,
                              textTransform: 'none',
                              borderRadius: 2,
                              background: gradientBackground,
                              '&:hover': {
                                background: gradientBackgroundHover,
                              },
                            }}
                          >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'ارسال کد تایید'}
                          </Button>
                        </Box>
                      ) : (
                        <Box component="form" onSubmit={handleVerifyOTP} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <Alert
                            severity="success"
                            icon={<CheckCircle />}
                            sx={{ borderRadius: 2 }}
                          >
                            کد تایید به شماره {otpPhone} ارسال شد
                          </Alert>
                          <TextField
                            label="کد تایید"
                            value={otpCode}
                            onChange={(e) => setOtpCode(formatOTPCode(e.target.value))}
                            required
                            fullWidth
                            placeholder="123456"
                            inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.5rem' } }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <VpnKey sx={{ color: goldenYellow }} />
                                </InputAdornment>
                              ),
                            }}
                            error={otpCode.length > 0 && !validateOTPCode(otpCode)}
                            helperText={otpCode.length > 0 && !validateOTPCode(otpCode) ? 'کد باید 6 رقم باشد' : ''}
                          />
                          {otpCountdown > 0 && (
                            <Typography variant="body2" color="text.secondary" align="center">
                              ارسال مجدد کد تا {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}
                </Typography>
                          )}
                          <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={isLoading || !validateOTPCode(otpCode)}
                            sx={{
                              py: 1.5,
                              fontSize: '1.1rem',
                              fontWeight: 600,
                              textTransform: 'none',
                              borderRadius: 2,
                              background: gradientBackground,
                              '&:hover': {
                                background: gradientBackgroundHover,
                              },
                            }}
                          >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'تایید و ورود'}
                          </Button>
                          <Button
                            variant="text"
                            onClick={() => {
                              setOtpSent(false);
                              setOtpCountdown(0);
                            }}
                            disabled={otpCountdown > 0}
                            sx={{ textTransform: 'none', color: goldenYellow }}
                          >
                            تغییر شماره موبایل
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Fade>
                )}

                {/* Forgot Password */}
                {loginMethod === 'forgot' && (
                  <Fade in={loginMethod === 'forgot'} timeout={300}>
                    <Box>
                      {resetStep === 'phone' ? (
                        <Box component="form" onSubmit={handleForgotPassword} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <TextField
                            label="شماره موبایل"
                            value={forgotPhone}
                            onChange={(e) => setForgotPhone(formatPhoneNumber(e.target.value))}
                            required
                            fullWidth
                            placeholder="09123456789"
                            inputProps={{ maxLength: 11 }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Phone sx={{ color: goldenYellow }} />
                                </InputAdornment>
                              ),
                            }}
                            error={forgotPhone.length > 0 && !validatePhoneNumber(forgotPhone)}
                            helperText={forgotPhone.length > 0 && !validatePhoneNumber(forgotPhone) ? 'شماره موبایل معتبر نیست' : ''}
                          />
                          <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={isLoading || !validatePhoneNumber(forgotPhone)}
                            sx={{
                              py: 1.5,
                              fontSize: '1.1rem',
                              fontWeight: 600,
                              textTransform: 'none',
                              borderRadius: 2,
                              background: gradientBackground,
                              '&:hover': {
                                background: gradientBackgroundHover,
                              },
                            }}
                          >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'ارسال کد بازیابی'}
                          </Button>
                        </Box>
                      ) : (
                        <Box component="form" onSubmit={handleResetPassword} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <Alert
                            severity="success"
                            icon={<CheckCircle />}
                            sx={{ borderRadius: 2 }}
                          >
                            کد بازیابی به شماره {forgotPhone} ارسال شد
                          </Alert>
                          <TextField
                            label="کد بازیابی"
                            value={resetCode}
                            onChange={(e) => setResetCode(formatOTPCode(e.target.value))}
                            required
                            fullWidth
                            placeholder="123456"
                            inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.5rem' } }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <VpnKey sx={{ color: goldenYellow }} />
                                </InputAdornment>
                              ),
                            }}
                            error={resetCode.length > 0 && !validateOTPCode(resetCode)}
                            helperText={resetCode.length > 0 && !validateOTPCode(resetCode) ? 'کد باید 6 رقم باشد' : ''}
                          />
                          <TextField
                            label="رمز عبور جدید"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Lock sx={{ color: goldenYellow }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    edge="end"
                                    size="small"
                                  >
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            error={newPassword.length > 0 && !validatePassword(newPassword)}
                            helperText={
                              newPassword.length > 0 && !validatePassword(newPassword)
                                ? 'رمز عبور باید حداقل 6 کاراکتر باشد'
                                : 'حداقل 6 کاراکتر'
                            }
                          />
                          {resetCountdown > 0 && (
                            <Typography variant="body2" color="text.secondary" align="center">
                              ارسال مجدد کد تا {Math.floor(resetCountdown / 60)}:{(resetCountdown % 60).toString().padStart(2, '0')}
                </Typography>
                          )}
                          <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={isLoading || !validateOTPCode(resetCode) || !validatePassword(newPassword)}
                            sx={{
                              py: 1.5,
                              fontSize: '1.1rem',
                              fontWeight: 600,
                              textTransform: 'none',
                              borderRadius: 2,
                              background: gradientBackground,
                              '&:hover': {
                                background: gradientBackgroundHover,
                              },
                            }}
                          >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'تغییر رمز عبور'}
                          </Button>
                          <Button
                            variant="text"
                            onClick={() => {
                              setResetStep('phone');
                              setResetCountdown(0);
                            }}
                            disabled={resetCountdown > 0}
                            sx={{ textTransform: 'none', color: goldenYellow }}
                          >
                            تغییر شماره موبایل
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Fade>
                )}
              </TabPanel>

              {/* Register Tab */}
              <TabPanel value={tabValue} index={1}>
                <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="نام"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        required
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: goldenYellow }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="نام خانوادگی"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        required
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: goldenYellow }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    label="کد ملی"
                    value={regNationalId}
                    onChange={(e) => setRegNationalId(formatNationalId(e.target.value))}
                    required
                    fullWidth
                    inputProps={{ maxLength: 10 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Badge sx={{ color: goldenYellow }} />
                        </InputAdornment>
                      ),
                    }}
                    error={regNationalId.length > 0 && !validateNationalId(regNationalId)}
                    helperText={regNationalId.length > 0 && !validateNationalId(regNationalId) ? 'کد ملی باید 10 رقم باشد' : ''}
                  />
                  <TextField
                    label="شماره موبایل"
                    value={regPhone}
                    onChange={(e) => setRegPhone(formatPhoneNumber(e.target.value))}
                    required
                    fullWidth
                    placeholder="09123456789"
                    inputProps={{ maxLength: 11 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: goldenYellow }} />
                        </InputAdornment>
                      ),
                    }}
                    error={regPhone.length > 0 && !validatePhoneNumber(regPhone)}
                    helperText={regPhone.length > 0 && !validatePhoneNumber(regPhone) ? 'شماره موبایل معتبر نیست' : ''}
                  />
                  <TextField
                    label="رمز عبور"
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: goldenYellow }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={regPassword.length > 0 && !validatePassword(regPassword)}
                    helperText={
                      regPassword.length > 0 && !validatePassword(regPassword)
                        ? 'رمز عبور باید حداقل 6 کاراکتر باشد'
                        : 'حداقل 6 کاراکتر'
                    }
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={
                      isLoading ||
                      !validatePhoneNumber(regPhone) ||
                      !validateNationalId(regNationalId) ||
                      !validatePassword(regPassword) ||
                      !regFirstName ||
                      !regLastName
                    }
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: 2,
                      mt: 1,
                      background: gradientBackground,
                      '&:hover': {
                        background: gradientBackgroundHover,
                      },
                    }}
                  >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'ثبت‌نام و ورود'}
                  </Button>
                </Box>
              </TabPanel>
              </CardContent>
            </Card>
        </Fade>
      </Container>
    </Box>
    </PublicRoute>
  );
}
