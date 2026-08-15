export interface CountryCode {
  name: string;
  code: string;
  dial_code: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { name: 'India', code: 'IN', dial_code: '+91', flag: '🇮🇳' },
  { name: 'United Arab Emirates', code: 'AE', dial_code: '+971', flag: '🇦🇪' },
  { name: 'Saudi Arabia', code: 'SA', dial_code: '+966', flag: '🇸🇦' },
  { name: 'United States', code: 'US', dial_code: '+1', flag: '🇺🇸' },
  { name: 'Canada', code: 'CA', dial_code: '+1', flag: '🇨🇦' },
  { name: 'United Kingdom', code: 'GB', dial_code: '+44', flag: '🇬🇧' },
  { name: 'Nepal', code: 'NP', dial_code: '+977', flag: '🇳🇵' },
  { name: 'Bangladesh', code: 'BD', dial_code: '+880', flag: '🇧🇩' },
  { name: 'Kuwait', code: 'KW', dial_code: '+965', flag: '🇰🇼' },
  { name: 'Qatar', code: 'QA', dial_code: '+974', flag: '🇶🇦' },
  { name: 'Oman', code: 'OM', dial_code: '+968', flag: '🇴🇲' },
  { name: 'Bahrain', code: 'BH', dial_code: '+973', flag: '🇧🇭' },
  { name: 'Singapore', code: 'SG', dial_code: '+65', flag: '🇸🇬' },
  { name: 'Malaysia', code: 'MY', dial_code: '+60', flag: '🇲🇾' },
  { name: 'Australia', code: 'AU', dial_code: '+61', flag: '🇦🇺' },
  { name: 'Germany', code: 'DE', dial_code: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', dial_code: '+33', flag: '🇫🇷' },
  { name: 'Russia', code: 'RU', dial_code: '+7', flag: '🇷🇺' },
  { name: 'Sri Lanka', code: 'LK', dial_code: '+94', flag: '🇱🇰' },
  { name: 'Indonesia', code: 'ID', dial_code: '+62', flag: '🇮🇩' },
  { name: 'Pakistan', code: 'PK', dial_code: '+92', flag: '🇵🇰' },
  { name: 'Philippines', code: 'PH', dial_code: '+63', flag: '🇵🇭' },
  { name: 'Thailand', code: 'TH', dial_code: '+66', flag: '🇹🇭' },
  { name: 'Turkey', code: 'TR', dial_code: '+90', flag: '🇹🇷' },
  { name: 'South Africa', code: 'ZA', dial_code: '+27', flag: '🇿🇦' },
  { name: 'Brazil', code: 'BR', dial_code: '+55', flag: '🇧🇷' },
  { name: 'Japan', code: 'JP', dial_code: '+81', flag: '🇯🇵' },
  { name: 'South Korea', code: 'KR', dial_code: '+82', flag: '🇰🇷' },
  { name: 'New Zealand', code: 'NZ', dial_code: '+64', flag: '🇳🇿' }
];

export type PrimaryPlatform = 'whatsapp_primary' | 'telegram_primary' | 'whatsapp_only' | 'telegram_only' | 'both';

export const PLATFORM_OPTIONS: { id: PrimaryPlatform; label: string; desc: string; icon: string }[] = [
  { 
    id: 'whatsapp_primary', 
    label: 'WhatsApp Primary (Telegram Secondary)', 
    desc: 'Main operations on WhatsApp with backup on Telegram',
    icon: '💬'
  },
  { 
    id: 'telegram_primary', 
    label: 'Telegram Primary (WhatsApp Secondary)', 
    desc: 'Main operations on Telegram channel/DM with WhatsApp backup',
    icon: '✈️'
  },
  { 
    id: 'whatsapp_only', 
    label: 'WhatsApp Only (No Telegram)', 
    desc: 'Solely deal through direct WhatsApp chat and groups',
    icon: '📱'
  },
  { 
    id: 'telegram_only', 
    label: 'Telegram Only (No WhatsApp)', 
    desc: 'Solely deal via Telegram channels, bots, or direct DMs',
    icon: '🔒'
  },
  { 
    id: 'both', 
    label: 'Equally Active on Both', 
    desc: '24/7 active customer support on both WhatsApp & Telegram',
    icon: '⚡'
  }
];

export const OPERATING_YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

