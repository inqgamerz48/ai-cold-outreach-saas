import axios from 'axios';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export interface AIScraperResult {
    status: string;
    source: string;
    count: number;
    results: any[];
}

export class AIScraperService {
    /**
     * Search Reddit for leads
     */
    async scrapeReddit(subreddits: string[], keywords: string[], limit: number = 50): Promise<AIScraperResult> {
        try {
            const response = await axios.post(`${AI_ENGINE_URL}/scrape/reddit`, {
                subreddits,
                keywords,
                limit
            });
            return response.data;
        } catch (error: any) {
            console.error('[AI-Reddit] Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.detail || 'Reddit scraping failed');
        }
    }

    /**
     * Search Twitter for users
     */
    async scrapeTwitter(query: string, maxResults: number = 10): Promise<AIScraperResult> {
        try {
            const response = await axios.post(`${AI_ENGINE_URL}/scrape/twitter`, {
                query,
                max_results: maxResults
            });
            return response.data;
        } catch (error: any) {
            console.error('[AI-Twitter] Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.detail || 'Twitter scraping failed');
        }
    }

    /**
     * Find Twitter handle for a person/company
     */
    async enrichTwitter(name: string, company?: string): Promise<{ status: string; name: string; twitterHandle: string | null }> {
        try {
            const response = await axios.post(`${AI_ENGINE_URL}/enrich/twitter`, {
                name,
                company
            });
            return response.data;
        } catch (error: any) {
            console.error('[AI-Twitter-Enrich] Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.detail || 'Twitter enrichment failed');
        }
    }

    /**
     * Search LinkedIn for people
     */
    async scrapeLinkedIn(keywords: string, location?: string, limit: number = 10): Promise<AIScraperResult> {
        try {
            const response = await axios.post(`${AI_ENGINE_URL}/scrape/linkedin`, {
                keywords,
                location,
                limit
            });
            return response.data;
        } catch (error: any) {
            console.error('[AI-LinkedIn] Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.detail || 'LinkedIn scraping failed');
        }
    }

    /**
     * Health check for AI engine
     */
    async healthCheck(): Promise<any> {
        try {
            const response = await axios.get(`${AI_ENGINE_URL}/`);
            return response.data;
        } catch (error: any) {
            console.error('[AI-Engine] Health check failed:', error.message);
            throw new Error('AI Engine unreachable');
        }
    }
}
