import React from 'react';
import DatePicker from 'react-multi-date-picker';
import { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { formatToPersianDate } from '../../../shared/utils/dateUtils';

interface PersianDatePickerProps {
  value?: string; // Can be either yyyy/mm/dd (Persian) or YYYY-MM-DD (Gregorian) - will be converted
  onChange?: (value: string) => void; // Returns yyyy/mm/dd format (Persian)
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  field?: string; // Field name for form identification
}

const PersianDatePicker: React.FC<PersianDatePickerProps> = ({
  value,
  onChange,
  className = '',
  disabled = false,
  placeholder = 'انتخاب تاریخ',
  field,
}) => {
  // Convert string value to DateObject
  const getDateObjectFromString = (dateStr: string): DateObject | undefined => {
    if (!dateStr || typeof dateStr !== 'string') return undefined;
    
    let persianDateStr = dateStr;
    // If it's in Gregorian format (YYYY-MM-DD), convert to Persian
    if (dateStr.includes('-') && dateStr.length === 10) {
      persianDateStr = formatToPersianDate(dateStr);
    }
    
    if (!persianDateStr || persianDateStr.trim() === '') return undefined;
    
    const parts = persianDateStr.split('/');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      
      if (!isNaN(year) && !isNaN(month) && !isNaN(day) && year > 0 && month > 0 && month <= 12 && day > 0 && day <= 31) {
        try {
          return new DateObject({ calendar: persian, year, month: month - 1, day }); // month is 0-indexed
        } catch (error) {
          console.error('Error creating DateObject:', error);
          return undefined;
        }
      }
    }
    return undefined;
  };

  // Convert DateObject to string (yyyy/mm/dd)
  const getStringFromDateObject = (date: DateObject | null | undefined): string => {
    if (!date) return '';
    
    try {
      const year = date.year;
      const month = String(date.month.number).padStart(2, '0');
      const day = String(date.day).padStart(2, '0');
      return `${year}/${month}/${day}`;
    } catch (error) {
      console.error('Error converting DateObject to string:', error);
      return '';
    }
  };

  const dateValue = getDateObjectFromString(value || '');

  const handleChange = (date: DateObject | DateObject[] | null) => {
    if (!onChange) return;
    
    if (Array.isArray(date)) {
      // If multiple dates, take the first one
      onChange(getStringFromDateObject(date[0] || null));
    } else {
      onChange(getStringFromDateObject(date));
    }
  };

  return (
    <div style={{ direction: 'rtl' }} className={className}>
      <DatePicker
        calendar={persian}
        locale={persian_fa}
        value={dateValue}
        onChange={handleChange}
        format="YYYY/MM/DD"
        disabled={disabled}
        placeholder={placeholder}
        inputClass={`w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'
        }`}
        containerClassName="w-full"
        name={field}
        id={field}
      />
    </div>
  );
};

export default PersianDatePicker;
