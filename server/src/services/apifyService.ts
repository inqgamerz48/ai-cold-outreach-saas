import { ApifyClient } from 'apify-client';

/**
 * ApifyService - Handles all Apify actor integrations
 * 
 * Supports:
 * - LinkedIn profile search
 * - LinkedIn profile scraping
 * - Reddit scraping
 * 
 * Rate Limiting (to protect free tier $5 credits):
 * - Max 5 LinkedIn searches per hour
 * - Max 10 Reddit searches per hour  
 * - Max 50 total API calls per day
 */

// Rate limit tracking
interface RateLimitTracker {
    linkedinCalls: number[];
    redditCalls: number[];
    dailyCalls: number[];
}

export class ApifyService {
    private client: ApifyClient;
    private isConfigured: boolean;
    private rateLimits: RateLimitTracker;

    // Rate limit configs (conservative for free tier)
    private readonly MAX_LINKEDIN_PER_HOUR = 5;
    private readonly MAX_REDDIT_PER_HOUR = 10;
    private readonly MAX_DAILY_CALLS = 50;

    constructor() {
        const token = process.env.APIFY_API_TOKEN;
        this.isConfigured = !!token;

        // Initialize rate limit tracker
        this.rateLimits = {
            linkedinCalls: [],
            redditCalls: [],
            dailyCalls: []
        };

        if (token) {
            this.client = new ApifyClient({ token });
            console.log('[Apify] Service initialized with API token');
            console.log(`[Apify] Rate limits: ${this.MAX_LINKEDIN_PER_HOUR} LinkedIn/hr, ${this.MAX_REDDIT_PER_HOUR} Reddit/hr, ${this.MAX_DAILY_CALLS}/day`);
        } else {
            this.client = new ApifyClient({ token: '' });
            console.log('[Apify] No API token configured - service will return mock data');
        }
    }

    /**
     * Check if we can make an API call based on rate limits
     */
    private checkRateLimit(type: 'linkedin' | 'reddit'): { allowed: boolean; reason?: string } {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        const oneDayAgo = now - (24 * 60 * 60 * 1000);

        // Clean up old entries
        this.rateLimits.linkedinCalls = this.rateLimits.linkedinCalls.filter(t => t > oneHourAgo);
        this.rateLimits.redditCalls = this.rateLimits.redditCalls.filter(t => t > oneHourAgo);
        this.rateLimits.dailyCalls = this.rateLimits.dailyCalls.filter(t => t > oneDayAgo);

        // Check daily limit
        if (this.rateLimits.dailyCalls.length >= this.MAX_DAILY_CALLS) {
            return {
                allowed: false,
                reason: `Daily limit reached (${this.MAX_DAILY_CALLS} calls). Resets in ${this.getTimeUntilReset(this.rateLimits.dailyCalls[0], 24)}`
            };
        }

        // Check type-specific limits
        if (type === 'linkedin' && this.rateLimits.linkedinCalls.length >= this.MAX_LINKEDIN_PER_HOUR) {
            return {
                allowed: false,
                reason: `LinkedIn hourly limit reached (${this.MAX_LINKEDIN_PER_HOUR}/hr). Resets in ${this.getTimeUntilReset(this.rateLimits.linkedinCalls[0], 1)}`
            };
        }

        if (type === 'reddit' && this.rateLimits.redditCalls.length >= this.MAX_REDDIT_PER_HOUR) {
            return {
                allowed: false,
                reason: `Reddit hourly limit reached (${this.MAX_REDDIT_PER_HOUR}/hr). Resets in ${this.getTimeUntilReset(this.rateLimits.redditCalls[0], 1)}`
            };
        }

        return { allowed: true };
    }

    private getTimeUntilReset(oldestCall: number, hours: number): string {
        const resetTime = oldestCall + (hours * 60 * 60 * 1000);
        const minutes = Math.ceil((resetTime - Date.now()) / (60 * 1000));
        return minutes > 60 ? `${Math.ceil(minutes / 60)} hours` : `${minutes} minutes`;
    }

