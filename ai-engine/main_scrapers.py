from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

# Import scrapers
from scrapers.reddit_scraper import RedditScraper
from scrapers.twitter_scraper import TwitterScraper
from scrapers.linkedin_scraper import LinkedInScraper

app = FastAPI(title="AI Lead Discovery Engine (Scrapers Only)", version="2.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize scrapers
try:
    reddit_scraper = RedditScraper()
except:
    print("Reddit Scraper init failed (likely keys missing).")
    reddit_scraper = None

try:
    twitter_scraper = TwitterScraper()
except:
    print("Twitter Scraper init failed.")
    twitter_scraper = None

try:
    linkedin_scraper = LinkedInScraper()
except:
    print("LinkedIn Scraper init failed.")
    linkedin_scraper = None

# === Pydantic Models ===

class RedditSearchRequest(BaseModel):
    subreddits: List[str]
    keywords: List[str]
    limit: int = 50

class TwitterSearchRequest(BaseModel):
    query: str
    max_results: int = 10

class LinkedInSearchRequest(BaseModel):
    keywords: str
    location: Optional[str] = None
    limit: int = 10

# === Health Check ===

@app.get("/")
def health_check():
    return {
        "status": "active", 
        "system": "AI Brain (Scrapers Only)",
        "version": "2.1",
        "scrapers_status": {
            "reddit": reddit_scraper is not None,
            "twitter": twitter_scraper is not None,
            "linkedin": linkedin_scraper is not None
        }
    }

# === Reddit Endpoints ===

@app.post("/scrape/reddit")
def scrape_reddit(request: RedditSearchRequest):
    if not reddit_scraper:
        raise HTTPException(status_code=503, detail="Reddit scraper not initialized")
    results = reddit_scraper.search_subreddits(
        subreddit_names=request.subreddits,
        keywords=request.keywords,
        limit=request.limit
    )
    return {"status": "success", "results": results}

# === Twitter Endpoints ===

@app.post("/scrape/twitter")
def scrape_twitter(request: TwitterSearchRequest):
    if not twitter_scraper:
        raise HTTPException(status_code=503, detail="Twitter scraper not initialized")
    results = twitter_scraper.search_users(query=request.query, max_results=request.max_results)
    return {"status": "success", "results": results}

# === LinkedIn Endpoints ===

@app.post("/scrape/linkedin")
def scrape_linkedin(request: LinkedInSearchRequest):
    if not linkedin_scraper:
        raise HTTPException(status_code=503, detail="LinkedIn scraper not initialized")
    # ... (login logic implied in scraper or here)
    if not linkedin_scraper.login():
         raise HTTPException(status_code=401, detail="LinkedIn login failed")
    
    results = linkedin_scraper.search_people(
        keywords=request.keywords,
        location=request.location,
        limit=request.limit
    )
    return {"status": "success", "results": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
