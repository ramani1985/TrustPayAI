import { LLMService } from '../LLMService';

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: 'This is a mock LLM explanation for the transaction risk assessment.',
                },
              },
            ],
          }),
        },
      },
    })),
  };
});

describe('LLMService', () => {
  let llmService: LLMService;

  beforeEach(() => {
    llmService = LLMService.getInstance();
    // Set mock API key
    process.env.OPENAI_API_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  describe('generateExplanation', () => {
    it('should generate explanation with OpenAI when API key is available', async () => {
      const explanation = await llmService.generateExplanation(
        0.3,
        ['Large amount'],
        5000,
        'test@example.com',
        'success'
      );

      expect(explanation).toBe('This is a mock LLM explanation for the transaction risk assessment.');
    });

    it('should use fallback explanation when OpenAI API key is not available', async () => {
      delete process.env.OPENAI_API_KEY;
      
      const explanation = await llmService.generateExplanation(
        0.3,
        ['Large amount'],
        5000,
        'test@example.com',
        'success'
      );

      expect(explanation).toContain('Transaction for $50.00 was approved');
      expect(explanation).toContain('Risk factors considered: Large amount');
    });

    it('should generate appropriate fallback explanation for blocked transaction', async () => {
      delete process.env.OPENAI_API_KEY;
      
      const explanation = await llmService.generateExplanation(
        0.8,
        ['Suspicious email domain', 'Large amount'],
        5000,
        'test@example.ru',
        'blocked'
      );

      expect(explanation).toContain('was blocked due to high risk score');
      expect(explanation).toContain('Risk factors identified: Suspicious email domain, Large amount');
      expect(explanation).toContain('requires manual review');
    });

    it('should generate appropriate fallback explanation for failed transaction', async () => {
      delete process.env.OPENAI_API_KEY;
      
      const explanation = await llmService.generateExplanation(
        0.6,
        ['Unusual source'],
        2000,
        'test@example.com',
        'failed'
      );

      expect(explanation).toContain('failed to process');
      expect(explanation).toContain('Risk factors: Unusual source');
      expect(explanation).toContain('Please try again or contact support');
    });

    it('should handle empty risk factors in fallback explanation', async () => {
      delete process.env.OPENAI_API_KEY;
      
      const explanation = await llmService.generateExplanation(
        0.1,
        [],
        1000,
        'test@example.com',
        'success'
      );

      expect(explanation).toContain('Transaction for $10.00 was approved');
      expect(explanation).not.toContain('Risk factors considered:');
    });

    it('should handle OpenAI API errors gracefully', async () => {
      // Mock OpenAI to throw an error
      const mockOpenAI = require('openai').default;
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error')),
          },
        },
      }));

      const explanation = await llmService.generateExplanation(
        0.3,
        ['Large amount'],
        5000,
        'test@example.com',
        'success'
      );

      expect(explanation).toContain('Transaction for $50.00 was approved');
    });
  });
});
