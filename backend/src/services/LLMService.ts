import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '@/utils/logger';

export class LLMService {
  private static instance: LLMService;
  private genAI: GoogleGenerativeAI | null = null;

  private constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      logger.warn('GEMINI_API_KEY environment variable is not set. LLM features will be disabled.');
      this.genAI = null;
      return;
    }

    if (apiKey === 'your_gemini_api_key_here' || apiKey === 'gemini_api_key') {
      logger.warn('GEMINI_API_KEY is set to placeholder value. Please set a valid Gemini API key.');
      this.genAI = null;
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      logger.info('Gemini client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Gemini client', error as Error);
      this.genAI = null;
    }
  }

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  public isConfigured(): boolean {
    return this.genAI !== null;
  }

  public async generateExplanation(
    riskScore: number,
    factors: string[],
    amount: number,
    email: string,
    status: 'success' | 'failed' | 'blocked'
  ): Promise<string> {
    try {
      if (!this.genAI) {
        return this.getFallbackExplanation(riskScore, factors, amount, email, status);
      }

      logger.info('Generating LLM explanation', { riskScore, factors: factors.length, status });

      const prompt = `
        You are a financial risk analyst. Generate a clear, professional explanation for a payment transaction risk assessment.
        
        Transaction Details:
        - Amount: $${(amount / 100).toFixed(2)}
        - Email: ${email}
        - Risk Score: ${riskScore.toFixed(2)} (0 = low risk, 1 = high risk)
        - Risk Factors: ${factors.join(', ')}
        - Final Status: ${status}
        
        Please provide a concise explanation (2-3 sentences) that explains:
        1. The risk assessment outcome
        2. Key factors that influenced the decision
        3. The final action taken
        
        Keep it professional and easy to understand for both technical and non-technical users.
      `;

      const model = this.genAI.getGenerativeModel({ 
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' 
      });

      logger.info('Making Gemini API call', { 
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        promptLength: prompt.length 
      });

      const result = await model.generateContent(
        `You are a professional financial risk analyst providing clear explanations for payment risk assessments.\n\n${prompt}`
      );

      const explanation = result.response.text()?.trim() || 
        this.getFallbackExplanation(riskScore, factors, amount, email, status);

      logger.info('LLM explanation generated', { explanationLength: explanation.length });
      return explanation;

    } catch (error) {
      logger.error('Error generating LLM explanation', error as Error);
      return this.getFallbackExplanation(riskScore, factors, amount, email, status);
    }
  }

  private getFallbackExplanation(
    riskScore: number,
    factors: string[],
    amount: number,
    email: string,
    status: 'success' | 'failed' | 'blocked'
  ): string {
    const amountFormatted = `$${(amount / 100).toFixed(2)}`;
    
    if (status === 'blocked') {
      return `Transaction for ${amountFormatted} was blocked due to high risk score (${riskScore.toFixed(2)}). Risk factors identified: ${factors.join(', ')}. This transaction requires manual review before processing.`;
    } else if (status === 'success') {
      return `Transaction for ${amountFormatted} was approved with a risk score of ${riskScore.toFixed(2)}. ${factors.length > 0 ? `Risk factors considered: ${factors.join(', ')}. ` : ''}The transaction has been successfully processed.`;
    } else {
      return `Transaction for ${amountFormatted} failed to process. Risk score: ${riskScore.toFixed(2)}. ${factors.length > 0 ? `Risk factors: ${factors.join(', ')}. ` : ''}Please try again or contact support.`;
    }
  }
}
