import axios from 'axios';

/**
 * EmailEnrichmentService - Find email addresses for leads
 * 
 * Supports multiple providers:
 * - Hunter.io (primary) - 25 free searches/month
 * - Clearbit (backup)
 * - Pattern generation (fallback)
 */
export class EmailEnrichmentService {
    private hunterApiKey: string | undefined;
    private isConfigured: boolean;

    constructor() {
        this.hunterApiKey = process.env.HUNTER_API_KEY;
        this.isConfigured = !!this.hunterApiKey;

        if (this.isConfigured) {
            console.log('[Email] Hunter.io service initialized');
        } else {
            console.log('[Email] No Hunter API key - using pattern-based email generation');
        }
    }

    /**
     * Find email for a person given their name and company domain
     */
    async findEmail(firstName: string, lastName: string, domain: string): Promise<EmailResult> {
        if (this.isConfigured && this.hunterApiKey) {
            return this.hunterEmailFinder(firstName, lastName, domain);
        }
        return this.generateEmailPattern(firstName, lastName, domain);
    }

    /**
     * Find emails for multiple leads in batch
     */
    async enrichLeads(leads: LeadToEnrich[]): Promise<EnrichedLead[]> {
        console.log(`[Email] Enriching ${leads.length} leads with emails`);

        const enrichedLeads: EnrichedLead[] = [];

        for (const lead of leads) {
            const { firstName, lastName } = this.splitName(lead.name);
            const domain = await this.getDomainFromCompany(lead.company);

            if (domain) {
                const emailResult = await this.findEmail(firstName, lastName, domain);
                enrichedLeads.push({
                    ...lead,
                    email: emailResult.email,
                    emailConfidence: emailResult.confidence,
                    emailSource: emailResult.source
                });
            } else {
                enrichedLeads.push({
                    ...lead,
                    email: null,
                    emailConfidence: 0,
                    emailSource: 'NOT_FOUND'
                });
            }

            // Rate limiting - don't hammer APIs
            await this.delay(200);
        }

        const foundCount = enrichedLeads.filter(l => l.email).length;
        console.log(`[Email] Enriched ${foundCount}/${leads.length} leads with emails`);

        return enrichedLeads;
    }

    /**
     * Use Hunter.io Email Finder API
     */
    private async hunterEmailFinder(firstName: string, lastName: string, domain: string): Promise<EmailResult> {
        try {
            const response = await axios.get('https://api.hunter.io/v2/email-finder', {
                params: {
                    domain,
                    first_name: firstName,
                    last_name: lastName,
                    api_key: this.hunterApiKey
                },
                timeout: 10000
            });

            if (response.data?.data?.email) {
                return {
                    email: response.data.data.email,
                    confidence: response.data.data.score || 80,
                    source: 'HUNTER_IO'
                };
            }

            // Fallback to pattern if Hunter doesn't find it
            return this.generateEmailPattern(firstName, lastName, domain);

        } catch (error: any) {
            console.error('[Email] Hunter.io error:', error.message);
            return this.generateEmailPattern(firstName, lastName, domain);
        }
    }

    /**
     * Domain Finder - Get company domain from company name
     */
    private async getDomainFromCompany(company: string): Promise<string | null> {
        if (!company) return null;

        // Clean company name
        const cleanName = company
            .toLowerCase()
            .replace(/\s*(inc|llc|ltd|corp|co|company|limited)\.?\s*$/i, '')
            .trim();

        // If Hunter is configured, try domain search
        if (this.isConfigured && this.hunterApiKey) {
            try {
                const response = await axios.get('https://api.hunter.io/v2/domain-search', {
                    params: {
                        company: company,
                        api_key: this.hunterApiKey
                    },
                    timeout: 10000
                });

                if (response.data?.data?.domain) {
                    return response.data.data.domain;
                }
            } catch (error) {
                // Fall through to pattern
            }
        }

        // Generate likely domain patterns
        const domainPatterns = [
            `${cleanName.replace(/\s+/g, '')}.com`,
            `${cleanName.replace(/\s+/g, '-')}.com`,
            `${cleanName.split(' ')[0]}.com`,
        ];

        return domainPatterns[0];
    }

    /**
     * Generate email using common patterns
     * Patterns: first.last@, firstlast@, first@, flast@
     */
    private generateEmailPattern(firstName: string, lastName: string, domain: string): EmailResult {
        const first = firstName.toLowerCase();
        const last = lastName.toLowerCase();

        // Most common patterns by popularity
        const patterns = [
            `${first}.${last}@${domain}`,      // john.doe@company.com (most common)
            `${first}${last}@${domain}`,        // johndoe@company.com
            `${first}@${domain}`,               // john@company.com
            `${first[0]}${last}@${domain}`,     // jdoe@company.com
        ];

        return {
            email: patterns[0],  // Return most common pattern
            confidence: 45,      // Lower confidence for generated emails
            source: 'PATTERN_GENERATED'
        };
    }

    /**
     * Split full name into first and last name
     */
    private splitName(fullName: string): { firstName: string; lastName: string } {
        const parts = fullName.trim().split(/\s+/);

        if (parts.length === 1) {
            return { firstName: parts[0], lastName: '' };
        }

        return {
            firstName: parts[0],
            lastName: parts.slice(1).join(' ')
        };
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ============ Type Definitions ============

export interface EmailResult {
    email: string | null;
    confidence: number;
    source: 'HUNTER_IO' | 'CLEARBIT' | 'PATTERN_GENERATED' | 'NOT_FOUND';
}

export interface LeadToEnrich {
    name: string;
    company: string;
    role?: string;
    linkedinUrl?: string;
}

export interface EnrichedLead extends LeadToEnrich {
    email: string | null;
    emailConfidence: number;
    emailSource: string;
}