    private recordCall(type: 'linkedin' | 'reddit'): void {
        const now = Date.now();
        this.rateLimits.dailyCalls.push(now);
        if (type === 'linkedin') {
            this.rateLimits.linkedinCalls.push(now);
        } else {
            this.rateLimits.redditCalls.push(now);
        }
        console.log(`[Apify] Rate limit status - Daily: ${this.rateLimits.dailyCalls.length}/${this.MAX_DAILY_CALLS}, LinkedIn/hr: ${this.rateLimits.linkedinCalls.length}/${this.MAX_LINKEDIN_PER_HOUR}, Reddit/hr: ${this.rateLimits.redditCalls.length}/${this.MAX_REDDIT_PER_HOUR}`);
    }

    /**
     * Get current rate limit status
     */
    getRateLimitStatus(): { daily: string; linkedin: string; reddit: string } {
        return {
            daily: `${this.rateLimits.dailyCalls.length}/${this.MAX_DAILY_CALLS}`,
            linkedin: `${this.rateLimits.linkedinCalls.length}/${this.MAX_LINKEDIN_PER_HOUR}/hr`,
            reddit: `${this.rateLimits.redditCalls.length}/${this.MAX_REDDIT_PER_HOUR}/hr`
        };
    }


    /**
     * Search LinkedIn via Google SERP (cost-effective method)
     * Uses Google to find LinkedIn profile URLs, then extracts basic info
     */
    async searchLinkedInProfiles(query: string, location?: string, limit: number = 10): Promise<LinkedInProfile[]> {
        if (!this.isConfigured) {
            console.log('[Apify] Returning mock LinkedIn data (no API token)');
            return this.getMockLinkedInProfiles(query, limit);
        }

        // Check rate limits before making API call
        const rateCheck = this.checkRateLimit('linkedin');
        if (!rateCheck.allowed) {
            console.warn(`[Apify] RATE LIMITED: ${rateCheck.reason}`);
            console.log('[Apify] Returning mock data to protect credits');
            return this.getMockLinkedInProfiles(query, limit);
        }

        try {
            // Record this call for rate limiting
            this.recordCall('linkedin');

            const searchQuery = `site:linkedin.com/in/ ${query} ${location || ''}`.trim();
            console.log(`[Apify] Running Google Search for: ${searchQuery}`);

            // Use Google Search Scraper to find LinkedIn URLs
            const run = await this.client.actor('apify/google-search-scraper').call({
                queries: searchQuery,
                maxPagesPerQuery: 1,
                resultsPerPage: limit,
                mobileResults: false,
            });

            // Get results from dataset
            const { items } = await this.client.dataset(run.defaultDatasetId).listItems();

            const profiles: LinkedInProfile[] = [];

            for (const item of items) {
                const results = (item as any).organicResults || [];
                for (const result of results) {
                    if (result.url?.includes('linkedin.com/in/')) {
                        profiles.push({
                            name: this.extractNameFromTitle(result.title),
                            role: this.extractRoleFromDescription(result.description),
                            company: this.extractCompanyFromDescription(result.description),
                            linkedinUrl: result.url,
                            source: 'APIFY_LINKEDIN'
                        });
                    }
                }
            }

            console.log(`[Apify] Found ${profiles.length} LinkedIn profiles`);
            return profiles.slice(0, limit);

        } catch (error) {
            console.error('[Apify] LinkedIn search failed:', error);
            return this.getMockLinkedInProfiles(query, limit);
        }
    }

    /**
     * Scrape detailed LinkedIn profile data
     * Note: Requires more expensive actor, use sparingly
     */
    async scrapeLinkedInProfile(profileUrl: string): Promise<LinkedInProfile | null> {
        if (!this.isConfigured) {
            return null;
        }

        try {
            console.log(`[Apify] Scraping profile: ${profileUrl}`);

            const run = await this.client.actor('anchor/linkedin-profile-scraper').call({
                profileUrls: [profileUrl],
            });

            const { items } = await this.client.dataset(run.defaultDatasetId).listItems();

            if (items.length > 0) {
                const profile = items[0] as any;
                return {
                    name: profile.fullName || profile.name,
                    role: profile.headline || profile.title,
                    company: profile.company || this.extractCompanyFromExperience(profile.experience),
                    linkedinUrl: profileUrl,
                    source: 'APIFY_LINKEDIN'
                };
            }

            return null;
        } catch (error) {
            console.error('[Apify] Profile scrape failed:', error);
            return null;
        }
    }

