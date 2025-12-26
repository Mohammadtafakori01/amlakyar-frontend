/**
 * Format number with thousand separators (Persian/Arabic digits)
 * @param num - Number to format
 * @returns Formatted string with thousand separators
 */
export const formatPrice = (price: number | string | undefined | null): string => {
  if (price === undefined || price === null) return '';
  const numPrice = typeof price === 'string' ? parseFloat(price) || 0 : price;
  return new Intl.NumberFormat('fa-IR').format(numPrice);
};

/**
 * Format number with thousand separators (English digits)
 * @param num - Number to format
 * @returns Formatted string with thousand separators
 */
export const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null) return '';
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Remove thousand separators and convert to number
 * @param formattedString - Formatted string with separators
 * @returns Number value
 */
export const parseFormattedNumber = (formattedString: string): number => {
  if (!formattedString) return 0;
  // Remove all non-digit characters except decimal point
  const cleaned = formattedString.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
};

