import moment from 'moment-jalaali';

/**
 * Convert Gregorian date (YYYY-MM-DD) to Persian date string
 * @param date - Date string in YYYY-MM-DD format
 * @returns Persian date string (e.g., "1402/10/25")
 */
export const formatToPersianDate = (date: string): string => {
  if (!date || typeof date !== 'string') return '';
  const trimmedDate = date.trim();
  if (!trimmedDate) return '';
  
  const m = moment(trimmedDate, 'YYYY-MM-DD', true); // strict parsing
  if (!m.isValid()) {
    console.warn('Invalid Gregorian date format:', date);
    return '';
  }
  return m.format('jYYYY/jMM/jDD');
};

/**
 * Convert Persian date string to Gregorian date (YYYY-MM-DD)
 * @param persianDate - Persian date string (e.g., "1402/10/25")
 * @returns Date string in YYYY-MM-DD format
 */
export const formatToGregorianDate = (persianDate: string): string => {
  if (!persianDate || typeof persianDate !== 'string') return '';
  const trimmedDate = persianDate.trim();
  if (!trimmedDate) return '';
  
  const m = moment(trimmedDate, 'jYYYY/jMM/jDD', true); // strict parsing
  if (!m.isValid()) {
    console.warn('Invalid Persian date format:', persianDate);
    return '';
  }
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

/**
 * Calculate the number of months between two dates
 * @param startDate - Start date in Persian format (jYYYY/jMM/jDD) or Gregorian format (YYYY-MM-DD)
 * @param endDate - End date in Persian format (jYYYY/jMM/jDD) or Gregorian format (YYYY-MM-DD)
 * @returns Number of months between the two dates (rounded up)
 */
export const calculateMonthsDifference = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  
  let startMoment: moment.Moment;
  let endMoment: moment.Moment;
  
  // Check if dates are in Persian format (contains '/')
  if (startDate.includes('/')) {
    startMoment = moment(startDate, 'jYYYY/jMM/jDD', true);
  } else {
    startMoment = moment(startDate, 'YYYY-MM-DD', true);
  }
  
  if (endDate.includes('/')) {
    endMoment = moment(endDate, 'jYYYY/jMM/jDD', true);
  } else {
    endMoment = moment(endDate, 'YYYY-MM-DD', true);
  }
  
  if (!startMoment.isValid() || !endMoment.isValid()) {
    return 0;
  }
  
  // Calculate difference in months
  const monthsDiff = endMoment.diff(startMoment, 'months', true);
  
  // If end date is before or equal to start date, return 0
  if (monthsDiff <= 0) {
    return 0;
  }
  
  // Round up to include partial months (e.g., 1.1 months becomes 2 months)
  return Math.ceil(monthsDiff);
};

/**
 * Format datetime string (ISO format) to Persian date and time
 * @param datetime - ISO datetime string (e.g., "2024-01-15T14:30:00.000Z")
 * @returns Formatted Persian datetime string (e.g., "1402/10/25 - 14:30")
 */
export const formatPersianDateTime = (datetime: string): string => {
  if (!datetime) return '';
  const m = moment(datetime);
  if (!m.isValid()) {
    return '';
  }
  const date = m.format('jYYYY/jMM/jDD');
  const time = m.format('HH:mm');
  return `${date} - ${time}`;
};

