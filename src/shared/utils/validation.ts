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

// Guild ID validation (6-12 digits)
export const validateGuildId = (guildId: string): boolean => {
  return /^\d{6,12}$/.test(guildId);
};

// Fixed phone validation (starts with 0 and 11 digits)
export const validateFixedPhone = (phone: string): boolean => {
  return /^0\d{10}$/.test(phone);
};

// Generic required text (min 3 chars when trimmed)
export const validateRequiredText = (value: string): boolean => {
  return value.trim().length >= 3;
};

// Postal code validation (exactly 10 digits)
export const validatePostalCode = (postalCode: string): boolean => {
  return /^\d{10}$/.test(postalCode);
};

// Date validation (YYYY-MM-DD format)
export const validateDate = (date: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
};

// Unique code validation (alphanumeric, min 3 chars)
export const validateUniqueCode = (code: string): boolean => {
  return /^[a-zA-Z0-9\-_]{3,}$/.test(code);
};

// Price validation (positive number)
export const validatePrice = (price: number | string | undefined | null): boolean => {
  if (price === undefined || price === null) return true; // Optional field
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return !isNaN(num) && num >= 0;
};

