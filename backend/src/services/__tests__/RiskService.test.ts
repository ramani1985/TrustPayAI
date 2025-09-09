import { RiskService } from '../RiskService';

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn().mockReturnValue(JSON.stringify({
              riskScore: 0.3,
              confidence: 0.8,
              detectedRisks: ['Suspicious pattern detected'],
              reasoning: 'Test analysis'
            })),
          },
        }),
      }),
    })),
  };
});

describe('RiskService', () => {
  let riskService: RiskService;

  beforeEach(() => {
    riskService = RiskService.getInstance();
    // Set mock API key for tests
    process.env.GEMINI_API_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  describe('evaluateRisk', () => {
    it('should return low risk for normal transaction', async () => {
      const result = await riskService.evaluateRisk(500, 'user@example.com', 'tok_visa');
      
      expect(result.score).toBeLessThan(0.5);
      expect(result.recommendation).toBe('approve');
      expect(result.level).toBe('LOW');
      expect(result.fallbackUsed).toBe(true);
      expect(result.geminiAnalysis?.used).toBe(true);
    });

    it('should detect large amount risk', async () => {
      const result = await riskService.evaluateRisk(5000, 'user@example.com', 'tok_visa');
      
      expect(result.score).toBeGreaterThanOrEqual(0.4);
      expect(result.factors).toContain('Very large transaction amount (≥$50)');
      expect(result.level).toBe('MEDIUM');
    });

    it('should detect very large amount risk', async () => {
      const result = await riskService.evaluateRisk(10000, 'user@example.com', 'tok_visa');
      
      expect(result.score).toBeGreaterThanOrEqual(0.4);
      expect(result.factors).toContain('Very large transaction amount (≥$50)');
      expect(result.level).toBe('MEDIUM');
    });

    it('should detect suspicious email domain', async () => {
      const result = await riskService.evaluateRisk(500, 'user@example.ru', 'tok_visa');
      
      expect(result.score).toBeGreaterThanOrEqual(0.3);
      expect(result.factors).toContain('Suspicious email domain detected');
      expect(result.level).toBe('MEDIUM');
    });

    it('should detect test source', async () => {
      const result = await riskService.evaluateRisk(500, 'user@example.com', 'tok_test');
      
      expect(result.score).toBeGreaterThanOrEqual(0.2);
      expect(result.factors).toContain('Test or dummy source detected');
      expect(result.level).toBe('LOW');
    });

    it('should detect unusual source format', async () => {
      const result = await riskService.evaluateRisk(500, 'user@example.com', 'ab');
      
      expect(result.score).toBeGreaterThanOrEqual(0.1);
      expect(result.factors).toContain('Unusual source format');
      expect(result.level).toBe('LOW');
    });

    it('should combine multiple risk factors', async () => {
      const result = await riskService.evaluateRisk(5000, 'user@example.ru', 'tok_test');
      
      expect(result.score).toBeGreaterThan(0.5);
      expect(result.recommendation).toBe('block');
      expect(result.factors.length).toBeGreaterThan(1);
      expect(result.level).toBe('CRITICAL');
    });

    it('should cap risk score at 1.0', async () => {
      const result = await riskService.evaluateRisk(10000, 'user@example.ru', 'tok_test_fake');
      
      expect(result.score).toBeLessThanOrEqual(1.0);
    });

    it('should ensure risk score is at least 0.0', async () => {
      const result = await riskService.evaluateRisk(100, 'user@example.com', 'tok_visa_valid');
      
      expect(result.score).toBeGreaterThanOrEqual(0.0);
    });

    it('should include Gemini analysis when available', async () => {
      const result = await riskService.evaluateRisk(500, 'user@example.com', 'tok_visa');
      
      expect(result.geminiAnalysis).toBeDefined();
      expect(result.geminiAnalysis?.used).toBe(true);
      expect(result.geminiAnalysis?.confidence).toBe(0.8);
      expect(result.geminiAnalysis?.detectedRisks).toContain('Suspicious pattern detected');
    });

    it('should always include fallback evaluation', async () => {
      const result = await riskService.evaluateRisk(500, 'user@example.com', 'tok_visa');
      
      expect(result.fallbackUsed).toBe(true);
      expect(result.score).toBeLessThan(0.5);
      expect(result.recommendation).toBe('approve');
    });

    it('should handle various risk scenarios correctly', async () => {
      // Test with high risk transaction
      const highRiskResult = await riskService.evaluateRisk(10000, 'user@example.ru', 'tok_test_fake');
      
      expect(highRiskResult.score).toBeGreaterThan(0.5);
      expect(highRiskResult.recommendation).toBe('block');
      expect(highRiskResult.factors.length).toBeGreaterThan(0);
      expect(highRiskResult.fallbackUsed).toBe(true);
    });
  });
});
