import { useState, useEffect, type ChangeEvent, type SyntheticEvent, type MouseEvent } from 'react';
import {
  FiPhone,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiKey,
  FiCheckCircle,
  FiBriefcase,
  FiShield,
} from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../src/app/store';
import { login, registerCustomer, registerEstate, sendOTP, verifyOTP, forgotPassword, resetPassword } from '../src/domains/auth/store/authSlice';
import { useAuth } from '../src/domains/auth/hooks/useAuth';
import ErrorDisplay from '../src/shared/components/common/ErrorDisplay';
import PublicRoute from '../src/shared/components/guards/PublicRoute';
import { validatePhoneNumber, validateNationalId, validatePassword, validateOTPCode, validateGuildId, validateFixedPhone, validateRequiredText } from '../src/shared/utils/validation';
import { brandPrimary, brandPrimaryDark, heroGradient, surfaceGradient } from '../lib/theme/colors';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  if (value !== index) return null;
  return <div className="pt-6">{children}</div>;
}

const Spinner = ({ size = 24 }: { size?: number }) => (
  <span
    className="inline-block animate-spin rounded-full border-2 border-white border-t-transparent"
    style={{ width: size, height: size }}
  />
);

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

const alertStyles: Record<AlertVariant, string> = {
  info: 'bg-primary-50 border-primary-200 text-primary-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error: 'bg-red-50 border-red-200 text-red-800',
};

interface AlertBoxProps {
  children: React.ReactNode;
  variant?: AlertVariant;
  icon?: React.ReactNode;
  onClose?: () => void;
}

const AlertBox = ({ children, variant = 'info', icon, onClose }: AlertBoxProps) => (
  <div className={`rounded-2xl border px-4 py-3 text-sm ${alertStyles[variant]}`}>
    <div className="flex items-start gap-3">
      {icon && <span className="text-xl">{icon}</span>}
      <div className="flex-1 text-right">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-xs font-semibold text-current underline decoration-dotted"
        >
          بستن
        </button>
      )}
    </div>
  </div>
);

const inputBaseClass =
  'w-full rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-right text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100';

