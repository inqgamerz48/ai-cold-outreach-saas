"""
RAG (Retrieval Augmented Generation) Service
Uses ChromaDB for vector storage and OpenAI for embeddings/generation
"""
try:
    import chromadb
    from chromadb.config import Settings
    from langchain_openai import OpenAIEmbeddings, ChatOpenAI
    from langchain.text_splitter import RecursiveCharacterTextSplitter
except ImportError:
    print("Warning: RAG dependencies not found. RAG features will be disabled.")
    chromadb = None
    Settings = None
    OpenAIEmbeddings = None
    ChatOpenAI = None
    RecursiveCharacterTextSplitter = None
from typing import List, Dict, Optional
import os

class RAGService:
    def __init__(self):
        """Initialize ChromaDB and OpenAI"""
        if chromadb is None:
             print("RAG Service disabled due to missing dependencies.")
             self.chroma_client = None
             self.embeddings = None
             self.llm = None
             self.text_splitter = None
             return

        # ChromaDB client (persistent)
        self.chroma_client = chromadb.PersistentClient(
            path="./chromadb_data",
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        # API Keys
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        
        # Embeddings model
        # If OpenAI key exists, use it. Otherwise use Chroma's default (all-MiniLM-L6-v2)
        if self.openai_api_key:
            self.embeddings = OpenAIEmbeddings(openai_api_key=self.openai_api_key)
        else:
            print("No OpenAI API Key found. Using ChromaDB default embeddings (local).")
            # Create a simple wrapper for Chroma's default embedding function to be compatible with LangChain
            from chromadb.utils import embedding_functions
            default_ef = embedding_functions.DefaultEmbeddingFunction()
            
            class ChromaEmbeddingWrapper:
                def __init__(self, ef):
                    self.ef = ef
                def embed_documents(self, texts):
                    return self.ef(texts)
                def embed_query(self, text):
                    return self.ef([text])[0]
            
            self.embeddings = ChromaEmbeddingWrapper(default_ef)
        
        # Chat model
        if self.openrouter_api_key:
            print("Using OpenRouter for LLM")
            self.llm = ChatOpenAI(
                model="openai/gpt-3.5-turbo", # OpenRouter model ID
                openai_api_key=self.openrouter_api_key,
                base_url="https://openrouter.ai/api/v1",
                default_headers={"HTTP-Referer": "https://github.com/Antigravity", "X-Title": "Cold Outreach Pro"}
            )
        elif self.openai_api_key:
             print("Using OpenAI for LLM")
             self.llm = ChatOpenAI(
                model="gpt-3.5-turbo",
                temperature=0.7,
                openai_api_key=self.openai_api_key
            )
        else:
            self.llm = None
        
        # Text splitter for chunking
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )
    
    def get_or_create_collection(self, tenant_id: int, collection_type: str = "knowledge"):
        """
        Get or create a ChromaDB collection for a tenant
        
        Args:
            tenant_id: Tenant ID for isolation
            collection_type: Type of collection (knowledge, examples, etc.)
        
        Returns:
            ChromaDB collection
        """
        collection_name = f"tenant_{tenant_id}_{collection_type}"
        
        try:
            collection = self.chroma_client.get_collection(name=collection_name)
        except:
            collection = self.chroma_client.create_collection(
                name=collection_name,
                metadata={"tenant_id": tenant_id, "type": collection_type}
            )
        
        return collection
    
    def add_knowledge(
        self, 
        tenant_id: int, 
        title: str, 
        content: str, 
        knowledge_type: str,
        metadata: Optional[Dict] = None
    ) -> str:
        """
        Add knowledge item to vector database
        
        Args:
            tenant_id: Tenant ID
            title: Knowledge item title
            content: Full content
            knowledge_type: CASE_STUDY, OFFER, TONE_EXAMPLE
            metadata: Additional metadata
        
        Returns:
            Vector ID
        """
        if not self.embeddings:
            raise ValueError("OpenAI API key not configured")
        
        collection = self.get_or_create_collection(tenant_id)
        
        # Chunk the content
        chunks = self.text_splitter.split_text(content)
        
        # Embed and store each chunk
        for i, chunk in enumerate(chunks):
            embedding = self.embeddings.embed_query(chunk)
            
            doc_id = f"{title}_{i}"
            
            collection.add(
                embeddings=[embedding],
                documents=[chunk],
                metadatas=[{
                    "title": title,
                    "type": knowledge_type,
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                    **(metadata or {})
                }],
                ids=[doc_id]
            )
        
        return f"{title}_0"  # Return first chunk ID as vector ID
    
    def query_knowledge(
        self,
        tenant_id: int,
        query: str,
        n_results: int = 3,
        knowledge_type: Optional[str] = None
    ) -> List[Dict]:
        """
        Query knowledge base for relevant context
        
        Args:
            tenant_id: Tenant ID
            query: Search query
            n_results: Number of results to return
            knowledge_type: Filter by type (optional)
        
        Returns:
            List of relevant knowledge chunks
        """
        if not self.embeddings:
            raise ValueError("OpenAI API key not configured")
        
        collection = self.get_or_create_collection(tenant_id)
        
        # Embed query
        query_embedding = self.embeddings.embed_query(query)
        
        # Query ChromaDB
        where_filter = {"type": knowledge_type} if knowledge_type else None
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where_filter
        )
        
        # Format results
        formatted_results = []
        for i in range(len(results['ids'][0])):
            formatted_results.append({
                "id": results['ids'][0][i],
                "content": results['documents'][0][i],
                "metadata": results['metadatas'][0][i],
                "distance": results['distances'][0][i] if 'distances' in results else None
            })
        
        return formatted_results
    
    def generate_email(
        self,
        tenant_id: int,
        lead_name: str,
        lead_company: Optional[str],
        lead_role: Optional[str],
        user_context: str,
        tone: str = "professional"
    ) -> Dict[str, str]:
        """
        Generate personalized email using RAG
        
        Args:
            tenant_id: Tenant ID
            lead_name: Lead's name
            lead_company: Lead's company
            lead_role: Lead's role
            user_context: User's business/offering description
            tone: Email tone (professional, casual, friendly)
        
        Returns:
            Dict with subject and body
        """
        if not self.llm:
            raise ValueError("OpenAI API key not configured")
        
        # Build query for RAG
        query = f"email outreach to {lead_role or 'decision maker'} at {lead_company or 'company'} about {user_context}"
        
        # Retrieve relevant knowledge
        relevant_knowledge = self.query_knowledge(tenant_id, query, n_results=3)
        
        # Build context from retrieved knowledge
        context_parts = []
        for item in relevant_knowledge:
            context_parts.append(f"[{item['metadata']['type']}] {item['content']}")
        
        context = "\n\n".join(context_parts) if context_parts else "No specific examples available."
        
        # Build prompt
        prompt = f"""You are writing a personalized cold outreach email.

LEAD INFORMATION:
- Name: {lead_name}
- Company: {lead_company or "Unknown"}
- Role: {lead_role or "Professional"}

YOUR OFFERING:
{user_context}

RELEVANT CONTEXT FROM KNOWLEDGE BASE:
{context}

INSTRUCTIONS:
- Write a personalized email in a {tone} tone
- Keep it concise (150-200 words)
- Focus on value proposition
- Include a clear call-to-action
- Use the recipient's name naturally
- Reference their company or role if possible

Generate the email with:
1. A compelling subject line (max 60 characters)
2. Email body

Format your response as:
SUBJECT: [subject line]

BODY:
[email body]"""

        # Generate with LLM
        response = self.llm.invoke(prompt)
        
        # Parse response
        content = response.content if hasattr(response, 'content') else str(response)
        
        # Extract subject and body
        lines = content.split('\n')
        subject = ""
        body_lines = []
        in_body = False
        
        for line in lines:
            if line.startswith("SUBJECT:"):
                subject = line.replace("SUBJECT:", "").strip()
            elif line.startswith("BODY:"):
                in_body = True
            elif in_body:
                body_lines.append(line)
        
        body = "\n".join(body_lines).strip()
        
        return {
            "subject": subject or "Collaboration Opportunity",
            "body": body or content  # Fallback to full content
        }
    
    def classify_reply(self, reply_content: str) -> Dict[str, str]:
        """
        Classify email reply sentiment and intent
        
        Args:
            reply_content: Reply email content
        
        Returns:
            Dict with sentiment and intent
        """
        if not self.llm:
            raise ValueError("OpenAI API key not configured")
        
        prompt = f"""Analyze this email reply and classify it:

EMAIL REPLY:
{reply_content}

Provide:
1. SENTIMENT: POSITIVE, NEGATIVE, or NEUTRAL
2. INTENT: INTERESTED, NOT_INTERESTED, QUESTION, or UNKNOWN

Format your response as:
SENTIMENT: [sentiment]
INTENT: [intent]"""

        response = self.llm.invoke(prompt)
        content = response.content if hasattr(response, 'content') else str(response)
        
        # Parse response
        sentiment = "NEUTRAL"
        intent = "UNKNOWN"
        
        for line in content.split('\n'):
            if line.startswith("SENTIMENT:"):
                sentiment = line.replace("SENTIMENT:", "").strip()
            elif line.startswith("INTENT:"):
                intent = line.replace("INTENT:", "").strip()
        
        return {
            "sentiment": sentiment,
            "intent": intent
        }


# Example usage
if __name__ == "__main__":
    rag = RAGService()
    
    # Add knowledge
    if os.getenv("OPENAI_API_KEY"):
        vector_id = rag.add_knowledge(
            tenant_id=1,
            title="SaaS Success Case Study",
            content="We helped Company X increase conversions by 300% using our AI-powered analytics platform...",
            knowledge_type="CASE_STUDY"
        )
        print(f"Added knowledge with vector ID: {vector_id}")
        
        # Generate email
        email = rag.generate_email(
            tenant_id=1,
            lead_name="John Doe",
            lead_company="TechCorp",
            lead_role="Marketing Director",
            user_context="AI-powered marketing automation platform",
            tone="professional"
        )
        print(f"\nSubject: {email['subject']}")
        print(f"Body:\n{email['body']}")
    else:
        print("Set OPENAI_API_KEY environment variable to test")
