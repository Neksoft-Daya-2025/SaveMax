/* Developed by RUDRA via NEKLLM */
// Comprehensive World Currencies utility

export interface CurrencyInfo {
    code: string;
    symbol: string;
    name: string;
    symbolNative?: string;
    flag?: string;
}

export const currencies: Record<string, CurrencyInfo> = {
    USD: { code: 'USD', symbol: '$', symbolNative: '$', name: 'US Dollar' },
    EUR: { code: 'EUR', symbol: '€', symbolNative: '€', name: 'Euro' },
    GBP: { code: 'GBP', symbol: '£', symbolNative: '£', name: 'British Pound' },
    JPY: { code: 'JPY', symbol: '¥', symbolNative: '￥', name: 'Japanese Yen' },
    CAD: { code: 'CAD', symbol: 'CA$', symbolNative: '$', name: 'Canadian Dollar' },
    AUD: { code: 'AUD', symbol: 'AU$', symbolNative: '$', name: 'Australian Dollar' },
    CHF: { code: 'CHF', symbol: 'CHF', symbolNative: 'CHF', name: 'Swiss Franc' },
    CNY: { code: 'CNY', symbol: 'CN¥', symbolNative: '¥', name: 'Chinese Yuan' },
    INR: { code: 'INR', symbol: '₹', symbolNative: '₹', name: 'Indian Rupee' },
    BDT: { code: 'BDT', symbol: '৳', symbolNative: '৳', name: 'Bangladeshi Taka' },
    AED: { code: 'AED', symbol: 'AED', symbolNative: 'د.إ', name: 'United Arab Emirates Dirham' },
    SAR: { code: 'SAR', symbol: 'SAR', symbolNative: 'ر.س', name: 'Saudi Riyal' },
    QAR: { code: 'QAR', symbol: 'QAR', symbolNative: 'ر.ق', name: 'Qatari Riyal' },
    KWD: { code: 'KWD', symbol: 'KWD', symbolNative: 'د.ك', name: 'Kuwaiti Dinar' },
    BHD: { code: 'BHD', symbol: 'BHD', symbolNative: 'د.ب', name: 'Bahraini Dinar' },
    OMR: { code: 'OMR', symbol: 'OMR', symbolNative: 'ر.ع', name: 'Omani Rial' },
    JOD: { code: 'JOD', symbol: 'JOD', symbolNative: 'د.ا', name: 'Jordanian Dinar' },
    EGP: { code: 'EGP', symbol: 'EGP', symbolNative: 'ج.م', name: 'Egyptian Pound' },
    TRY: { code: 'TRY', symbol: '₺', symbolNative: '₺', name: 'Turkish Lira' },
    PKR: { code: 'PKR', symbol: 'PKR', symbolNative: '₨', name: 'Pakistani Rupee' },
    LKR: { code: 'LKR', symbol: 'LKR', symbolNative: 'රු', name: 'Sri Lankan Rupee' },
    NPR: { code: 'NPR', symbol: 'NPR', symbolNative: 'रु', name: 'Nepalese Rupee' },
    AFN: { code: 'AFN', symbol: 'AFN', symbolNative: '؋', name: 'Afghan Afghani' },
    SGD: { code: 'SGD', symbol: 'SG$', symbolNative: '$', name: 'Singapore Dollar' },
    MYR: { code: 'MYR', symbol: 'RM', symbolNative: 'RM', name: 'Malaysian Ringgit' },
    THB: { code: 'THB', symbol: '฿', symbolNative: '฿', name: 'Thai Baht' },
    IDR: { code: 'IDR', symbol: 'Rp', symbolNative: 'Rp', name: 'Indonesian Rupiah' },
    PHP: { code: 'PHP', symbol: '₱', symbolNative: '₱', name: 'Philippine Peso' },
    VND: { code: 'VND', symbol: '₫', symbolNative: '₫', name: 'Vietnamese Dong' },
    HKD: { code: 'HKD', symbol: 'HK$', symbolNative: '$', name: 'Hong Kong Dollar' },
    TWD: { code: 'TWD', symbol: 'NT$', symbolNative: 'NT$', name: 'New Taiwan Dollar' },
    KRW: { code: 'KRW', symbol: '₩', symbolNative: '₩', name: 'South Korean Won' },
    NZD: { code: 'NZD', symbol: 'NZ$', symbolNative: '$', name: 'New Zealand Dollar' },
    BRL: { code: 'BRL', symbol: 'R$', symbolNative: 'R$', name: 'Brazilian Real' },
    MXN: { code: 'MXN', symbol: 'MX$', symbolNative: '$', name: 'Mexican Peso' },
    ARS: { code: 'ARS', symbol: 'AR$', symbolNative: '$', name: 'Argentine Peso' },
    CLP: { code: 'CLP', symbol: 'CL$', symbolNative: '$', name: 'Chilean Peso' },
    COP: { code: 'COP', symbol: 'CO$', symbolNative: '$', name: 'Colombian Peso' },
    PEN: { code: 'PEN', symbol: 'S/', symbolNative: 'S/', name: 'Peruvian Sol' },
    UYU: { code: 'UYU', symbol: '$U', symbolNative: '$', name: 'Uruguayan Peso' },
    ZAR: { code: 'ZAR', symbol: 'R', symbolNative: 'R', name: 'South African Rand' },
    NGN: { code: 'NGN', symbol: '₦', symbolNative: '₦', name: 'Nigerian Naira' },
    KES: { code: 'KES', symbol: 'KSh', symbolNative: 'KSh', name: 'Kenyan Shilling' },
    GHS: { code: 'GHS', symbol: 'GH₵', symbolNative: 'GH₵', name: 'Ghanaian Cedi' },
    MAD: { code: 'MAD', symbol: 'MAD', symbolNative: 'د.م.', name: 'Moroccan Dirham' },
    DZD: { code: 'DZD', symbol: 'DZD', symbolNative: 'د.ج', name: 'Algerian Dinar' },
    TND: { code: 'TND', symbol: 'TND', symbolNative: 'د.ت', name: 'Tunisian Dinar' },
    TZS: { code: 'TZS', symbol: 'TSh', symbolNative: 'TSh', name: 'Tanzanian Shilling' },
    UGX: { code: 'UGX', symbol: 'USh', symbolNative: 'USh', name: 'Ugandan Shilling' },
    RWF: { code: 'RWF', symbol: 'RF', symbolNative: 'RF', name: 'Rwandan Franc' },
    ETB: { code: 'ETB', symbol: 'ETB', symbolNative: 'Br', name: 'Ethiopian Birr' },
    RUB: { code: 'RUB', symbol: '₽', symbolNative: '₽', name: 'Russian Ruble' },
    UAH: { code: 'UAH', symbol: '₴', symbolNative: '₴', name: 'Ukrainian Hryvnia' },
    PLN: { code: 'PLN', symbol: 'zł', symbolNative: 'zł', name: 'Polish Zloty' },
    SEK: { code: 'SEK', symbol: 'kr', symbolNative: 'kr', name: 'Swedish Krona' },
    NOK: { code: 'NOK', symbol: 'kr', symbolNative: 'kr', name: 'Norwegian Krone' },
    DKK: { code: 'DKK', symbol: 'kr.', symbolNative: 'kr.', name: 'Danish Krone' },
    CZK: { code: 'CZK', symbol: 'Kč', symbolNative: 'Kč', name: 'Czech Koruna' },
    HUF: { code: 'HUF', symbol: 'Ft', symbolNative: 'Ft', name: 'Hungarian Forint' },
    RON: { code: 'RON', symbol: 'lei', symbolNative: 'lei', name: 'Romanian Leu' },
    BGN: { code: 'BGN', symbol: 'лв.', symbolNative: 'лв.', name: 'Bulgarian Lev' },
    HRK: { code: 'HRK', symbol: 'kn', symbolNative: 'kn', name: 'Croatian Kuna' },
    RSD: { code: 'RSD', symbol: 'дин.', symbolNative: 'дин.', name: 'Serbian Dinar' },
    ILS: { code: 'ILS', symbol: '₪', symbolNative: '₪', name: 'Israeli New Shekel' },
    IQD: { code: 'IQD', symbol: 'IQD', symbolNative: 'د.ع', name: 'Iraqi Dinar' },
    LBP: { code: 'LBP', symbol: 'LBP', symbolNative: 'ل.ل', name: 'Lebanese Pound' },
    KZT: { code: 'KZT', symbol: '₸', symbolNative: '₸', name: 'Kazakhstani Tenge' },
    UZS: { code: 'UZS', symbol: 'UZS', symbolNative: 'soʻm', name: 'Uzbekistani Som' },
    GEL: { code: 'GEL', symbol: '₾', symbolNative: '₾', name: 'Georgian Lari' },
    AZN: { code: 'AZN', symbol: '₼', symbolNative: '₼', name: 'Azerbaijani Manat' },
    AMD: { code: 'AMD', symbol: '֏', symbolNative: '֏', name: 'Armenian Dram' },
    CRC: { code: 'CRC', symbol: '₡', symbolNative: '₡', name: 'Costa Rican Colón' },
    DOP: { code: 'DOP', symbol: 'RD$', symbolNative: '$', name: 'Dominican Peso' },
    GTQ: { code: 'GTQ', symbol: 'Q', symbolNative: 'Q', name: 'Guatemalan Quetzal' },
    HNL: { code: 'HNL', symbol: 'L', symbolNative: 'L', name: 'Honduran Lempira' },
    NIO: { code: 'NIO', symbol: 'C$', symbolNative: 'C$', name: 'Nicaraguan Córdoba' },
    PAB: { code: 'PAB', symbol: 'B/.', symbolNative: 'B/.', name: 'Panamanian Balboa' },
    BOB: { code: 'BOB', symbol: 'Bs.', symbolNative: 'Bs.', name: 'Bolivian Boliviano' },
    PYG: { code: 'PYG', symbol: '₲', symbolNative: '₲', name: 'Paraguayan Guaraní' },
    JMD: { code: 'JMD', symbol: 'J$', symbolNative: '$', name: 'Jamaican Dollar' },
    TTD: { code: 'TTD', symbol: 'TT$', symbolNative: '$', name: 'Trinidad and Tobago Dollar' },
    BSD: { code: 'BSD', symbol: 'B$', symbolNative: '$', name: 'Bahamian Dollar' },
    BBD: { code: 'BBD', symbol: 'Bds$', symbolNative: '$', name: 'Barbadian Dollar' },
    BZD: { code: 'BZD', symbol: 'BZ$', symbolNative: '$', name: 'Belize Dollar' },
    FJD: { code: 'FJD', symbol: 'FJ$', symbolNative: '$', name: 'Fijian Dollar' },
    PGK: { code: 'PGK', symbol: 'K', symbolNative: 'K', name: 'Papua New Guinean Kina' },
    XOF: { code: 'XOF', symbol: 'CFA', symbolNative: 'CFA', name: 'West African CFA Franc' },
    XAF: { code: 'XAF', symbol: 'FCFA', symbolNative: 'FCFA', name: 'Central African CFA Franc' },
    ISK: { code: 'ISK', symbol: 'kr', symbolNative: 'kr', name: 'Icelandic Króna' },
    ALL: { code: 'ALL', symbol: 'Lek', symbolNative: 'Lek', name: 'Albanian Lek' },
    BAM: { code: 'BAM', symbol: 'KM', symbolNative: 'KM', name: 'Bosnia-Herzegovina Convertible Mark' },
    MKD: { code: 'MKD', symbol: 'ден', symbolNative: 'ден', name: 'Macedonian Denar' },
    MDL: { code: 'MDL', symbol: 'L', symbolNative: 'L', name: 'Moldovan Leu' },
    MMK: { code: 'MMK', symbol: 'K', symbolNative: 'K', name: 'Myanmar Kyat' },
    KHR: { code: 'KHR', symbol: '៛', symbolNative: '៛', name: 'Cambodian Riel' },
    LAK: { code: 'LAK', symbol: '₭', symbolNative: '₭', name: 'Lao Kip' },
    MNT: { code: 'MNT', symbol: '₮', symbolNative: '₮', name: 'Mongolian Tugrik' },
    BND: { code: 'BND', symbol: 'B$', symbolNative: '$', name: 'Brunei Dollar' },
    MVR: { code: 'MVR', symbol: 'Rf', symbolNative: 'ރ.', name: 'Maldivian Rufiyaa' },
    MUR: { code: 'MUR', symbol: '₨', symbolNative: '₨', name: 'Mauritian Rupee' },
    BWP: { code: 'BWP', symbol: 'P', symbolNative: 'P', name: 'Botswanan Pula' },
    NAD: { code: 'NAD', symbol: 'N$', symbolNative: '$', name: 'Namibian Dollar' },
    MZN: { code: 'MZN', symbol: 'MT', symbolNative: 'MT', name: 'Mozambican Metical' },
    AOA: { code: 'AOA', symbol: 'Kz', symbolNative: 'Kz', name: 'Angolan Kwanza' },
    ZMW: { code: 'ZMW', symbol: 'ZK', symbolNative: 'ZK', name: 'Zambian Kwacha' },
};

export function getCurrencySymbol(code: string): string {
    return currencies[code]?.symbol || currencies[code]?.symbolNative || code || '$';
}

export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getAllCurrencies(): CurrencyInfo[] {
    return Object.values(currencies);
}

export function getCurrencyInfo(code: string): CurrencyInfo {
    return currencies[code] || { code, symbol: code, name: code };
}
