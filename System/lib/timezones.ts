/* Developed by RUDRA via NEKLLM */
// Comprehensive Global Timezones with GMT/UTC offsets

export interface TimezoneInfo {
    value: string;
    label: string;
    offset: string;
    region: string;
}

export const TIMEZONES: TimezoneInfo[] = [
    { value: 'UTC', label: '(GMT+00:00) UTC - Coordinated Universal Time', offset: '+00:00', region: 'Global' },
    
    // Europe
    { value: 'Europe/London', label: '(GMT+00:00) London, Dublin, Edinburgh, Lisbon', offset: '+00:00', region: 'Europe' },
    { value: 'Europe/Paris', label: '(GMT+01:00) Paris, Berlin, Rome, Madrid, Brussels', offset: '+01:00', region: 'Europe' },
    { value: 'Europe/Amsterdam', label: '(GMT+01:00) Amsterdam, Vienna, Zurich, Stockholm', offset: '+01:00', region: 'Europe' },
    { value: 'Europe/Warsaw', label: '(GMT+01:00) Warsaw, Prague, Budapest, Belgrade', offset: '+01:00', region: 'Europe' },
    { value: 'Europe/Athens', label: '(GMT+02:00) Athens, Bucharest, Sofia, Nicosia', offset: '+02:00', region: 'Europe' },
    { value: 'Europe/Helsinki', label: '(GMT+02:00) Helsinki, Kyiv, Riga, Tallinn, Vilnius', offset: '+02:00', region: 'Europe' },
    { value: 'Europe/Istanbul', label: '(GMT+03:00) Istanbul, Ankara', offset: '+03:00', region: 'Europe' },
    { value: 'Europe/Moscow', label: '(GMT+03:00) Moscow, St. Petersburg, Volgograd', offset: '+03:00', region: 'Europe' },
    { value: 'Europe/Samara', label: '(GMT+04:00) Samara, Ufa', offset: '+04:00', region: 'Europe' },

    // Americas - North
    { value: 'America/New_York', label: '(GMT-05:00) Eastern Time (US & Canada) - New York, Miami', offset: '-05:00', region: 'North America' },
    { value: 'America/Chicago', label: '(GMT-06:00) Central Time (US & Canada) - Chicago, Dallas', offset: '-06:00', region: 'North America' },
    { value: 'America/Denver', label: '(GMT-07:00) Mountain Time (US & Canada) - Denver, Phoenix', offset: '-07:00', region: 'North America' },
    { value: 'America/Los_Angeles', label: '(GMT-08:00) Pacific Time (US & Canada) - Los Angeles, SF, Seattle', offset: '-08:00', region: 'North America' },
    { value: 'America/Anchorage', label: '(GMT-09:00) Alaska - Anchorage, Juneau', offset: '-09:00', region: 'North America' },
    { value: 'Pacific/Honolulu', label: '(GMT-10:00) Hawaii - Honolulu', offset: '-10:00', region: 'North America' },
    { value: 'America/Halifax', label: '(GMT-04:00) Atlantic Time (Canada) - Halifax', offset: '-04:00', region: 'North America' },
    { value: 'America/St_Johns', label: '(GMT-03:30) Newfoundland - St. John’s', offset: '-03:30', region: 'North America' },
    { value: 'America/Toronto', label: '(GMT-05:00) Eastern Canada - Toronto, Montreal, Ottawa', offset: '-05:00', region: 'North America' },
    { value: 'America/Vancouver', label: '(GMT-08:00) Pacific Canada - Vancouver, Victoria', offset: '-08:00', region: 'North America' },
    { value: 'America/Mexico_City', label: '(GMT-06:00) Central Mexico - Mexico City, Monterrey', offset: '-06:00', region: 'North America' },

    // Americas - Central & Caribbean & South
    { value: 'America/Bogota', label: '(GMT-05:00) Colombia, Ecuador, Peru - Bogota, Lima, Quito', offset: '-05:00', region: 'South America' },
    { value: 'America/Caracas', label: '(GMT-04:00) Venezuela - Caracas', offset: '-04:00', region: 'South America' },
    { value: 'America/Santiago', label: '(GMT-04:00) Chile - Santiago', offset: '-04:00', region: 'South America' },
    { value: 'America/Buenos_Aires', label: '(GMT-03:00) Argentina - Buenos Aires, Cordoba', offset: '-03:00', region: 'South America' },
    { value: 'America/Sao_Paulo', label: '(GMT-03:00) Brazil - São Paulo, Rio de Janeiro, Brasilia', offset: '-03:00', region: 'South America' },
    { value: 'America/Montevideo', label: '(GMT-03:00) Uruguay - Montevideo', offset: '-03:00', region: 'South America' },
    { value: 'America/Panama', label: '(GMT-05:00) Panama - Panama City', offset: '-05:00', region: 'Central America' },
    { value: 'America/Costa_Rica', label: '(GMT-06:00) Costa Rica - San Jose', offset: '-06:00', region: 'Central America' },
    { value: 'America/Santo_Domingo', label: '(GMT-04:00) Dominican Republic - Santo Domingo', offset: '-04:00', region: 'Caribbean' },
    { value: 'America/Puerto_Rico', label: '(GMT-04:00) Puerto Rico - San Juan', offset: '-04:00', region: 'Caribbean' },

    // Middle East & North Africa
    { value: 'Asia/Dubai', label: '(GMT+04:00) United Arab Emirates, Oman - Dubai, Abu Dhabi, Muscat', offset: '+04:00', region: 'Middle East' },
    { value: 'Asia/Riyadh', label: '(GMT+03:00) Saudi Arabia, Qatar, Kuwait, Bahrain - Riyadh, Doha, Kuwait City, Manama', offset: '+03:00', region: 'Middle East' },
    { value: 'Asia/Baghdad', label: '(GMT+03:00) Iraq - Baghdad', offset: '+03:00', region: 'Middle East' },
    { value: 'Asia/Amman', label: '(GMT+03:00) Jordan - Amman', offset: '+03:00', region: 'Middle East' },
    { value: 'Asia/Beirut', label: '(GMT+02:00) Lebanon - Beirut', offset: '+02:00', region: 'Middle East' },
    { value: 'Asia/Jerusalem', label: '(GMT+02:00) Israel - Jerusalem, Tel Aviv', offset: '+02:00', region: 'Middle East' },
    { value: 'Asia/Tehran', label: '(GMT+03:30) Iran - Tehran', offset: '+03:30', region: 'Middle East' },
    { value: 'Africa/Cairo', label: '(GMT+02:00) Egypt - Cairo, Alexandria', offset: '+02:00', region: 'Africa' },
    { value: 'Africa/Casablanca', label: '(GMT+01:00) Morocco - Casablanca, Rabat', offset: '+01:00', region: 'Africa' },
    { value: 'Africa/Algiers', label: '(GMT+01:00) Algeria - Algiers', offset: '+01:00', region: 'Africa' },
    { value: 'Africa/Tunis', label: '(GMT+01:00) Tunisia - Tunis', offset: '+01:00', region: 'Africa' },

    // Sub-Saharan Africa
    { value: 'Africa/Lagos', label: '(GMT+01:00) West Africa - Lagos, Abuja, Accra, Douala', offset: '+01:00', region: 'Africa' },
    { value: 'Africa/Johannesburg', label: '(GMT+02:00) South Africa - Johannesburg, Cape Town, Pretoria', offset: '+02:00', region: 'Africa' },
    { value: 'Africa/Nairobi', label: '(GMT+03:00) East Africa - Nairobi, Addis Ababa, Dar es Salaam, Kampala', offset: '+03:00', region: 'Africa' },
    { value: 'Africa/Kigali', label: '(GMT+02:00) Central Africa - Kigali, Harare, Lusaka, Maputo', offset: '+02:00', region: 'Africa' },

    // Asia - South & Central
    { value: 'Asia/Dhaka', label: '(GMT+06:00) Bangladesh - Dhaka, Chittagong, Sylhet', offset: '+06:00', region: 'Asia' },
    { value: 'Asia/Kolkata', label: '(GMT+05:30) India, Sri Lanka - New Delhi, Mumbai, Bengaluru, Colombo', offset: '+05:30', region: 'Asia' },
    { value: 'Asia/Kathmandu', label: '(GMT+05:45) Nepal - Kathmandu', offset: '+05:45', region: 'Asia' },
    { value: 'Asia/Karachi', label: '(GMT+05:00) Pakistan - Karachi, Lahore, Islamabad', offset: '+05:00', region: 'Asia' },
    { value: 'Asia/Kabul', label: '(GMT+04:30) Afghanistan - Kabul', offset: '+04:30', region: 'Asia' },
    { value: 'Asia/Tashkent', label: '(GMT+05:00) Uzbekistan, Turkmenistan - Tashkent, Ashgabat', offset: '+05:00', region: 'Asia' },
    { value: 'Asia/Almaty', label: '(GMT+05:00) Kazakhstan - Almaty, Astana', offset: '+05:00', region: 'Asia' },
    { value: 'Asia/Baku', label: '(GMT+04:00) Azerbaijan, Georgia, Armenia - Baku, Tbilisi, Yerevan', offset: '+04:00', region: 'Asia' },

    // Asia - East & South-East
    { value: 'Asia/Bangkok', label: '(GMT+07:00) Thailand, Vietnam, Cambodia, Laos, Indonesia (West) - Bangkok, Hanoi, Jakarta, Phnom Penh', offset: '+07:00', region: 'Asia' },
    { value: 'Asia/Yangon', label: '(GMT+06:30) Myanmar - Yangon, Naypyidaw', offset: '+06:30', region: 'Asia' },
    { value: 'Asia/Singapore', label: '(GMT+08:00) Singapore, Malaysia, Philippines - Singapore, Kuala Lumpur, Manila', offset: '+08:00', region: 'Asia' },
    { value: 'Asia/Hong_Kong', label: '(GMT+08:00) Hong Kong, Taiwan - Hong Kong, Taipei', offset: '+08:00', region: 'Asia' },
    { value: 'Asia/Shanghai', label: '(GMT+08:00) China - Beijing, Shanghai, Shenzhen, Guangzhou', offset: '+08:00', region: 'Asia' },
    { value: 'Asia/Tokyo', label: '(GMT+09:00) Japan - Tokyo, Osaka, Kyoto', offset: '+09:00', region: 'Asia' },
    { value: 'Asia/Seoul', label: '(GMT+09:00) South Korea - Seoul, Busan', offset: '+09:00', region: 'Asia' },
    { value: 'Asia/Ulaanbaatar', label: '(GMT+08:00) Mongolia - Ulaanbaatar', offset: '+08:00', region: 'Asia' },

    // Australia & Pacific
    { value: 'Australia/Sydney', label: '(GMT+10:00) Eastern Australia - Sydney, Melbourne, Brisbane, Canberra', offset: '+10:00', region: 'Australia' },
    { value: 'Australia/Adelaide', label: '(GMT+09:30) Central Australia - Adelaide, Darwin', offset: '+09:30', region: 'Australia' },
    { value: 'Australia/Perth', label: '(GMT+08:00) Western Australia - Perth', offset: '+08:00', region: 'Australia' },
    { value: 'Pacific/Auckland', label: '(GMT+12:00) New Zealand - Auckland, Wellington, Christchurch', offset: '+12:00', region: 'Pacific' },
    { value: 'Pacific/Fiji', label: '(GMT+12:00) Fiji - Suva', offset: '+12:00', region: 'Pacific' },
    { value: 'Pacific/Port_Moresby', label: '(GMT+10:00) Papua New Guinea - Port Moresby', offset: '+10:00', region: 'Pacific' },
    { value: 'Pacific/Guam', label: '(GMT+10:00) Guam, Saipan', offset: '+10:00', region: 'Pacific' },
];

export function getAllTimezones(): TimezoneInfo[] {
    return TIMEZONES;
}

export function getTimezoneInfo(value: string, date: Date = new Date()): TimezoneInfo {
    const info = TIMEZONES.find((t) => t.value === value) || {
        value,
        label: `(GMT+00:00) ${value}`,
        offset: '+00:00',
        region: 'Global',
    };
    try {
        const zone = new Intl.DateTimeFormat('en', {
            timeZone: value, timeZoneName: 'longOffset',
        }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value;
        const offset = zone === 'GMT' ? '+00:00' : zone?.replace('GMT', '');
        if (offset) return { ...info, offset, label: info.label.replace(/\(GMT[^)]*\)/, `(GMT${offset})`) };
    } catch {
        // Preserve the existing fallback for unknown timezone identifiers.
    }
    return info;
}
