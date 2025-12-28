import { PlaywrightCrawler } from 'crawlee';

export interface PersonaResult {
    name: string;
    role: string;
    linkedinUrl: string;
    company?: string;
    location?: string;
    sourceStr: string;
}

export class SerpScraper {
    private crawler: PlaywrightCrawler;
    private results: PersonaResult[] = [];

    constructor() {
        this.crawler = new PlaywrightCrawler({
            headless: true,
            browserPoolOptions: { useFingerprints: true },
            requestHandler: async ({ page, request, log }) => {
                log.info(`[SERP] Processing: ${request.url}`);

                // Wait for results
                await page.waitForSelector('#search');

                // Robust scraping strategy: Find all LinkedIn profile links
                const anchors = await page.$$('a[href*="linkedin.com/in/"]');

                for (const anchor of anchors) {
                    try {
                        const link = await anchor.getAttribute('href');
                        if (!link) continue;

                        // Title is usually inside the h3 in the anchor
                        const titleEl = await anchor.$('h3');
                        if (!titleEl) continue; // Not a main result link if no h3

                        const title = await titleEl.innerText();

                        // Snippet is usually in a div following the header structure
                        // We traverse up to find the container, then look for the snippet
                        // Common container class is .MjjYud or .tF2Cxc, but let's try to find a sibling div
                        // text-block class often: .VwiC3b

                        // Simplification: valid result found
                        const parts = title.split(' - ');
                        const name = parts[0] ? parts[0].replace(' | LinkedIn', '').trim() : 'Unknown';
                        const role = parts[1] ? parts[1].replace(' | LinkedIn', '').trim() : 'Unknown Role';

                        // Check uniqueness
                        if (!this.results.find(r => r.linkedinUrl === link)) {
                            this.results.push({
                                name,
                                role,
                                linkedinUrl: link,
                                company: 'LinkedIn Profile', // Placeholder
                                sourceStr: title,
                                location: '' // Hard to extract reliably without visiting
                            });
                        }

                    } catch (e) {
                        log.warning(`[SERP] Error parsing result: ${e}`);
                    }
                }
                if (this.results.length === 0) {
                    log.warning('[SERP] No results found. Saving HTML for debugging.');
                    const html = await page.content();
                    const fs = require('fs');
                    fs.writeFileSync('serp_debug.html', html);
                }
            },
        });
    }

    public async searchPersonas(role: string, location: string): Promise<PersonaResult[]> {
        this.results = [];
        // Google query: site:linkedin.com/in/ "Role" "Location"
        const query = `site:linkedin.com/in/ "${role}" "${location}"`;
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

        await this.crawler.run([url]);
        return this.results;
    }
}