    /**
     * Search Reddit for potential leads
     */
    async searchReddit(subreddits: string[], keywords: string[], limit: number = 25): Promise<RedditPost[]> {
        if (!this.isConfigured) {
            console.log('[Apify] Returning mock Reddit data (no API token)');
            return this.getMockRedditPosts(keywords, limit);
        }

        // Check rate limits before making API call
        const rateCheck = this.checkRateLimit('reddit');
        if (!rateCheck.allowed) {
            console.warn(`[Apify] RATE LIMITED: ${rateCheck.reason}`);
            console.log('[Apify] Returning mock data to protect credits');
            return this.getMockRedditPosts(keywords, limit);
        }

        try {
            // Record this call for rate limiting
            this.recordCall('reddit');

            console.log(`[Apify] Searching Reddit: ${subreddits.join(', ')} for ${keywords.join(', ')}`);

            const run = await this.client.actor('trudax/reddit-scraper').call({
                subreddits: subreddits,
                searchQueries: keywords,
                maxItems: limit,
                sort: 'new',
            });

            const { items } = await this.client.dataset(run.defaultDatasetId).listItems();

            return items.map((item: any) => ({
                title: item.title,
                author: item.author,
                subreddit: item.subreddit,
                url: item.url,
                content: item.selftext || item.body,
                score: item.score,
                createdAt: item.created_utc
            }));

        } catch (error) {
            console.error('[Apify] Reddit search failed:', error);
            return this.getMockRedditPosts(keywords, limit);
        }
    }

    // ============ Helper Methods ============

    private extractNameFromTitle(title: string): string {
        // LinkedIn titles are usually: "Name - Role at Company | LinkedIn"
        const parts = title.split(' - ');
        return parts[0]?.replace(' | LinkedIn', '').trim() || 'Unknown';
    }

    private extractRoleFromDescription(description: string): string {
        // Try to extract role from description
        const roleMatch = description.match(/^([^·|]+)/);
        return roleMatch ? roleMatch[1].trim() : '';
    }

    private extractCompanyFromDescription(description: string): string {
        // Try to extract company - usually after "at" or "·"
        const companyMatch = description.match(/(?:at|·)\s*([^·|]+)/i);
        return companyMatch ? companyMatch[1].trim() : '';
    }

    private extractCompanyFromExperience(experience: any[]): string {
        if (experience && experience.length > 0) {
            return experience[0].company || experience[0].companyName || '';
        }
        return '';
    }

    // ============ Mock Data (when no API token) ============

    private getMockLinkedInProfiles(query: string, limit: number): LinkedInProfile[] {
        const mockProfiles = [
            { name: 'Sarah Chen', role: 'Marketing Director', company: 'TechCorp Inc', linkedinUrl: 'https://linkedin.com/in/sarah-chen', source: 'MOCK_LINKEDIN' },
            { name: 'Michael Johnson', role: 'VP of Sales', company: 'SaaS Solutions', linkedinUrl: 'https://linkedin.com/in/michael-johnson', source: 'MOCK_LINKEDIN' },
            { name: 'Emily Davis', role: 'Growth Lead', company: 'StartupXYZ', linkedinUrl: 'https://linkedin.com/in/emily-davis', source: 'MOCK_LINKEDIN' },
            { name: 'James Wilson', role: 'CEO & Founder', company: 'Innovation Labs', linkedinUrl: 'https://linkedin.com/in/james-wilson', source: 'MOCK_LINKEDIN' },
            { name: 'Amanda Torres', role: 'Head of Partnerships', company: 'Digital Agency Co', linkedinUrl: 'https://linkedin.com/in/amanda-torres', source: 'MOCK_LINKEDIN' },
        ];
        return mockProfiles.slice(0, limit);
    }

    private getMockRedditPosts(keywords: string[], limit: number): RedditPost[] {
        return [
            { title: `Looking for a ${keywords[0] || 'tool'}`, author: 'reddit_user_1', subreddit: 'startups', url: 'https://reddit.com/r/startups/1', content: 'Sample post content', score: 42, createdAt: Date.now() },
            { title: 'Need recommendations', author: 'entrepreneur99', subreddit: 'entrepreneur', url: 'https://reddit.com/r/entrepreneur/2', content: 'Looking for solutions', score: 28, createdAt: Date.now() },
        ];
    }
}

// ============ Type Definitions ============

export interface LinkedInProfile {
    name: string;
    role: string;
    company: string;
    linkedinUrl: string;
    source: string;
}

export interface RedditPost {
    title: string;
    author: string;
    subreddit: string;
    url: string;
    content: string;
    score: number;
    createdAt: number;
}
