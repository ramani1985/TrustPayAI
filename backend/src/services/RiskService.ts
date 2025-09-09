import { RiskEvaluation } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  RiskFactor, 
  RiskLevel, 
  FALLBACK_RISK_RULES, 
  GEMINI_RISK_FACTORS,
  getRiskLevel,
  getRiskRecommendation 
} from '@/enums/RiskRules';
import logger from '@/utils/logger';

export class RiskService {
  private static instance: RiskService;
  private genAI: GoogleGenerativeAI | null = null;

  private constructor() {
    this.initializeGemini();
  }

  private initializeGemini(): void {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === 'gemini_api_key') {
      logger.warn('GEMINI_API_KEY not configured. Using fallback risk evaluation only.');
      this.genAI = null;
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      logger.info('Gemini client initialized for risk evaluation');
    } catch (error) {
      logger.error('Failed to initialize Gemini client for risk evaluation', error as Error);
      this.genAI = null;
    }
  }

  public static getInstance(): RiskService {
    if (!RiskService.instance) {
      RiskService.instance = new RiskService();
    }
    return RiskService.instance;
  }

  public async evaluateRisk(amount: number, email: string, source: string): Promise<RiskEvaluation> {
    logger.info('Evaluating risk for transaction', { amount, email, source });

    let geminiAnalysis: RiskEvaluation['geminiAnalysis'] = {
      used: false,
    };

    // Try Gemini content moderation first
    if (this.genAI) {
      try {
        geminiAnalysis = await this.analyzeWithGemini(amount, email, source);
        logger.info('Gemini analysis completed', { used: geminiAnalysis.used });
      } catch (error) {
        logger.error('Gemini analysis failed, falling back to rules', error as Error);
        geminiAnalysis.used = false;
      }
    }

    // Always run fallback rules for comprehensive evaluation
    const fallbackEvaluation = this.evaluateWithFallbackRules(amount, email, source);

    // Combine Gemini analysis with fallback rules
    const finalEvaluation = this.combineEvaluations(geminiAnalysis, fallbackEvaluation);

    logger.info('Risk evaluation completed', { 
      score: finalEvaluation.score, 
      level: finalEvaluation.level,
      factors: finalEvaluation.factors.length, 
      recommendation: finalEvaluation.recommendation,
      geminiUsed: geminiAnalysis.used,
      fallbackUsed: finalEvaluation.fallbackUsed
    });

    return finalEvaluation;
  }

  private async analyzeWithGemini(amount: number, email: string, source: string): Promise<RiskEvaluation['geminiAnalysis']> {
    if (!this.genAI) {
      return { used: false };
    }

    const model = this.genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' 
    });

    const prompt = `
      Analyze this payment transaction for fraud risk and suspicious patterns. 
      Provide a risk assessment focusing on content moderation aspects.

      Transaction Details:
      - Amount: $${(amount / 100).toFixed(2)}
      - Email: ${email}
      - Source: ${source}

      Please analyze for:
      1. Fraudulent content patterns
      2. Suspicious behavioral indicators
      3. High-risk keywords or phrases
      4. Unusual transaction characteristics

      Respond with a JSON object containing:
      {
        "riskScore": number (0-1),
        "confidence": number (0-1),
        "detectedRisks": ["risk1", "risk2"],
        "reasoning": "brief explanation"
      }

      Focus on content-based fraud detection and behavioral analysis.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // Parse JSON response
      const analysis = JSON.parse(response);
      
      // Check if the response indicates an error
      if (analysis.error) {
        logger.warn('Gemini returned error response', { error: analysis.error });
        return { used: false };
      }
      
      return {
        used: true,
        confidence: analysis.confidence || 0.5,
        detectedRisks: analysis.detectedRisks || [],
      };
    } catch (error) {
      logger.error('Failed to parse Gemini response', error as Error);
      return { used: false };
    }
  }

  private evaluateWithFallbackRules(amount: number, email: string, source: string): {
    score: number;
    factors: string[];
  } {
    const factors: string[] = [];
    let score = 0;

    // Apply fallback rules
    for (const rule of FALLBACK_RISK_RULES) {
      if (rule.fallbackCheck(amount, email, source)) {
        score += rule.weight;
        factors.push(rule.description);
      }
    }

    // Ensure score is between 0 and 1
    score = Math.min(Math.max(score, 0), 1);

    return { score, factors };
  }

  private combineEvaluations(
    geminiAnalysis: RiskEvaluation['geminiAnalysis'],
    fallbackEvaluation: { score: number; factors: string[] }
  ): RiskEvaluation {
    let finalScore = fallbackEvaluation.score;
    let finalFactors = [...fallbackEvaluation.factors];

    // If Gemini analysis was successful, incorporate its findings
    if (geminiAnalysis?.used && geminiAnalysis.detectedRisks) {
      // Add Gemini-detected risks
      finalFactors.push(...geminiAnalysis.detectedRisks);
      
      // Adjust score based on Gemini confidence and findings
      if (geminiAnalysis.confidence && geminiAnalysis.confidence > 0.7) {
        // High confidence Gemini analysis - weight it more heavily
        const geminiScore = geminiAnalysis.detectedRisks.length * 0.2;
        finalScore = Math.max(finalScore, geminiScore);
      }
    }

    // Ensure final score is between 0 and 1
    finalScore = Math.min(Math.max(finalScore, 0), 1);

    const level = getRiskLevel(finalScore);
    const recommendation = getRiskRecommendation(finalScore);

    return {
      score: finalScore,
      factors: finalFactors,
      recommendation,
      level,
      geminiAnalysis,
      fallbackUsed: true,
    };
  }
}
