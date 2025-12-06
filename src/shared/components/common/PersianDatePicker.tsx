import React, { useEffect, useRef } from 'react';
import { formatToPersianDate } from '../../../shared/utils/dateUtils';

interface PersianDatePickerProps {
  value?: string; // Can be either yyyy/mm/dd (Persian) or YYYY-MM-DD (Gregorian) - will be converted
  onChange?: (value: string) => void; // Returns yyyy/mm/dd format (Persian)
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

const PersianDatePicker: React.FC<PersianDatePickerProps> = ({
  value,
  onChange,
  className = '',
  disabled = false,
  placeholder = 'انتخاب تاریخ',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!inputRef.current || typeof window === 'undefined') return;

    // Note: CSS for persian-datepicker should be loaded separately
    // The library may work with minimal styling, or you can add styles manually

    let $: any;
    let isMounted = true;

    // Load jQuery and persian-datepicker asynchronously
    const loadLibraries = async () => {
      // Try to get jQuery from window first (if already loaded)
      if ((window as any).jQuery && (window as any).jQuery.fn && (window as any).jQuery.fn.pDatepicker) {
        $ = (window as any).jQuery;
        initializeDatePicker($, isMounted);
        return;
      }

      if ((window as any).$ && (window as any).$.fn && (window as any).$.fn.pDatepicker) {
        $ = (window as any).$;
        initializeDatePicker($, isMounted);
        return;
      }

      // Load jQuery from CDN if not available
      const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          // Check if script already exists
          const existingScript = document.querySelector(`script[src="${src}"]`);
          if (existingScript) {
            resolve();
            return;
          }

          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
          document.head.appendChild(script);
        });
      };

      try {
        // Load jQuery from CDN
        if (!(window as any).jQuery && !(window as any).$) {
          await loadScript('https://code.jquery.com/jquery-3.7.1.min.js');
        }
        
        $ = (window as any).jQuery || (window as any).$;
        if (!$ || typeof $ !== 'function') {
          console.error('jQuery did not load correctly');
          return;
        }

        // Load persian-datepicker dependencies from CDN
        if (!$ || !$.fn || !$.fn.pDatepicker) {
          // First load persian-date (dependency)
          if (!(window as any).persianDate) {
            await loadScript('https://cdn.jsdelivr.net/npm/persian-date@1.1.0/dist/persian-date.min.js');
          }
          // Then load persian-datepicker
          await loadScript('https://cdn.jsdelivr.net/npm/persian-datepicker@1.2.0/dist/js/persian-datepicker.min.js');
        }

        $ = (window as any).jQuery || (window as any).$;
        if ($ && isMounted && inputRef.current) {
          // Wait for plugin to be available (polling)
          let attempts = 0;
          const maxAttempts = 20; // 2 seconds max wait
          const checkPlugin = setInterval(() => {
            attempts++;
            if (($.fn && $.fn.pDatepicker) || attempts >= maxAttempts) {
              clearInterval(checkPlugin);
              if (isMounted && inputRef.current && $.fn && $.fn.pDatepicker) {
                initializeDatePicker($, isMounted);
              } else if (attempts >= maxAttempts) {
                console.error('persian-datepicker plugin failed to load');
              }
            }
          }, 100);
        }
      } catch (error) {
        console.error('Failed to load jQuery or persian-datepicker:', error);
      }
    };

    const initializeDatePicker = ($: any, isMounted: boolean) => {
      if (!isMounted || !inputRef.current || isInitializedRef.current) return;

      const $input = $(inputRef.current);
      if (!$input || typeof $input.pDatepicker !== 'function') {
        console.error('pDatepicker plugin not available');
        return;
      }

      // Initialize datepicker only once
      $input.pDatepicker({
        calendarType: 'persian',
        format: 'YYYY/MM/DD',
        initialValue: false,
        autoClose: true,
        observer: true,
        onSelect: (unixDate: number) => {
          if (onChange && isMounted) {
            // Get the selected date as array [year, month, day]
            const selectedDate = $input.pDatepicker('getDate');
            if (selectedDate && selectedDate.length === 3) {
              const [year, month, day] = selectedDate;
              // Format as yyyy/mm/dd (month is 0-indexed, so add 1)
              const formattedDate = `${year}/${String(month + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
              onChange(formattedDate);
            } else {
              onChange('');
            }
          }
        },
      });

      isInitializedRef.current = true;
    };

    loadLibraries();

    return () => {
      isMounted = false;
      // Cleanup: destroy datepicker instance on unmount
      if (isInitializedRef.current && inputRef.current && typeof window !== 'undefined') {
        const $cleanup = (window as any).jQuery || (window as any).$;
        if ($cleanup && typeof $cleanup === 'function') {
          try {
            const $input = $cleanup(inputRef.current);
            if ($input && $input.data && $input.data('pDatepicker')) {
              $input.pDatepicker('destroy');
            }
          } catch (error) {
            // Ignore cleanup errors
          }
          isInitializedRef.current = false;
        }
      }
    };
  }, [onChange]);

  // Update value when prop changes
  useEffect(() => {
    if (!inputRef.current || !isInitializedRef.current || typeof window === 'undefined') return;

    const $ = (window as any).jQuery || (window as any).$;
    if (!$) return;

    const $input = $(inputRef.current);
    let persianDateStr = value || '';

    // If it's in Gregorian format (YYYY-MM-DD), convert to Persian
    if (value && value.includes('-') && value.length === 10) {
      persianDateStr = formatToPersianDate(value);
    }

    if (persianDateStr && persianDateStr.trim() !== '') {
      // Parse yyyy/mm/dd format
      const parts = persianDateStr.split('/');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);

        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          // Set date: [year, month-1, day] - month is 0-indexed
          $input.pDatepicker('setDate', [year, month - 1, day]);
        }
      }
    } else {
      $input.pDatepicker('setDate', null);
    }
  }, [value]);

  // Handle disabled state
  useEffect(() => {
    if (!inputRef.current || typeof window === 'undefined') return;
    const $ = (window as any).jQuery || (window as any).$;
    if (!$) return;
    const $input = $(inputRef.current);
    $input.prop('disabled', disabled);
  }, [disabled]);

  return (
    <div style={{ direction: 'rtl' }} className={className}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
        readOnly
      />
    </div>
  );
};

export default PersianDatePicker;