const sectionTitleClass = 'text-lg font-semibold text-gray-800 mb-2';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    isAuthenticated,
    isLoading,
    error,
    estateStatusMessage,
    estateRegistrationSuccess,
    estateRegistrationError,
    lastRegisteredEstate,
    resetPasswordMessage,
    clearEstateStatusMessage,
    clearResetPasswordMessage,
    resetEstateRegistration,
  } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);
  const [showCustomerConfirmPassword, setShowCustomerConfirmPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp' | 'forgot'>('password');
  const [registrationType, setRegistrationType] = useState<'customer' | 'estate'>('customer');

  // Login form
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Customer registration form
  const [customerFirstName, setCustomerFirstName] = useState('');
  const [customerLastName, setCustomerLastName] = useState('');
  const [customerNationalId, setCustomerNationalId] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerConfirmPassword, setCustomerConfirmPassword] = useState('');

  // Estate registration form
  const [estateGuildId, setEstateGuildId] = useState('');
  const [estateName, setEstateName] = useState('');
  const [estateFixedPhone, setEstateFixedPhone] = useState('');
  const [estateAddress, setEstateAddress] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminNationalId, setAdminNationalId] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

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

  useEffect(() => {
    if (estateRegistrationSuccess) {
      resetEstateFormFields();
    }
  }, [estateRegistrationSuccess]);

  const handleTabChange = (_event: SyntheticEvent | null, newValue: number) => {
    setTabValue(newValue);
    clearEstateStatusMessage();
    clearResetPasswordMessage();
    if (newValue === 0) {
      setLoginMethod('password');
      setOtpSent(false);
      setResetStep('phone');
      setOtpCountdown(0);
      setResetCountdown(0);
    } else if (newValue === 1) {
      setRegistrationType('customer');
    }
  };

  const handleLoginMethodChange = (_event: MouseEvent<HTMLElement> | null, newMethod: 'password' | 'otp' | 'forgot' | null) => {
    if (newMethod !== null) {
      setLoginMethod(newMethod);
      clearEstateStatusMessage();
      clearResetPasswordMessage();
      setOtpSent(false);
      setResetStep('phone');
      setOtpCountdown(0);
      setResetCountdown(0);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearEstateStatusMessage();
    if (!validatePhoneNumber(loginPhone)) {
      return;
    }
    await dispatch(login({ phoneNumber: loginPhone, password: loginPassword }));
  };

  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearEstateStatusMessage();
    clearResetPasswordMessage();
    
    if (!validatePhoneNumber(customerPhone) || 
        !validateNationalId(customerNationalId) ||
        !validatePassword(customerPassword) ||
        !validateRequiredText(customerFirstName) ||
        !validateRequiredText(customerLastName)) {
      return;
    }
    
    if (customerPassword !== customerConfirmPassword) {
      return;
    }
    
    await dispatch(registerCustomer({
      firstName: customerFirstName.trim(),
      lastName: customerLastName.trim(),
      nationalId: customerNationalId,
      phoneNumber: customerPhone,
      password: customerPassword,
    }));
  };

  const handleEstateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEstateFormValid()) {
      return;
    }
    resetEstateRegistration();
    await dispatch(registerEstate({
      guildId: estateGuildId,
      establishmentName: estateName.trim(),
      fixedPhone: estateFixedPhone,
      address: estateAddress.trim(),
      admin: {
        phoneNumber: adminPhone,
        firstName: adminFirstName.trim(),
        lastName: adminLastName.trim(),
        nationalId: adminNationalId,
        password: adminPassword,
      },
    }));
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    clearEstateStatusMessage();
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
    clearEstateStatusMessage();
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

  const formatFixedPhoneNumber = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 11);
  };

  const formatGuildIdentifier = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 12);
  };

  const formatOTPCode = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 6);
  };

  const resetEstateFormFields = () => {
    setEstateGuildId('');
    setEstateName('');
    setEstateFixedPhone('');
    setEstateAddress('');
    setAdminFirstName('');
    setAdminLastName('');
    setAdminNationalId('');
    setAdminPhone('');
    setAdminPassword('');
  };

  const isEstateFormValid = () => {
    return (
      validateGuildId(estateGuildId) &&
      validateRequiredText(estateName) &&
      validateFixedPhone(estateFixedPhone) &&
      validateRequiredText(estateAddress) &&
      validateRequiredText(adminFirstName) &&
      validateRequiredText(adminLastName) &&
      validateNationalId(adminNationalId) &&
      validatePhoneNumber(adminPhone) &&
      validatePassword(adminPassword)
    );
  };

  const getEstateStatusAlert = (message: string) => {
    switch (message) {
      case 'Your estate is waiting for Master approval.':
        return 'درخواست ثبت املاک شما در انتظار تایید مستر است. پس از تایید، امکان ورود فراهم می‌شود.';
      case 'Your estate request was rejected.':
        return 'درخواست ثبت املاک شما رد شده است. لطفا پس از رفع ایرادات دوباره ثبت‌نام کنید یا با پشتیبانی تماس بگیرید.';
      default:
        return message;
    }
  };

  const gradientBackground = heroGradient;
  const gradientBackgroundHover = `linear-gradient(135deg, ${brandPrimaryDark} 0%, ${brandPrimary} 100%)`;
  const cardBackground = surfaceGradient;

  const methodButtonStyles = (method: typeof loginMethod) =>
    `flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
      loginMethod === method
        ? 'border-transparent bg-primary-600 text-white shadow-md hover:bg-primary-500'
        : 'border-gray-200 bg-white/70 text-gray-600 hover:border-primary-200 hover:text-primary-600'
    }`;

  const disabledButtonClass = 'opacity-50 cursor-not-allowed';

  const PrimaryButton = ({
    children,
    disabled,
    onClick,
    type = 'button',
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit';
  }) => (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`mt-2 rounded-2xl px-4 py-3 text-center text-lg font-semibold text-white shadow-lg transition ${
        disabled ? disabledButtonClass : ''
      }`}
      style={{ background: gradientBackground }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = gradientBackgroundHover;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = gradientBackground;
      }}
    >
      {children}
    </button>
  );

  const renderIconInput = ({
    label,
    icon,
    value,
    onChange,
    type = 'text',
    placeholder,
    maxLength,
    errorText,
    isPasswordToggle,
    showToggle,
    onToggle,
    required = false,
  }: {
    label: string;
    icon: React.ReactNode;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: string;
    placeholder?: string;
    maxLength?: number;
    errorText?: string;
    isPasswordToggle?: boolean;
    showToggle?: boolean;
    onToggle?: () => void;
    required?: boolean;
  }) => (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-primary-500">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
          className={`${inputBaseClass} pl-12 ${errorText ? 'border-red-300 focus:ring-red-100' : ''}`}
        />
        {isPasswordToggle && (
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={onToggle}
            aria-label="toggle password visibility"
          >
            {showToggle ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
      </div>
      {errorText && <p className="mt-1 text-sm text-red-600">{errorText}</p>}
    </div>
  );

  return (
    <PublicRoute>
      <div className="flex min-h-screen items-center justify-center px-4 py-6" style={{ background: cardBackground }}>
        <div className="w-full max-w-3xl rounded-[32px] bg-white shadow-2xl ring-1 ring-black/5">
          <div className="px-6 py-10 text-center text-white" style={{ background: gradientBackground }}>
            <h1 className="mb-2 text-4xl font-black">املاکیار</h1>
            <p className="text-lg font-medium opacity-90">پلتفرم مدیریت املاک</p>
          </div>

          <div className="px-6 py-8 sm:px-10">
            <div className="grid grid-cols-2 gap-1 rounded-2xl border border-gray-100 bg-gray-50 p-1 text-sm font-semibold text-gray-500">
              {[
                { label: 'ورود', icon: <FiLock className="h-4 w-4" />, index: 0 },
                { label: 'ثبت‌نام', icon: <FiUser className="h-4 w-4" />, index: 1 },
              ].map(({ label, icon, index }) => (
                <button
                  key={label}
                  onClick={() => handleTabChange(null, index)}
                  className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-2 transition ${
                    tabValue === index ? 'bg-white text-primary-700 shadow' : 'hover:text-gray-700'
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Customer/Estate Registration Toggle */}
            {tabValue === 1 && (
              <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl border border-gray-100 bg-gray-50 p-1 text-sm font-semibold text-gray-500">
                {[
                  { label: 'مشتری', icon: <FiUser className="h-4 w-4" />, value: 'customer' as const },
                  { label: 'املاک', icon: <FiBriefcase className="h-4 w-4" />, value: 'estate' as const },
                ].map(({ label, icon, value }) => (
                  <button
                    key={label}
                    onClick={() => setRegistrationType(value)}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-2 transition ${
                      registrationType === value ? 'bg-white text-primary-700 shadow' : 'hover:text-gray-700'
                    }`}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}

            <ErrorDisplay error={error} />

            <TabPanel value={tabValue} index={0}>
              {estateStatusMessage && (
                <div className="mb-4">
                  <AlertBox
                    variant="warning"
                    icon={<FiShield className="text-xl" />}
                    onClose={clearEstateStatusMessage}
                  >
                    {getEstateStatusAlert(estateStatusMessage)}
                  </AlertBox>
                </div>
              )}

              <div className="mb-5 flex flex-col gap-2 sm:flex-row">
                <button className={methodButtonStyles('password')} onClick={() => handleLoginMethodChange(null, 'password')}>
                  <span className="flex items-center justify-center gap-2">
                    <FiLock /> ورود با رمز
                  </span>
                </button>
                <button className={methodButtonStyles('otp')} onClick={() => handleLoginMethodChange(null, 'otp')}>
                  <span className="flex items-center justify-center gap-2">
                    <FiKey /> ورود با کد
                  </span>
                </button>
                <button className={methodButtonStyles('forgot')} onClick={() => handleLoginMethodChange(null, 'forgot')}>
                  <span className="flex items-center justify-center gap-2">
                    <FiPhone /> بازیابی رمز
                  </span>
                </button>
              </div>

              {loginMethod === 'password' && (
                <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                  {renderIconInput({
                    label: 'شماره موبایل',
                    icon: <FiPhone />,
                    value: loginPhone,
                    onChange: (e) => setLoginPhone(formatPhoneNumber(e.target.value)),
                    placeholder: '09123456789',
                    maxLength: 11,
            required: true,
                    errorText: loginPhone.length > 0 && !validatePhoneNumber(loginPhone) ? 'شماره موبایل معتبر نیست' : undefined,
                  })}
                  {renderIconInput({
                    label: 'رمز عبور',
                    icon: <FiLock />,
                    value: loginPassword,
                    onChange: (e) => setLoginPassword(e.target.value),
                    type: showPassword ? 'text' : 'password',
                    isPasswordToggle: true,
                    showToggle: showPassword,
                    onToggle: () => setShowPassword((prev) => !prev),
            required: true,
                  })}
                  <PrimaryButton type="submit" disabled={isLoading || !validatePhoneNumber(loginPhone) || !loginPassword}>
                    {isLoading ? <Spinner /> : 'ورود به حساب کاربری'}
                  </PrimaryButton>
                </form>
              )}

              {loginMethod === 'otp' && (
                <div className="flex flex-col gap-4">
                  {!otpSent ? (
                    <form className="flex flex-col gap-4" onSubmit={handleSendOTP}>
                      {renderIconInput({
                        label: 'شماره موبایل',
                        icon: <FiPhone />,
                        value: otpPhone,
                        onChange: (e) => setOtpPhone(formatPhoneNumber(e.target.value)),
                        placeholder: '09123456789',
                        maxLength: 11,
                required: true,
                        errorText: otpPhone.length > 0 && !validatePhoneNumber(otpPhone) ? 'شماره موبایل معتبر نیست' : undefined,
                      })}
                      <PrimaryButton type="submit" disabled={isLoading || !validatePhoneNumber(otpPhone)}>
                        {isLoading ? <Spinner /> : 'ارسال کد تایید'}
                      </PrimaryButton>
                    </form>
                  ) : (
                    <form className="flex flex-col gap-4" onSubmit={handleVerifyOTP}>
                      <AlertBox variant="success" icon={<FiCheckCircle className="text-xl" />}>
                        کد تایید به شماره {otpPhone} ارسال شد
                      </AlertBox>
                      {renderIconInput({
                        label: 'کد تایید',
                        icon: <FiKey />,
                        value: otpCode,
                        onChange: (e) => setOtpCode(formatOTPCode(e.target.value)),
                        placeholder: '123456',
                        maxLength: 6,
                required: true,
                        errorText: otpCode.length > 0 && !validateOTPCode(otpCode) ? 'کد باید ۶ رقم باشد' : undefined,
                      })}
                      {otpCountdown > 0 && (
                        <p className="text-center text-sm text-gray-500">
                          ارسال مجدد کد تا {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}
                        </p>
                      )}
                      <PrimaryButton type="submit" disabled={isLoading || !validateOTPCode(otpCode)}>
                        {isLoading ? <Spinner /> : 'تایید و ورود'}
                      </PrimaryButton>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCountdown(0);
                        }}
                        disabled={otpCountdown > 0}
                        className={`text-sm font-semibold text-amber-600 ${otpCountdown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        تغییر شماره موبایل
                      </button>
                    </form>
                  )}
                </div>
              )}

              {loginMethod === 'forgot' && (
                <div className="flex flex-col gap-4">
                  {resetStep === 'phone' ? (
                    <form className="flex flex-col gap-4" onSubmit={handleForgotPassword}>
                      {renderIconInput({
                        label: 'شماره موبایل',
                        icon: <FiPhone />,
                        value: forgotPhone,
                        onChange: (e) => setForgotPhone(formatPhoneNumber(e.target.value)),
                        placeholder: '09123456789',
                        maxLength: 11,
                required: true,
                        errorText: forgotPhone.length > 0 && !validatePhoneNumber(forgotPhone) ? 'شماره موبایل معتبر نیست' : undefined,
                      })}
                      <PrimaryButton type="submit" disabled={isLoading || !validatePhoneNumber(forgotPhone)}>
                        {isLoading ? <Spinner /> : 'ارسال کد بازیابی'}
                      </PrimaryButton>
                    </form>
                  ) : (
                    <form className="flex flex-col gap-4" onSubmit={handleResetPassword}>
                      {resetPasswordMessage ? (
                        <>
                          <AlertBox variant="success" icon={<FiCheckCircle className="text-xl" />} onClose={clearResetPasswordMessage}>
                            {resetPasswordMessage}
                          </AlertBox>
                          <PrimaryButton
                            onClick={() => {
                              clearResetPasswordMessage();
                              setLoginMethod('password');
                              setResetStep('phone');
                              setForgotPhone('');
                              setResetCode('');
                              setNewPassword('');
                            }}
                          >
                            بازگشت به صفحه ورود
                          </PrimaryButton>
                        </>
                      ) : (
                        <>
                          <AlertBox variant="success" icon={<FiCheckCircle className="text-xl" />}>
                            کد بازیابی به شماره {forgotPhone} ارسال شد
                          </AlertBox>
                      {renderIconInput({
                        label: 'کد بازیابی',
                        icon: <FiKey />,
                        value: resetCode,
                        onChange: (e) => setResetCode(formatOTPCode(e.target.value)),
                        placeholder: '123456',
                        maxLength: 6,
                required: true,
                        errorText: resetCode.length > 0 && !validateOTPCode(resetCode) ? 'کد باید ۶ رقم باشد' : undefined,
                      })}
                      {renderIconInput({
                        label: 'رمز عبور جدید',
                        icon: <FiLock />,
                        value: newPassword,
                        onChange: (e) => setNewPassword(e.target.value),
                        type: showConfirmPassword ? 'text' : 'password',
                        isPasswordToggle: true,
                        showToggle: showConfirmPassword,
                        onToggle: () => setShowConfirmPassword((prev) => !prev),
                required: true,
                        errorText: newPassword.length > 0 && !validatePassword(newPassword) ? 'رمز عبور باید حداقل ۶ کاراکتر باشد' : undefined,
                      })}
                      {resetCountdown > 0 && (
                        <p className="text-center text-sm text-gray-500">
                          ارسال مجدد کد تا {Math.floor(resetCountdown / 60)}:{(resetCountdown % 60).toString().padStart(2, '0')}
                        </p>
                      )}
                      <PrimaryButton
                        type="submit"
                        disabled={isLoading || !validateOTPCode(resetCode) || !validatePassword(newPassword)}
                      >
                        {isLoading ? <Spinner /> : 'تغییر رمز عبور'}
                      </PrimaryButton>
                      <button
                        type="button"
                        onClick={() => {
                          setResetStep('phone');
                          setResetCountdown(0);
                        }}
                        disabled={resetCountdown > 0}
                        className={`text-sm font-semibold text-primary-600 ${resetCountdown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        تغییر شماره موبایل
                      </button>
                        </>
                      )}
                    </form>
                  )}
                </div>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {registrationType === 'customer' ? (
                <div className="flex flex-col gap-4">
                  <AlertBox variant="info" icon={<FiUser className="text-xl" />}>
                    برای ثبت‌نام به عنوان مشتری، اطلاعات خود را وارد کنید. پس از ثبت‌نام، می‌توانید از تمام امکانات پلتفرم استفاده کنید.
                  </AlertBox>

                  {error && (
                    <AlertBox variant="error">{error}</AlertBox>
                  )}

                  <form className="flex flex-col gap-4" onSubmit={handleCustomerRegister}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {renderIconInput({
                        label: 'نام',
                        icon: <FiUser />,
                        value: customerFirstName,
                        onChange: (e) => setCustomerFirstName(e.target.value),
                        required: true,
                        errorText: customerFirstName.length > 0 && !validateRequiredText(customerFirstName) ? 'حداقل ۳ کاراکتر' : undefined,
                      })}
                      {renderIconInput({
                        label: 'نام خانوادگی',
                        icon: <FiUser />,
                        value: customerLastName,
                        onChange: (e) => setCustomerLastName(e.target.value),
                        required: true,
                        errorText: customerLastName.length > 0 && !validateRequiredText(customerLastName) ? 'حداقل ۳ کاراکتر' : undefined,
                      })}
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {renderIconInput({
                        label: 'کد ملی',
                        icon: <FiShield />,
                        value: customerNationalId,
                        onChange: (e) => setCustomerNationalId(formatNationalId(e.target.value)),
                        maxLength: 10,
                        required: true,
                        errorText: customerNationalId.length > 0 && !validateNationalId(customerNationalId) ? 'کد ملی باید ۱۰ رقم باشد' : undefined,
                      })}
                      {renderIconInput({
                        label: 'شماره موبایل',
                        icon: <FiPhone />,
                        value: customerPhone,
                        onChange: (e) => setCustomerPhone(formatPhoneNumber(e.target.value)),
                        placeholder: '09123456789',
                        maxLength: 11,
                        required: true,
                        errorText: customerPhone.length > 0 && !validatePhoneNumber(customerPhone) ? 'شماره موبایل معتبر نیست' : undefined,
                      })}
                    </div>
                    {renderIconInput({
                      label: 'رمز عبور',
                      icon: <FiLock />,
                      type: showCustomerPassword ? 'text' : 'password',
                      value: customerPassword,
                      onChange: (e) => setCustomerPassword(e.target.value),
                      required: true,
                      isPasswordToggle: true,
                      showToggle: showCustomerPassword,
                      onToggle: () => setShowCustomerPassword((prev) => !prev),
                      errorText: customerPassword.length > 0 && !validatePassword(customerPassword) ? 'رمز عبور باید حداقل ۶ کاراکتر باشد' : undefined,
                    })}
                    {renderIconInput({
                      label: 'تکرار رمز عبور',
                      icon: <FiLock />,
                      type: showCustomerConfirmPassword ? 'text' : 'password',
                      value: customerConfirmPassword,
                      onChange: (e) => setCustomerConfirmPassword(e.target.value),
                      required: true,
                      isPasswordToggle: true,
                      showToggle: showCustomerConfirmPassword,
                      onToggle: () => setShowCustomerConfirmPassword((prev) => !prev),
                      errorText: customerConfirmPassword.length > 0 && customerPassword !== customerConfirmPassword ? 'رمز عبور با تکرار آن یکسان نیست' : undefined,
                    })}
                    <PrimaryButton
                      type="submit"
                      disabled={
                        isLoading ||
                        !validatePhoneNumber(customerPhone) ||
                        !validateNationalId(customerNationalId) ||
                        !validatePassword(customerPassword) ||
                        !validateRequiredText(customerFirstName) ||
                        !validateRequiredText(customerLastName) ||
                        customerPassword !== customerConfirmPassword
                      }
                    >
                      {isLoading ? <Spinner /> : 'ثبت‌نام'}
                    </PrimaryButton>
                  </form>
                </div>
              ) : (
              <div className="flex flex-col gap-4">
                <AlertBox variant="info" icon={<FiBriefcase className="text-xl" />}>
                  برای دسترسی به پنل املاک ابتدا اطلاعات واحد صنفی و مدیر خود را ثبت کنید. پس از تأیید مستر، مدیر املاک فعال خواهد شد.
                </AlertBox>

                {estateRegistrationSuccess && (
                  <AlertBox variant="success" icon={<FiCheckCircle className="text-xl" />}>
                    درخواست ثبت «{lastRegisteredEstate?.establishmentName}» با شناسه صنفی {lastRegisteredEstate?.guildId} ثبت شد. وضعیت فعلی: در انتظار تایید مستر.
                  </AlertBox>
                )}

                {estateRegistrationError && (
                  <AlertBox variant="error">{estateRegistrationError}</AlertBox>
                )}

                {estateRegistrationSuccess ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-gray-600">پس از تایید مستر، مدیر املاک می‌تواند با شماره وارد شده وارد شود.</p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <PrimaryButton
                        onClick={() => {
                          setTabValue(0);
                          resetEstateRegistration();
                        }}
                      >
                        رفتن به صفحه ورود
                      </PrimaryButton>
                      <button
                        className="rounded-2xl border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700 transition hover:border-primary-200 hover:text-primary-600"
                        onClick={() => {
                          resetEstateRegistration();
                          resetEstateFormFields();
                        }}
                      >
                        ثبت درخواست جدید
                      </button>
                    </div>
                  </div>
                ) : (
                  <form className="flex flex-col gap-6" onSubmit={handleEstateRegister}>
                    <div>
                      <h3 className={sectionTitleClass}>اطلاعات واحد صنفی</h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          {renderIconInput({
                            label: 'شناسه صنفی',
                            icon: <FiShield />,
                            value: estateGuildId,
                            onChange: (e) => setEstateGuildId(formatGuildIdentifier(e.target.value)),
                            maxLength: 12,
                            required: true,
                            errorText: estateGuildId.length > 0 && !validateGuildId(estateGuildId) ? 'شناسه صنفی باید حداقل ۶ رقم باشد' : undefined,
                          })}
                        </div>
                        <div>
                          {renderIconInput({
                            label: 'نام واحد صنفی',
                            icon: <FiUser />,
                            value: estateName,
                            onChange: (e) => setEstateName(e.target.value),
                            required: true,
                            errorText: estateName.length > 0 && !validateRequiredText(estateName) ? 'حداقل ۳ کاراکتر' : undefined,
                          })}
                        </div>
                        <div>
                          {renderIconInput({
                            label: 'تلفن ثابت',
                            icon: <FiPhone />,
                            value: estateFixedPhone,
                            onChange: (e) => setEstateFixedPhone(formatFixedPhoneNumber(e.target.value)),
                            placeholder: '02144556677',
                            maxLength: 11,
                            required: true,
                            errorText: estateFixedPhone.length > 0 && !validateFixedPhone(estateFixedPhone) ? 'شماره ثابت باید ۱۱ رقم باشد' : undefined,
                          })}
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-gray-700">آدرس</label>
                          <textarea
                            className={`${inputBaseClass} min-h-[90px]`}
                            value={estateAddress}
                            onChange={(e) => setEstateAddress(e.target.value)}
                            required
                          />
                          {estateAddress.length > 0 && !validateRequiredText(estateAddress) && (
                            <p className="mt-1 text-sm text-red-600">آدرس را کامل‌تر وارد کنید</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className={sectionTitleClass}>مشخصات مدیر املاک</h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          {renderIconInput({
                            label: 'نام',
                            icon: <FiUser />,
                            value: adminFirstName,
                            onChange: (e) => setAdminFirstName(e.target.value),
                            required: true,
                            errorText: adminFirstName.length > 0 && !validateRequiredText(adminFirstName) ? 'حداقل ۳ کاراکتر' : undefined,
                          })}
                        </div>
                        <div>
                          {renderIconInput({
                            label: 'نام خانوادگی',
                            icon: <FiUser />,
                            value: adminLastName,
                            onChange: (e) => setAdminLastName(e.target.value),
                            required: true,
                            errorText: adminLastName.length > 0 && !validateRequiredText(adminLastName) ? 'حداقل ۳ کاراکتر' : undefined,
                          })}
                        </div>
                        <div>
                          {renderIconInput({
                            label: 'کد ملی',
                            icon: <FiShield />,
                            value: adminNationalId,
                            onChange: (e) => setAdminNationalId(formatNationalId(e.target.value)),
                            maxLength: 10,
                            required: true,
                            errorText: adminNationalId.length > 0 && !validateNationalId(adminNationalId) ? 'کد ملی باید ۱۰ رقم باشد' : undefined,
                          })}
                        </div>
                        <div>
                          {renderIconInput({
                            label: 'شماره موبایل مدیر',
                            icon: <FiPhone />,
                            value: adminPhone,
                            onChange: (e) => setAdminPhone(formatPhoneNumber(e.target.value)),
                            placeholder: '09120001122',
                            maxLength: 11,
                            required: true,
                            errorText: adminPhone.length > 0 && !validatePhoneNumber(adminPhone) ? 'شماره موبایل معتبر نیست' : undefined,
                          })}
                        </div>
                        <div className="md:col-span-2">
                          {renderIconInput({
                            label: 'رمز عبور مدیر',
                            icon: <FiLock />,
                            value: adminPassword,
                            onChange: (e) => setAdminPassword(e.target.value),
                            type: showPassword ? 'text' : 'password',
                            isPasswordToggle: true,
                            showToggle: showPassword,
                            onToggle: () => setShowPassword((prev) => !prev),
                            required: true,
                            errorText: adminPassword.length > 0 && !validatePassword(adminPassword) ? 'حداقل ۶ کاراکتر' : undefined,
                          })}
                        </div>
                      </div>
                    </div>

                    <PrimaryButton type="submit" disabled={isLoading || !isEstateFormValid()}>
                      {isLoading ? <Spinner /> : 'ارسال درخواست ثبت املاک'}
                    </PrimaryButton>
                  </form>
                )}
              </div>
              )}
            </TabPanel>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}
