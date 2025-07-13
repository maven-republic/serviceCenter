// src/components/professional-workspace/section/analytics/variables/CurrencyService.js
const CURRENCY_CONFIG = {
  'Jamaica': { code: 'JMD', symbol: 'J$', locale: 'en-JM' },
  'United States': { code: 'USD', symbol: '$', locale: 'en-US' },
  'Canada': { code: 'CAD', symbol: 'C$', locale: 'en-CA' },
  'United Kingdom': { code: 'GBP', symbol: '£', locale: 'en-GB' },
  'Australia': { code: 'AUD', symbol: 'A$', locale: 'en-AU' }
};

export class CurrencyService {
  constructor(country = 'Jamaica') {
    this.config = CURRENCY_CONFIG[country] || CURRENCY_CONFIG['Jamaica'];
  }

  formatCurrency(amount) {
    if (typeof amount !== 'number') return this.config.symbol + '0';
    
    return new Intl.NumberFormat(this.config.locale, {
      style: 'currency',
      currency: this.config.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getCurrencyCode() {
    return this.config.code;
  }

  getSymbol() {
    return this.config.symbol;
  }
}