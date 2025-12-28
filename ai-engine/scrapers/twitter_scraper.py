"""
Twitter Scraper using Tweepy
Finds Twitter handles and enriches lead data
"""
import tweepy
from typing import List, Dict, Optional
import os

class TwitterScraper:
    def __init__(self):
        # Twitter API v2 credentials
        self.client = tweepy.Client(
            bearer_token=os.getenv("TWITTER_BEARER_TOKEN", ""),
            consumer_key=os.getenv("TWITTER_API_KEY", ""),
            consumer_secret=os.getenv("TWITTER_API_SECRET", ""),
            access_token=os.getenv("TWITTER_ACCESS_TOKEN", ""),
            access_token_secret=os.getenv("TWITTER_ACCESS_SECRET", ""),
            wait_on_rate_limit=True
        )
    
    def search_users(self, query: str, max_results: int = 10) -> List[Dict]:
        """
        Search for Twitter users by query
        
        Args:
            query: Search query (e.g. "CEO SaaS" or "Marketing Director Austin")
            max_results: Max results to return
        
        Returns:
            List of user dictionaries
        """
        results = []
        
        try:
            # Search recent tweets, then get unique users
            tweets = self.client.search_recent_tweets(
                query=query,
                max_results=min(max_results, 100),
                tweet_fields=["author_id", "created_at"],
                user_fields=["name", "username", "description", "location", "verified"]
            )
            
            if not tweets.data:
                return results
            
            # Get unique author IDs
            author_ids = list(set([tweet.author_id for tweet in tweets.data]))[:max_results]
            
            # Fetch user details
            users = self.client.get_users(
                ids=author_ids,
                user_fields=["name", "username", "description", "location", "verified", "public_metrics"]
            )
            
            for user in users.data or []:
                persona = {
                    "name": user.name,
                    "twitterHandle": f"@{user.username}",
                    "bio": user.description,
                    "location": user.location,
                    "verified": user.verified,
                    "followers": user.public_metrics["followers_count"] if hasattr(user, "public_metrics") else 0,
                    "source": "TWITTER",
                    "twitterUrl": f"https://twitter.com/{user.username}"
                }
                results.append(persona)
        
        except Exception as e:
            print(f"[Twitter] Error searching users: {e}")
        
        return results
    
    def find_handle_by_name(self, name: str, company: Optional[str] = None) -> Optional[str]:
        """
        Find Twitter handle for a person/company
        
        Args:
            name: Person or company name
            company: Optional company name for disambiguation
        
        Returns:
            Twitter handle (with @) or None
        """
        try:
            query = f"{name}"
            if company:
                query += f" {company}"
            
            users = self.search_users(query, max_results=1)
            
            if users:
                return users[0].get("twitterHandle")
        
        except Exception as e:
            print(f"[Twitter] Error finding handle for {name}: {e}")
        
        return None
    
    def enrich_lead(self, lead: Dict) -> Dict:
        """
        Enrich a lead with Twitter data
        
        Args:
            lead: Lead dict with 'name' and optionally 'company'
        
        Returns:
            Enriched lead dict with Twitter info
        """
        name = lead.get("name", "")
        company = lead.get("company")
        
        handle = self.find_handle_by_name(name, company)
        
        if handle:
            lead["twitterHandle"] = handle
            lead["twitterUrl"] = handle.replace("@", "https://twitter.com/")
        
        return lead


# Example usage:
if __name__ == "__main__":
    scraper = TwitterScraper()
    
    # Search for marketing professionals
    results = scraper.search_users("Marketing Director SaaS", max_results=10)
    
    print(f"Found {len(results)} Twitter profiles")
    for r in results:
        print(f"- {r['name']} ({r['twitterHandle']}): {r['bio']}")
    
    # Enrich a lead
    lead = {"name": "Elon Musk", "company": "Tesla"}
    enriched = scraper.enrich_lead(lead)
    print(f"\nEnriched lead: {enriched}")
