import OpenAI from 'openai';
import logger from '@/utils/logger';

export class LLMService {
  private static instance: LLMService;
  private openai: OpenAI | null = null;

  private constructor() {
   // if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    //}
  }

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  public async generateExplanation(
    riskScore: number,
    factors: string[],
    amount: number,
    email: string,
    status: 'success' | 'failed' | 'blocked'
  ): Promise<string> {
    try {
      if (!this.openai) {
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

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional financial risk analyst providing clear explanations for payment risk assessments.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      });

      const explanation = completion.choices[0]?.message?.content?.trim() || 
        this.getFallbackExplanation(riskScore, factors, amount, email, status);

      logger.info('LLM explanation generated', { explanationLength: explanation.length });
      return explanation;

    } catch (error) {
      logger.error('LLM explanation generation failed', error as Error);
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
