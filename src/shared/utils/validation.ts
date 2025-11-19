// Phone number validation (11 digits starting with 09)
export const validatePhoneNumber = (phone: string): boolean => {
  return /^09\d{9}$/.test(phone);
};

// National ID validation (10 digits)
export const validateNationalId = (nationalId: string): boolean => {
  return /^\d{10}$/.test(nationalId);
};

// Password validation (minimum 6 characters)
export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

// OTP code validation (6 digits)
export const validateOTPCode = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};

