export enum RiskFactor {
  // Amount-based risks
  LARGE_AMOUNT = 'LARGE_AMOUNT',
  VERY_LARGE_AMOUNT = 'VERY_LARGE_AMOUNT',
  
  // Email-based risks
  SUSPICIOUS_EMAIL_DOMAIN = 'SUSPICIOUS_EMAIL_DOMAIN',
  INVALID_EMAIL_FORMAT = 'INVALID_EMAIL_FORMAT',
  
  // Source-based risks
  TEST_SOURCE = 'TEST_SOURCE',
  UNUSUAL_SOURCE_FORMAT = 'UNUSUAL_SOURCE_FORMAT',
  SUSPICIOUS_SOURCE_PATTERN = 'SUSPICIOUS_SOURCE_PATTERN',
  
  // Content-based risks (from Gemini)
  FRAUDULENT_CONTENT = 'FRAUDULENT_CONTENT',
  SUSPICIOUS_PATTERNS = 'SUSPICIOUS_PATTERNS',
  HIGH_RISK_KEYWORDS = 'HIGH_RISK_KEYWORDS',
  UNUSUAL_BEHAVIOR = 'UNUSUAL_BEHAVIOR',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface RiskRule {
  factor: RiskFactor;
  weight: number;
  threshold?: number;
  description: string;
  fallbackCheck: (amount: number, email: string, source: string) => boolean;
}

export const FALLBACK_RISK_RULES: RiskRule[] = [
  {
    factor: RiskFactor.VERY_LARGE_AMOUNT,
    weight: 0.4,
    threshold: 5000,
    description: 'Very large transaction amount (≥$50)',
    fallbackCheck: (amount: number) => amount >= 5000,
  },
  {
    factor: RiskFactor.LARGE_AMOUNT,
    weight: 0.2,
    threshold: 1000,
    description: 'Large transaction amount (≥$10)',
    fallbackCheck: (amount: number) => amount >= 1000 && amount < 5000,
  },
  {
    factor: RiskFactor.SUSPICIOUS_EMAIL_DOMAIN,
    weight: 0.3,
    description: 'Suspicious email domain detected',
    fallbackCheck: (amount: number, email: string) => {
      const suspiciousDomains = ['.ru', 'ru.test.com', '.tk', '.ml', '.ga', '.cf'];
      const emailDomain = email.split('@')[1]?.toLowerCase();
      return emailDomain ? suspiciousDomains.some(domain => emailDomain.includes(domain)) : false;
    },
  },
  {
    factor: RiskFactor.INVALID_EMAIL_FORMAT,
    weight: 0.1,
    description: 'Invalid email format',
    fallbackCheck: (amount: number, email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(email);
    },
  },
  {
    factor: RiskFactor.TEST_SOURCE,
    weight: 0.2,
    description: 'Test or dummy source detected',
    fallbackCheck: (amount: number, email: string, source: string) => {
      return source.includes('test') || source.includes('fake') || source.includes('dummy');
    },
  },
  {
    factor: RiskFactor.UNUSUAL_SOURCE_FORMAT,
    weight: 0.1,
    description: 'Unusual source format',
    fallbackCheck: (amount: number, email: string, source: string) => {
      return source.length < 5 || !/^[a-zA-Z0-9_]+$/.test(source);
    },
  },
  {
    factor: RiskFactor.SUSPICIOUS_SOURCE_PATTERN,
    weight: 0.15,
    description: 'Suspicious source pattern detected',
    fallbackCheck: (amount: number, email: string, source: string) => {
      const suspiciousPatterns = ['fraud', 'scam', 'phish', 'hack', 'steal'];
      return suspiciousPatterns.some(pattern => source.toLowerCase().includes(pattern));
    },
  },
];

export const GEMINI_RISK_FACTORS: RiskFactor[] = [
  RiskFactor.FRAUDULENT_CONTENT,
  RiskFactor.SUSPICIOUS_PATTERNS,
  RiskFactor.HIGH_RISK_KEYWORDS,
  RiskFactor.UNUSUAL_BEHAVIOR,
];

export const getRiskLevel = (score: number): RiskLevel => {
  if (score >= 0.8) return RiskLevel.CRITICAL;
  if (score >= 0.6) return RiskLevel.HIGH;
  if (score >= 0.3) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
};

export const getRiskRecommendation = (score: number): 'approve' | 'block' => {
  return score < 0.5 ? 'approve' : 'block';
};
