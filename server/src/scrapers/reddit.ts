
import { IScraperAdapter, ScrapedResult, DetailedProfile } from './interfaces';
import axios from 'axios';

export class RedditAdapter implements IScraperAdapter {

    async search(query: string, options?: any): Promise<ScrapedResult[]> {
        console.log(`[RedditAdapter] Searching for: ${query}`);

        try {
            // Use Reddit's public JSON API (no auth required for public posts)
            const limit = options?.limit || 25;
            const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=${limit}&sort=relevance`;

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'LeadGenBot/1.0'
                }
            });

            const posts = response.data?.data?.children || [];

            return posts.map((post: any, i: number) => ({
                id: post.data.id,
                title: post.data.title,
                url: `https://www.reddit.com${post.data.permalink}`,
                platform: 'reddit' as const,
                metadata: {
                    subreddit: post.data.subreddit_name_prefixed,
                    score: post.data.score,
                    author: post.data.author
                }
            }));
        } catch (error: any) {
            console.error('[RedditAdapter] Error:', error.message);
            return [];
        }
    }

    async getProfile(username: string): Promise<DetailedProfile> {
        console.log(`[RedditAdapter] Getting user: ${username}`);

        try {
            const url = `https://www.reddit.com/user/${username}/about.json`;
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'LeadGenBot/1.0'
                }
            });

            const user = response.data?.data || {};

            return {
                id: user.id || username,
                name: user.name || username,
                about: user.subreddit?.public_description || '',
                sourceUrl: `https://www.reddit.com/user/${username}`,
                platform: 'reddit',
                data: user
            };
        } catch (error: any) {
            console.error('[RedditAdapter] Error:', error.message);
            return {
                id: username,
                name: username,
                sourceUrl: `https://www.reddit.com/user/${username}`,
                platform: 'reddit',
                data: { error: error.message }
            };
        }
    }
}
