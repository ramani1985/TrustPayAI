import { RiskEvaluation } from '@/types';
import logger from '@/utils/logger';

export class RiskService {
  private static instance: RiskService;

  private constructor() {}

  public static getInstance(): RiskService {
    if (!RiskService.instance) {
      RiskService.instance = new RiskService();
    }
    return RiskService.instance;
  }

  public evaluateRisk(amount: number, email: string, source: string): RiskEvaluation {
    logger.info('Evaluating risk for transaction', { amount, email, source });

    const factors: string[] = [];
    let score = 0;

    // Large amount check
    if (amount >= 5000) {
      score += 0.4;
      factors.push('Very large transaction amount (≥$50)');
    } else if (amount >= 1000) {
      score += 0.2;
      factors.push('Large transaction amount (≥$10)');
    }

    // Suspicious email domains
    const suspiciousDomains = ['.ru', 'ru.test.com', '.tk', '.ml', '.ga', '.cf'];
    const emailDomain = email.split('@')[1]?.toLowerCase();
    
    if (emailDomain && suspiciousDomains.some(domain => emailDomain.includes(domain))) {
      score += 0.3;
      factors.push('Suspicious email domain detected');
    }

    // Unusual source patterns
    if (source.includes('test') || source.includes('fake') || source.includes('dummy')) {
      score += 0.2;
      factors.push('Test or dummy source detected');
    }

    // Random source patterns (basic heuristic)
    if (source.length < 5 || !/^[a-zA-Z0-9_]+$/.test(source)) {
      score += 0.1;
      factors.push('Unusual source format');
    }

    // Ensure score is between 0 and 1
    score = Math.min(Math.max(score, 0), 1);

    const recommendation: 'approve' | 'block' = score < 0.5 ? 'approve' : 'block';

    const evaluation: RiskEvaluation = {
      score,
      factors,
      recommendation,
    };

    logger.info('Risk evaluation completed', { 
      score, 
      factors: factors.length, 
      recommendation 
    });

    return evaluation;
  }
}
