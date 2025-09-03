import { RiskService } from '../RiskService';

describe('RiskService', () => {
  let riskService: RiskService;

  beforeEach(() => {
    riskService = RiskService.getInstance();
  });

  describe('evaluateRisk', () => {
    it('should return low risk for normal transaction', () => {
      const result = riskService.evaluateRisk(500, 'user@example.com', 'tok_visa');
      
      expect(result.score).toBeLessThan(0.5);
      expect(result.recommendation).toBe('approve');
      expect(result.factors).toHaveLength(0);
    });

    it('should detect large amount risk', () => {
      const result = riskService.evaluateRisk(5000, 'user@example.com', 'tok_visa');
      
      expect(result.score).toBeGreaterThanOrEqual(0.4);
      expect(result.factors).toContain('Very large transaction amount (≥$50)');
    });

    it('should detect very large amount risk', () => {
      const result = riskService.evaluateRisk(10000, 'user@example.com', 'tok_visa');
      
      expect(result.score).toBeGreaterThanOrEqual(0.4);
      expect(result.factors).toContain('Very large transaction amount (≥$50)');
    });

    it('should detect suspicious email domain', () => {
      const result = riskService.evaluateRisk(500, 'user@example.ru', 'tok_visa');
      
      expect(result.score).toBeGreaterThanOrEqual(0.3);
      expect(result.factors).toContain('Suspicious email domain detected');
    });

    it('should detect test source', () => {
      const result = riskService.evaluateRisk(500, 'user@example.com', 'tok_test');
      
      expect(result.score).toBeGreaterThanOrEqual(0.2);
      expect(result.factors).toContain('Test or dummy source detected');
    });

    it('should detect unusual source format', () => {
      const result = riskService.evaluateRisk(500, 'user@example.com', 'ab');
      
      expect(result.score).toBeGreaterThanOrEqual(0.1);
      expect(result.factors).toContain('Unusual source format');
    });

    it('should combine multiple risk factors', () => {
      const result = riskService.evaluateRisk(5000, 'user@example.ru', 'tok_test');
      
      expect(result.score).toBeGreaterThan(0.5);
      expect(result.recommendation).toBe('block');
      expect(result.factors.length).toBeGreaterThan(1);
    });

    it('should cap risk score at 1.0', () => {
      const result = riskService.evaluateRisk(10000, 'user@example.ru', 'tok_test_fake');
      
      expect(result.score).toBeLessThanOrEqual(1.0);
    });

    it('should ensure risk score is at least 0.0', () => {
      const result = riskService.evaluateRisk(100, 'user@example.com', 'tok_visa_valid');
      
      expect(result.score).toBeGreaterThanOrEqual(0.0);
    });
  });
});
