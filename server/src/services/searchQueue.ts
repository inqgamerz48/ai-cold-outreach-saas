
import { PrismaClient, SearchJob } from '@prisma/client';
import { GoogleMapsScraper } from '../scrapers/google_maps';
import { ApifyService } from './apifyService';
import { EmailEnrichmentService } from './emailEnrichmentService';

const prisma = new PrismaClient();
const apifyService = new ApifyService();
const emailEnrichmentService = new EmailEnrichmentService();

export class SearchQueueWorker {
    private isProcessing: boolean = false;
    private pollInterval: number = 5000; // 5 seconds

    start() {
        console.log('[Queue] Worker started. Polling for jobs...');
        setInterval(() => this.processNextJob(), this.pollInterval);
    }

    async processNextJob() {
        if (this.isProcessing) return;

        try {
            // Find oldest PENDING job
            const job = await prisma.searchJob.findFirst({
                where: { status: 'PENDING' },
                orderBy: { createdAt: 'asc' }
            });

            if (!job) return;

            this.isProcessing = true;
            console.log(`[Queue] Processing Job #${job.id} (${job.source}: ${job.term})`);

            // Update to RUNNING
            await prisma.searchJob.update({
                where: { id: job.id },
                data: { status: 'RUNNING' }
            });

            try {
                await this.executeJob(job);

                await prisma.searchJob.update({
                    where: { id: job.id },
                    data: { status: 'COMPLETED' }
                });
                console.log(`[Queue] Job #${job.id} COMPLETED`);

            } catch (error: any) {
                console.error(`[Queue] Job #${job.id} FAILED:`, error.message);
                await prisma.searchJob.update({
                    where: { id: job.id },
                    data: { status: 'FAILED' }
                });
            }

        } catch (error) {
            console.error('[Queue] Error polling:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    private async executeJob(job: SearchJob) {
        switch (job.source) {
            case 'GOOGLE_MAPS':
                await this.processGoogleMaps(job);
                break;
            case 'REDDIT':
                await this.processReddit(job);
                break;
            case 'LINKEDIN':
                await this.processLinkedIn(job);
                break;
            case 'TWITTER':
                await this.processTwitter(job);
                break;
            default:
                throw new Error(`Unknown source: ${job.source}`);
        }
    }

    // ============ Google Maps Processing ============
    private async processGoogleMaps(job: SearchJob) {
        const scraper = new GoogleMapsScraper();
        const results = await scraper.search(job.term);

        const leadsData = results.map(r => ({
            name: r.name,
            jobId: job.id,
            tenantId: job.tenantId,
            gmapsUrl: r.gmaps_url,
            phone: r.phone,
            website: r.website,
            rating: r.rating,
            reviewsCount: r.reviews_count
        }));

        if (leadsData.length > 0) {
            await prisma.lead.createMany({ data: leadsData });
            console.log(`[G-Maps] Saved ${leadsData.length} leads`);
        }
    }

    // ============ LinkedIn Processing (Apify + Email Enrichment) ============
    private async processLinkedIn(job: SearchJob) {
        const searchTerm = job.term.replace('LinkedIn: ', '').trim();

        // Parse location if present (format: "query location")
        const parts = searchTerm.split(/\s+(?=\S+$)/);
        const query = parts[0] || searchTerm;
        const location = parts[1] || undefined;

        console.log(`[LinkedIn] Searching via Apify: ${query} ${location || ''}`);

        // Step 1: Get LinkedIn profiles via Apify
        const profiles = await apifyService.searchLinkedInProfiles(query, location, 10);

        if (profiles.length === 0) {
            console.log('[LinkedIn] No profiles found');
            return;
        }

        console.log(`[LinkedIn] Found ${profiles.length} profiles, enriching with emails...`);

        // Step 2: Enrich with emails
        const leadsToEnrich = profiles.map(p => ({
            name: p.name,
            company: p.company,
            role: p.role,
            linkedinUrl: p.linkedinUrl
        }));

        const enrichedLeads = await emailEnrichmentService.enrichLeads(leadsToEnrich);

        // Step 3: Save to database
        const personasData = enrichedLeads.map(lead => ({
            name: lead.name,
            role: lead.role || null,
            company: lead.company || null,
            linkedinUrl: lead.linkedinUrl || null,
            email: lead.email || null,
            source: 'APIFY_LINKEDIN',
            jobId: job.id,
            tenantId: job.tenantId
        }));

        if (personasData.length > 0) {
            await prisma.persona.createMany({ data: personasData });
            console.log(`[LinkedIn] Saved ${personasData.length} personas with emails`);
        }
    }

    // ============ Reddit Processing (Apify) ============
    private async processReddit(job: SearchJob) {
        const term = job.term.replace('Reddit: ', '');

        // Parse "keywords in subreddits" format
        let keywords: string[] = [term];
        let subreddits: string[] = ['startups', 'entrepreneur', 'smallbusiness'];

        if (term.includes(' in ')) {
            const parts = term.split(' in ');
            keywords = parts[0].split(',').map(k => k.trim());
            subreddits = parts[1].split(',').map(s => s.trim());
        }

        console.log(`[Reddit] Searching via Apify: ${keywords.join(', ')} in ${subreddits.join(', ')}`);

        const posts = await apifyService.searchReddit(subreddits, keywords, 25);

        const personasData = posts.map(post => ({
            name: post.author,
            redditUser: post.author,
            company: post.title.substring(0, 100), // Store title as context
            source: 'APIFY_REDDIT',
            jobId: job.id,
            tenantId: job.tenantId
        }));

        if (personasData.length > 0) {
            await prisma.persona.createMany({ data: personasData });
            console.log(`[Reddit] Saved ${personasData.length} potential leads from Reddit`);
        }
    }

    // ============ Twitter Processing (Placeholder) ============
    private async processTwitter(job: SearchJob) {
        // Twitter/X requires special API access
        // For now, log a message and skip
        console.log(`[Twitter] Twitter scraping requires API keys - job #${job.id} marked complete with no results`);

        // Could integrate with Apify Twitter actors in the future:
        // - apidojo/twitter-scraper
        // - quacker/twitter-url-scraper
    }
}
