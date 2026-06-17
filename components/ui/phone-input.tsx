'use client';

import React, { useState } from 'react';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  countryCode?: string;
  error?: string;
}

const COUNTRY_CODES: { [key: string]: { code: string; flag: string; name: string } } = {
  JO: { code: '+962', flag: '🇯🇴', name: 'الأردن' },
  SA: { code: '+966', flag: '🇸🇦', name: 'السعودية' },
  AE: { code: '+971', flag: '🇦🇪', name: 'الإمارات' },
  KW: { code: '+965', flag: '🇰🇼', name: 'الكويت' },
  QA: { code: '+974', flag: '🇶🇦', name: 'قطر' },
  BH: { code: '+973', flag: '🇧🇭', name: 'البحرين' },
  OM: { code: '+968', flag: '🇴🇲', name: 'عمان' },
  EG: { code: '+20', flag: '🇪🇬', name: 'مصر' },
  LB: { code: '+961', flag: '🇱🇧', name: 'لبنان' },
  SY: { code: '+963', flag: '🇸🇾', name: 'سوريا' },
};

export function PhoneInput({
  value = '',
  onChange,
  placeholder = 'أدخل رقم الهاتف',
  disabled = false,
  countryCode = 'JO',
  error
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(countryCode);
  const [showCountries, setShowCountries] = useState(false);

  const country = COUNTRY_CODES[selectedCountry];
  const phoneNumber = value.replace(/\D/g, '');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    const fullNumber = `${country.code}${input}`;
    onChange(fullNumber);
  };

  const handleCountrySelect = (code: string) => {
    setSelectedCountry(code);
    setShowCountries(false);
    // Update phone number with new country code
    if (phoneNumber) {
      const newNumber = `${COUNTRY_CODES[code].code}${phoneNumber}`;
      onChange(newNumber);
    }
  };

  const formatPhoneDisplay = () => {
    if (!phoneNumber) return '';
    if (phoneNumber.length <= 3) return phoneNumber;
    if (phoneNumber.length <= 6) return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`;
    return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6)}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {/* Country Selector */}
        <div className="relative">
          <button
            onClick={() => setShowCountries(!showCountries)}
            disabled={disabled}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex items-center gap-2 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">{country.flag}</span>
            <span className="text-sm font-medium">{country.code}</span>
          </button>

          {showCountries && (
            <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto min-w-max">
              {Object.entries(COUNTRY_CODES).map(([code, data]) => (
                <button
                  key={code}
                  onClick={() => handleCountrySelect(code)}
                  className="w-full px-4 py-2 text-right hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white text-sm"
                >
                  <span className="text-lg mr-2">{data.flag}</span>
                  {data.name} ({data.code})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Input */}
        <div className="flex-1 relative">
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400">
            <Phone className="w-4 h-4" />
          </div>
          <input
            type="tel"
            value={formatPhoneDisplay()}
            onChange={handlePhoneChange}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-600 dark:text-gray-400">
        {value ? `الرقم الكامل: ${value}` : 'أدخل رقم الهاتف بدون رمز الدولة'}
      </p>
    </div>
  );
}
