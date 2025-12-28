import axios from 'axios';

interface EmailGenerationRequest {
    tenantId: number;
    leadName: string;
    leadCompany?: string;
    leadRole?: string;
    userContext: string;
    tone?: string;
}

interface ReplyClassificationRequest {
    replyContent: string;
}

interface GeneratedEmail {
    subject: string;
    body: string;
}

interface ReplyClassification {
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    intent: 'INTERESTED' | 'NOT_INTERESTED' | 'QUESTION' | 'UNKNOWN';
}

export class AIService {
    private aiEngineUrl: string;

    constructor() {
        this.aiEngineUrl = process.env.AI_ENGINE_URL || 'http://localhost:8000';
    }

    /**
     * Generate a personalized cold email
     */
    async generateEmail(req: EmailGenerationRequest): Promise<GeneratedEmail> {
        try {
            const response = await axios.post(`${this.aiEngineUrl}/ai/generate-email`, {
                tenant_id: req.tenantId,
                lead_name: req.leadName,
                lead_company: req.leadCompany,
                lead_role: req.leadRole,
                user_context: req.userContext,
                tone: req.tone || 'professional'
            });

            if (response.data.status === 'success') {
                return response.data.email;
            }

            throw new Error('AI Engine returned failed status');
        } catch (error: any) {
            console.error('AI Service Error:', error.message);
            throw new Error(`Failed to generate email: ${error.message}`);
        }
    }

    /**
     * Classify an email reply
     */
    async classifyReply(content: string): Promise<ReplyClassification> {
        try {
            const response = await axios.post(`${this.aiEngineUrl}/ai/classify-reply`, {
                reply_content: content
            });

            if (response.data.status === 'success') {
                return response.data.classification;
            }

            throw new Error('AI Engine returned failed status');
        } catch (error: any) {
            console.error('AI Service Error:', error.message);
            throw new Error(`Failed to classify reply: ${error.message}`);
        }
    }

    /**
     * Check if AI Engine is healthy
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await axios.get(`${this.aiEngineUrl}/`);
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
}
