from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

# Import scrapers
from scrapers.reddit_scraper import RedditScraper
from scrapers.twitter_scraper import TwitterScraper
from scrapers.linkedin_scraper import LinkedInScraper

# Import services
from services.rag_service import RAGService

app = FastAPI(title="AI Lead Discovery Engine", version="2.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize scrapers
reddit_scraper = RedditScraper()
twitter_scraper = TwitterScraper()
linkedin_scraper = LinkedInScraper()

# Initialize RAG service
rag_service = RAGService()

# === Pydantic Models ===

class RedditSearchRequest(BaseModel):
    subreddits: List[str]
    keywords: List[str]
    limit: int = 50

class TwitterSearchRequest(BaseModel):
    query: str
    max_results: int = 10

class TwitterEnrichRequest(BaseModel):
    name: str
    company: Optional[str] = None

class LinkedInSearchRequest(BaseModel):
    keywords: str
    location: Optional[str] = None
    limit: int = 10

class KnowledgeAddRequest(BaseModel):
    tenant_id: int
    title: str
    content: str
    knowledge_type: str  # CASE_STUDY, OFFER, TONE_EXAMPLE
    metadata: Optional[dict] = None

class KnowledgeQueryRequest(BaseModel):
    tenant_id: int
    query: str
    n_results: int = 3
    knowledge_type: Optional[str] = None

class EmailGenerationRequest(BaseModel):
    tenant_id: int
    lead_name: str
    lead_company: Optional[str] = None
    lead_role: Optional[str] = None
    user_context: str
    tone: str = "professional"

class ReplyClassificationRequest(BaseModel):
    reply_content: str

# === Health Check ===

@app.get("/")
def health_check():
    return {
        "status": "active", 
        "system": "AI Brain",
        "version": "3.0",
        "scrapers": ["reddit", "twitter", "linkedin"],
        "ai_features": ["rag", "email_generation", "reply_classification"]
    }

# === Reddit Endpoints ===

@app.post("/scrape/reddit")
def scrape_reddit(request: RedditSearchRequest):
    """
    Search Reddit for potential leads in specified subreddits
    """
    try:
        results = reddit_scraper.search_subreddits(
            subreddit_names=request.subreddits,
            keywords=request.keywords,
            limit=request.limit
        )
        
        return {
            "status": "success",
            "source": "reddit",
            "count": len(results),
            "results": results
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reddit scraping error: {str(e)}")

# === Twitter Endpoints ===

@app.post("/scrape/twitter")
def scrape_twitter(request: TwitterSearchRequest):
    """
    Search Twitter for users matching query
    """
    try:
        results = twitter_scraper.search_users(
            query=request.query,
            max_results=request.max_results
        )
        
        return {
            "status": "success",
            "source": "twitter",
            "count": len(results),
            "results": results
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Twitter scraping error: {str(e)}")

@app.post("/enrich/twitter")
def enrich_twitter(request: TwitterEnrichRequest):
    """
    Find Twitter handle for a person/company
    """
    try:
        handle = twitter_scraper.find_handle_by_name(
            name=request.name,
            company=request.company
        )
        
        return {
            "status": "success",
            "name": request.name,
            "twitterHandle": handle
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Twitter enrichment error: {str(e)}")

# === LinkedIn Endpoints ===

@app.post("/scrape/linkedin")
def scrape_linkedin(request: LinkedInSearchRequest):
    """
    Search LinkedIn for people (requires LinkedIn credentials in env)
    """
    try:
        # Check if credentials are set
        if not os.getenv("LINKEDIN_EMAIL") or not os.getenv("LINKEDIN_PASSWORD"):
            raise HTTPException(
                status_code=400,
                detail="LinkedIn credentials not set. Set LINKEDIN_EMAIL and LINKEDIN_PASSWORD environment variables."
            )
        
        # Login and search
        if not linkedin_scraper.login():
            raise HTTPException(status_code=401, detail="LinkedIn login failed")
        
        results = linkedin_scraper.search_people(
            keywords=request.keywords,
            location=request.location,
            limit=request.limit
        )
        
        linkedin_scraper.close()
        
        return {
            "status": "success",
            "source": "linkedin",
            "count": len(results),
            "results": results
        }
    
    except HTTPException:
        raise
    except Exception as e:
        linkedin_scraper.close()
        raise HTTPException(status_code=500, detail=f"LinkedIn scraping error: {str(e)}")

# === RAG & AI ENDPOINTS ===

@app.post("/knowledge/add")
def add_knowledge(request: KnowledgeAddRequest):
    """
    Add knowledge item to RAG vector database
    """
    try:
        vector_id = rag_service.add_knowledge(
            tenant_id=request.tenant_id,
            title=request.title,
            content=request.content,
            knowledge_type=request.knowledge_type,
            metadata=request.metadata
        )
        
        return {
            "status": "success",
            "message": "Knowledge added successfully",
            "vector_id": vector_id,
            "tenant_id": request.tenant_id
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding knowledge: {str(e)}")

@app.post("/knowledge/query")
def query_knowledge(request: KnowledgeQueryRequest):
    """
    Query knowledge base for relevant context
    """
    try:
        results = rag_service.query_knowledge(
            tenant_id=request.tenant_id,
            query=request.query,
            n_results=request.n_results,
            knowledge_type=request.knowledge_type
        )
        
        return {
            "status": "success",
            "query": request.query,
            "count": len(results),
            "results": results
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying knowledge: {str(e)}")

@app.post("/ai/generate-email")
def generate_email(request: EmailGenerationRequest):
    """
    Generate personalized email using RAG and GPT
    """
    try:
        email = rag_service.generate_email(
            tenant_id=request.tenant_id,
            lead_name=request.lead_name,
            lead_company=request.lead_company,
            lead_role=request.lead_role,
            user_context=request.user_context,
            tone=request.tone
        )
        
        return {
            "status": "success",
            "email": email,
            "lead_name": request.lead_name
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating email: {str(e)}")

@app.post("/ai/classify-reply")
def classify_reply(request: ReplyClassificationRequest):
    """
    Classify email reply sentiment and intent using GPT
    """
    try:
        classification = rag_service.classify_reply(request.reply_content)
        
        return {
            "status": "success",
            "classification": classification
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error classifying reply: {str(e)}")

# === Legacy Endpoint (for compatibility) ===

class AnalysisRequest(BaseModel):
    text: str

@app.post("/analyze")
def analyze_text(request: AnalysisRequest):
    """Legacy endpoint for AI analysis"""
    return {
        "analysis": "mock_result",
        "length": len(request.text),
        "sentiment": "neutral" 
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


