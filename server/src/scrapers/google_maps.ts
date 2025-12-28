import { chromium, Browser, Page } from 'playwright';
import fs from 'fs';
import path from 'path';

export interface GoogleMapLead {
    name: string;
    address?: string;
    website?: string;
    phone?: string;
    description?: string;
    reviews_count?: number;
    rating?: number;
    gmaps_url: string;
    search_term: string;
}

export class GoogleMapsScraper {
    private results: GoogleMapLead[] = [];
    private maxScrolls: number;
    private headless: boolean;

    constructor(maxScrolls: number = 5, headless: boolean = true) {
        this.maxScrolls = maxScrolls;
        this.headless = headless;
    }

    public async search(term: string): Promise<GoogleMapLead[]> {
        this.results = [];
        console.log(`[G-Maps] Starting search for: ${term}`);

        const browser = await chromium.launch({
            headless: this.headless,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--start-maximized'
            ]
        });

        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });

        const page = await context.newPage();

        try {
            const url = `https://www.google.com/maps/search/${encodeURIComponent(term)}`;

            // Relaxed wait condition
            await page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });

            // Handle Consent Popup (common in EU)
            try {
                const consentSelector = 'button[aria-label="Accept all"], button:has-text("Accept all")';
                if (await page.$(consentSelector)) {
                    console.log('[G-Maps] Clicking consent button...');
                    await page.click(consentSelector);
                    await page.waitForTimeout(2000);
                }
            } catch (ignore) { }

            // Wait for Feed
            try {
                // "div[role='feed']" is standard, but sometimes it loads slowly.
                // We'll wait a bit longer or check for "No results"
                // "div[role='feed']" is standard, but sometimes it loads slowly.
                // We'll wait a bit longer or check for "No results"
                try {
                    await page.waitForSelector('div[role="feed"]', { timeout: 10000 });
                } catch {
                    console.log('[G-Maps] Feed container not immediately found, waiting for articles directly...');
                    await page.waitForSelector('div[role="article"]', { timeout: 10000 });
                }
            } catch (e) {
                console.log(`[G-Maps] Feed not found. Check screenshot.`);
                await page.screenshot({ path: 'error_map_screenshot.png' });
                await browser.close();
                return [];
            }

            // Scroll
            await this.autoScroll(page);

            // Extract
            const listings = await page.$$('div[role="article"]');
            console.log(`[G-Maps] Found ${listings.length} listings.`);

            for (const listing of listings) {
                try {
                    const ariaLabel = await listing.getAttribute('aria-label');
                    if (!ariaLabel) continue;

                    // Link
                    const linkEl = await listing.$('a[href*="/maps/place"]');
                    let link = await linkEl?.getAttribute('href');
                    if (link && !link.startsWith('http')) {
                        link = 'https://www.google.com' + link;
                    }

                    // Text for Phone/Rating
                    const text = await listing.innerText();
                    const lines = text.split('\n');

                    // Extract logic
                    let phone: string | undefined;
                    let rating: number | undefined;
                    let reviewsCount: number | undefined;
                    let website: string | undefined;

                    // Website check
                    const anchors = await listing.$$('a');
                    for (const a of anchors) {
                        const href = await a.getAttribute('href');
                        if (href && !href.includes('google.com/maps') && !href.startsWith('/') && href.startsWith('http')) {
                            website = href;
                            break;
                        }
                    }

                    const phoneRegex = /(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/;

                    for (const line of lines) {
                        if (!phone && phoneRegex.test(line)) {
                            phone = line.match(phoneRegex)?.[0];
                        }
                        if (line.match(/^\d\.\d$/)) {
                            rating = parseFloat(line);
                        }
                        if (line.match(/^\(\d+\)$/)) {
                            reviewsCount = parseInt(line.replace(/\D/g, ''));
                        }
                    }

                    this.results.push({
                        name: ariaLabel,
                        gmaps_url: link || '',
                        search_term: term,
                        phone,
                        rating,
                        reviews_count: reviewsCount,
                        website
                    });

                } catch (err) {
                    console.error('Error parsing item', err);
                }
            }

        } catch (error) {
            console.error('[G-Maps] Error:', error);
            try { await page.screenshot({ path: 'error_fatal_screenshot.png' }); } catch (e) { }
        } finally {
            await browser.close();
        }

        return this.results;
    }

    private async autoScroll(page: Page) {
        console.log(`[G-Maps] Scrolling ${this.maxScrolls} times...`);
        for (let i = 0; i < this.maxScrolls; i++) {
            await page.mouse.wheel(0, 5000);
            await page.waitForTimeout(1000 + Math.random() * 1000);
        }
    }
}
