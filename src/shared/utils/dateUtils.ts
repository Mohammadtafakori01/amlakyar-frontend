import moment from 'moment-jalaali';

/**
 * Convert Gregorian date (YYYY-MM-DD) to Persian date string
 * @param date - Date string in YYYY-MM-DD format
 * @returns Persian date string (e.g., "1402/10/25")
 */
export const formatToPersianDate = (date: string): string => {
  if (!date) return '';
  const m = moment(date, 'YYYY-MM-DD');
  return m.format('jYYYY/jMM/jDD');
};

/**
 * Convert Persian date string to Gregorian date (YYYY-MM-DD)
 * @param persianDate - Persian date string (e.g., "1402/10/25")
 * @returns Date string in YYYY-MM-DD format
 */
export const formatToGregorianDate = (persianDate: string): string => {
  if (!persianDate) return '';
  const m = moment(persianDate, 'jYYYY/jMM/jDD');
  return m.format('YYYY-MM-DD');
};

/**
 * Get current date in Gregorian format (YYYY-MM-DD)
 */
export const getCurrentDate = (): string => {
  return moment().format('YYYY-MM-DD');
};

/**
 * Format date for display with Persian month names
 * @param date - Date string in YYYY-MM-DD format
 * @returns Formatted Persian date string
 */
export const formatPersianDateWithMonth = (date: string): string => {
  if (!date) return '';
  const m = moment(date, 'YYYY-MM-DD');
  return m.format('jD jMMMM jYYYY');
};

