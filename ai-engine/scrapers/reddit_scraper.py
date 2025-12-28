"""
Reddit Scraper using PRAW (Python Reddit API Wrapper)
Finds business owners and decision makers in relevant subreddits
"""
import praw
from typing import List, Dict, Optional
from datetime import datetime
import os

class RedditScraper:
    def __init__(self):
        # Reddit API credentials (read from env)
        self.reddit = praw.Reddit(
            client_id=os.getenv("REDDIT_CLIENT_ID", ""),
            client_secret=os.getenv("REDDIT_CLIENT_SECRET", ""),
            user_agent=os.getenv("REDDIT_USER_AGENT", "LeadGen/1.0")
        )
    
    def search_subreddits(
        self, 
        subreddit_names: List[str], 
        keywords: List[str],
        limit: int = 50
    ) -> List[Dict]:
        """
        Search for posts in specified subreddits containing keywords
        
        Args:
            subreddit_names: List of subreddit names (e.g. ["smallbusiness", "entrepreneur"])
            keywords: Search keywords (e.g. ["need marketing", "looking for agency"])
            limit: Max results per subreddit
        
        Returns:
            List of persona dictionaries with Reddit user info
        """
        results = []
        
        for sub_name in subreddit_names:
            try:
                subreddit = self.reddit.subreddit(sub_name)
                
                for keyword in keywords:
                    # Search submissions (posts)
                    for submission in subreddit.search(keyword, limit=limit):
                        persona = {
                            "name": submission.author.name if submission.author else "Deleted",
                            "redditUser": f"u/{submission.author.name}" if submission.author else None,
                            "company": None,  # Extract from post if mentioned
                            "role": "Reddit User",
                            "source": "REDDIT",
                            "linkedinUrl": None,
                            "twitterHandle": None,
                            "location": None,
                            "postTitle": submission.title,
                            "postBody": submission.selftext[:500],  # Truncate
                            "subreddit": sub_name,
                            "postUrl": f"https://reddit.com{submission.permalink}",
                            "score": submission.score,
                            "createdAt": datetime.fromtimestamp(submission.created_utc).isoformat()
                        }
                        results.append(persona)
            
            except Exception as e:
                print(f"[Reddit] Error scraping r/{sub_name}: {e}")
        
        # Deduplicate by username
        unique_results = {}
        for r in results:
            username = r.get("redditUser")
            if username and username not in unique_results:
                unique_results[username] = r
        
        return list(unique_results.values())
    
    def get_user_profile(self, username: str) -> Optional[Dict]:
        """
        Get detailed profile of a Reddit user
        
        Args:
            username: Reddit username (without u/)
        
        Returns:
            User profile dict or None
        """
        try:
            user = self.reddit.redditor(username)
            
            # Get recent comments to extract interests/industry
            recent_comments = []
            for comment in user.comments.new(limit=10):
                recent_comments.append({
                    "subreddit": str(comment.subreddit),
                    "body": comment.body[:200],
                    "score": comment.score
                })
            
            return {
                "name": user.name,
                "redditUser": f"u/{user.name}",
                "commentKarma": user.comment_karma,
                "linkKarma": user.link_karma,
                "accountAge": (datetime.now() - datetime.fromtimestamp(user.created_utc)).days,
                "recentComments": recent_comments
            }
        
        except Exception as e:
            print(f"[Reddit] Error getting profile for u/{username}: {e}")
            return None


# Example usage:
if __name__ == "__main__":
    scraper = RedditScraper()
    
    # Search for business owners
    results = scraper.search_subreddits(
        subreddit_names=["smallbusiness", "Entrepreneur", "startups"],
        keywords=["need marketing help", "looking for agency", "need copywriter"],
        limit=20
    )
    
    print(f"Found {len(results)} potential leads on Reddit")
    for r in results[:5]:
        print(f"- {r['name']} in r/{r['subreddit']}: {r['postTitle']}")
