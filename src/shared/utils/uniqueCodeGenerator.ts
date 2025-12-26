import moment from 'moment-jalaali';

/**
 * Generate unique code in format: yyyymmddhhii + counter
 * @param counter - Counter number (default: 1)
 * @returns Unique code string (e.g., "14031225143001")
 */
export const generateUniqueCode = (counter: number = 1): string => {
  const now = moment();
  const dateTime = now.format('jYYYYjMMjDDjHHjmm');
  const counterStr = counter.toString().padStart(2, '0');
  return `${dateTime}${counterStr}`;
};

/**
 * Get counter from localStorage based on current date and time (minute-based)
 * Counter resets every minute
 */
export const getCounterFromStorage = (): number => {
  if (typeof window === 'undefined') return 1;
  
  const now = moment();
  const currentMinute = now.format('jYYYYjMMjDDjHHjmm');
  const storageKey = `property_file_counter_${currentMinute}`;
  
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    const counter = parseInt(stored, 10);
    const newCounter = counter + 1;
    localStorage.setItem(storageKey, newCounter.toString());
    return newCounter;
  } else {
    // Clear old counters (older than 1 hour)
    const oneHourAgo = now.clone().subtract(1, 'hour');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('property_file_counter_')) {
        const timestamp = key.replace('property_file_counter_', '');
        const keyMoment = moment(timestamp, 'jYYYYjMMjDDjHHjmm');
        if (keyMoment.isBefore(oneHourAgo)) {
          localStorage.removeItem(key);
        }
      }
    }
    
    localStorage.setItem(storageKey, '1');
    return 1;
  }
};

/**
 * Generate unique code with auto-incrementing counter
 */
export const generateUniqueCodeWithCounter = (): string => {
  const counter = getCounterFromStorage();
  return generateUniqueCode(counter);
};

