import { useState, useEffect } from 'react';
import { FiRepeat } from 'react-icons/fi';

interface DepositRentConverterProps {
  minDeposit?: number;
  maxDeposit?: number;
  monthlyRent?: number;
  initialDeposit?: number;
  isPriceConvertible?: boolean;
  onDepositChange?: (min: number, max: number) => void;
  onRentChange?: (rent: number) => void;
}

export default function DepositRentConverter({
  minDeposit,
  maxDeposit,
  monthlyRent,
  initialDeposit,
  isPriceConvertible = false,
  onDepositChange,
  onRentChange,
}: DepositRentConverterProps) {
  // Use initialDeposit if provided, otherwise default to maxDeposit
  const defaultDeposit = Number(initialDeposit) || Number(maxDeposit) || 0;
  const [depositValue, setDepositValue] = useState<number>(defaultDeposit);
  const [rentValue, setRentValue] = useState<number>(Number(monthlyRent) || 0);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);

  // Conversion rate: هر ۱۰۰ میلیون کاهش رهن = ۳ میلیون افزایش اجاره
  // So: rent = monthlyRent + (maxDeposit - deposit) * 0.03
  const CONVERSION_RATE = 0.03;

  useEffect(() => {
    if (maxDeposit && monthlyRent) {
      // Initialize with initialDeposit if provided, otherwise use maxDeposit
      const initialValue = Number(initialDeposit) || Number(maxDeposit);
      setDepositValue(initialValue);
      // Calculate rent for the initial deposit value using the formula directly
      const initialRent = Number(monthlyRent) + (Number(maxDeposit) - initialValue) * CONVERSION_RATE;
      setRentValue(Math.round(initialRent));
    }
  }, [maxDeposit, monthlyRent, initialDeposit]);

  // Convert deposit to rent (inverse relationship)
  // Formula: rent = monthlyRent + (maxDeposit - deposit) * 0.03
  // Example: deposit 90M → rent 3M, deposit 60M → rent 3M + (90M - 60M) * 0.03 = 3.9M
  const convertDepositToRent = (deposit: number): number => {
    if (!maxDeposit || !monthlyRent) return 0;
    
    // When deposit is at maxDeposit, rent is monthlyRent (minimum rent)
    // When deposit decreases, rent increases proportionally
    const rent = Number(monthlyRent) + (Number(maxDeposit) - Number(deposit)) * CONVERSION_RATE;
    return Math.round(rent);
  };

  // Convert rent to deposit (inverse relationship)
  // Formula: deposit = maxDeposit - (rent - monthlyRent) / 0.03
  const convertRentToDeposit = (rent: number): number => {
    if (!maxDeposit || !monthlyRent) return 0;
    
    // Inverse calculation: deposit = maxDeposit - (rent - monthlyRent) / CONVERSION_RATE
    const deposit = Number(maxDeposit) - (Number(rent) - Number(monthlyRent)) / CONVERSION_RATE;
    return Math.round(deposit);
  };

  const handleDepositChange = (value: number) => {
    const numValue = Number(value);
    const numMinDeposit = Number(minDeposit) || 0;
    const numMaxDeposit = Number(maxDeposit) || numValue;
    const clampedValue = Math.max(numMinDeposit, Math.min(numValue, numMaxDeposit));
    setDepositValue(clampedValue);
    if (isPriceConvertible) {
      setIsConverting(true);
      setConversionProgress(0);
      
      // Animate progress bar
      const interval = setInterval(() => {
        setConversionProgress((prev) => {
          const numPrev = Number(prev);
          if (numPrev >= 100) {
            clearInterval(interval);
            setIsConverting(false);
            const convertedRent = convertDepositToRent(clampedValue);
            setRentValue(convertedRent);
            if (onRentChange) {
              onRentChange(convertedRent);
            }
            return 100;
          }
          return numPrev + 10;
        });
      }, 50);
    }
  };

  const handleRentChange = (value: number) => {
    const numValue = Number(value);
    setRentValue(numValue);
    if (isPriceConvertible) {
      setIsConverting(true);
      setConversionProgress(0);
      
      // Animate progress bar
      const interval = setInterval(() => {
        setConversionProgress((prev) => {
          const numPrev = Number(prev);
          if (numPrev >= 100) {
            clearInterval(interval);
            setIsConverting(false);
            const convertedDeposit = convertRentToDeposit(numValue);
            setDepositValue(convertedDeposit);
            if (onDepositChange) {
              onDepositChange(convertedDeposit, convertedDeposit);
            }
            return 100;
          }
          return numPrev + 10;
        });
      }, 50);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  if (!isPriceConvertible) {
    return null;
  }

  const numMaxDeposit = Number(maxDeposit) || 0;
  const numMinDeposit = Number(minDeposit) || 0;
  const depositRange = numMaxDeposit && numMinDeposit ? numMaxDeposit - numMinDeposit : 0;
  const currentDepositPercent = depositRange > 0 && numMinDeposit
    ? ((Number(depositValue) - numMinDeposit) / depositRange) * 100
    : 0;

  return (
    <div className="rounded-2xl border border-primary-200 bg-primary-50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">مبدل رهن و اجاره</h3>
        <div className="flex items-center gap-2 text-sm text-primary-700">
          <span>رابطه معکوس: با کاهش رهن، اجاره افزایش می‌یابد</span>
        </div>
      </div>

      {/* Progress Bar */}
      {isConverting && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
            <span>در حال تبدیل...</span>
            <span>{conversionProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-primary-600 transition-all duration-300 ease-out"
              style={{ width: `${conversionProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Deposit Range Slider */}
      {minDeposit && maxDeposit && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
            <span>محدوده رهن</span>
            <span>
              {formatPrice(minDeposit)} - {formatPrice(maxDeposit)} ریال
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min={numMinDeposit}
              max={numMaxDeposit}
              value={depositValue}
              onChange={(e) => handleDepositChange(parseInt(e.target.value))}
              step={1000000}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary-600"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>{formatPrice(minDeposit)}</span>
              <span className="font-semibold text-primary-600">{formatPrice(depositValue)}</span>
              <span>{formatPrice(maxDeposit)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Converter Inputs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">رهن (ریال)</label>
          <div className="relative">
            <input
              type="number"
              value={depositValue || ''}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                if (!isNaN(value)) {
                  handleDepositChange(value);
                }
              }}
              min={numMinDeposit}
              max={numMaxDeposit}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-right text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="مبلغ رهن"
            />
            {minDeposit && maxDeposit && (
              <div className="mt-1 text-xs text-gray-500">
                محدوده: {formatPrice(minDeposit)} - {formatPrice(maxDeposit)} ریال
              </div>
            )}
          </div>
        </div>

        {/* <div className="flex items-center justify-center">
          <div className="rounded-full bg-primary-600 p-3 text-white">
            <FiRepeat className="w-6 h-6" />
          </div>
        </div> */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">اجاره ماهانه (ریال)</label>
          <input
            type="number"
            value={rentValue || ''}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                if (!isNaN(value)) {
                  handleRentChange(value);
                }
              }}
            min={0}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-right text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            placeholder="مبلغ اجاره"
          />
        </div>
      </div>

      {/* Conversion Info */}
      <div className="mt-4 rounded-lg bg-white p-3 text-center text-sm text-gray-600">
        <p>
          رهن انتخاب شده: <span className="font-semibold text-primary-600">{formatPrice(depositValue)}</span> ریال
        </p>
        <p className="mt-1">
          اجاره معادل: <span className="font-semibold text-primary-600">{formatPrice(rentValue)}</span> ریال
        </p>
      </div>
    </div>
  );
}
