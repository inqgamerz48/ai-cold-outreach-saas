
import { IScraperAdapter, ScrapedResult, DetailedProfile } from './interfaces';
import { chromium } from 'playwright';

export class GoogleAdapter implements IScraperAdapter {

    async search(query: string, options?: any): Promise<ScrapedResult[]> {
        console.log(`[GoogleAdapter] Searching for: ${query}`);

        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        try {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Wait for results to load
            await page.waitForSelector('#search', { timeout: 10000 }).catch(() => { });

            // Extract search results
            const results = await page.evaluate(() => {
                const items: any[] = [];
                const searchResults = document.querySelectorAll('#search .g');

                searchResults.forEach((result, i) => {
                    const titleEl = result.querySelector('h3');
                    const linkEl = result.querySelector('a');
                    const snippetEl = result.querySelector('.VwiC3b, .IsZvec');

                    if (titleEl && linkEl) {
                        items.push({
                            id: i.toString(),
                            title: titleEl.textContent || '',
                            url: linkEl.getAttribute('href') || '',
                            description: snippetEl?.textContent || ''
                        });
                    }
                });

                return items.slice(0, 10);
            });

            await browser.close();

            return results.map(r => ({
                ...r,
                platform: 'google' as const,
                metadata: { description: r.description }
            }));

        } catch (error: any) {
            await browser.close();
            console.error('[GoogleAdapter] Error:', error.message);
            return [];
        }
    }

    async getProfile(id: string): Promise<DetailedProfile> {
        throw new Error("GetProfile not applicable for generic Google Search.");
    }
}
