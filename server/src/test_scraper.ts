
import { GoogleMapsScraper } from './scrapers/google_maps';

async function main() {
    console.log("Starting Google Maps Scraper Test (Headed Mode)...");
    // maxScrolls=5, headless=false
    const scraper = new GoogleMapsScraper(5, false);
    const results = await scraper.search("coffee shops in soho, london");
    console.log(`Found ${results.length} results.`);
    console.log(JSON.stringify(results.slice(0, 3), null, 2));
}

main().catch(console.error);
