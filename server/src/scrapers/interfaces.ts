
export interface IScraperAdapter {
    /**
     * Performs a search query on the target platform.
     * @param query The search term (e.g., job title, keyword).
     * @param options Optional platform-specific filters (location, limit, etc.).
     */
    search(query: string, options?: any): Promise<ScrapedResult[]>;

    /**
     * Retrieves detailed profile or item information by ID/URL.
     * @param id The unique identifier or URL.
     */
    getProfile(id: string): Promise<DetailedProfile>;
}

export interface ScrapedResult {
    id: string;
    title: string;
    url: string;
    platform: 'linkedin' | 'reddit' | 'google';
    metadata?: Record<string, any>;
}

export interface DetailedProfile {
    id: string;
    name: string;
    about?: string;
    email?: string;
    sourceUrl: string;
    platform: 'linkedin' | 'reddit' | 'google';
    data: any; // Raw data from the scraper
}
