"""
LinkedIn Scraper using Selenium with stealth mode
IMPORTANT: LinkedIn scraping may violate ToS. Use cautiously and respect rate limits.
This is for educational/research purposes.
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from typing import List, Dict, Optional
import time
import os

class LinkedInScraper:
    def __init__(self):
        """
        Initialize LinkedIn scraper with stealth Chrome driver
        Note: Requires LinkedIn session cookies or login
        """
        self.driver = None
        self.email = os.getenv("LINKEDIN_EMAIL", "")
        self.password = os.getenv("LINKEDIN_PASSWORD", "")
    
    def _init_driver(self):
        """Initialize Chrome driver with stealth settings"""
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        self.driver = webdriver.Chrome(options=options)
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    def login(self) -> bool:
        """
        Login to LinkedIn
        Returns True if successful
        """
        if not self.driver:
            self._init_driver()
        
        try:
            self.driver.get("https://www.linkedin.com/login")
            time.sleep(2)
            
            # Enter credentials
            email_field = self.driver.find_element(By.ID, "username")
            password_field = self.driver.find_element(By.ID, "password")
            
            email_field.send_keys(self.email)
            password_field.send_keys(self.password)
            
            # Click login
            login_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            login_button.click()
            
            time.sleep(5)  # Wait for login
            
            # Check if logged in
            return "feed" in self.driver.current_url or "mynetwork" in self.driver.current_url
        
        except Exception as e:
            print(f"[LinkedIn] Login error: {e}")
            return False
    
    def search_people(
        self, 
        keywords: str, 
        location: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict]:
        """
        Search for people on LinkedIn
        
        Args:
            keywords: Job title or keywords (e.g. "Marketing Director")
            location: Geographic location
            limit: Max results
        
        Returns:
            List of person dictionaries
        """
        if not self.driver:
            if not self.login():
                print("[LinkedIn] Login failed, cannot search")
                return []
        
        results = []
        
        try:
            # Build search URL
            query = keywords
            if location:
                query += f" {location}"
            
            search_url = f"https://www.linkedin.com/search/results/people/?keywords={query}"
            self.driver.get(search_url)
            time.sleep(3)
            
            # Scroll to load more results
            for _ in range(3):
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(2)
            
            # Extract profile cards
            profile_cards = self.driver.find_elements(By.CSS_SELECTOR, ".reusable-search__result-container")
            
            for card in profile_cards[:limit]:
                try:
                    # Extract name
                    name_elem = card.find_element(By.CSS_SELECTOR, ".entity-result__title-text a")
                    name = name_elem.text.strip()
                    profile_url = name_elem.get_attribute("href").split("?")[0]  # Clean URL
                    
                    # Extract headline (role)
                    headline_elem = card.find_element(By.CSS_SELECTOR, ".entity-result__primary-subtitle")
                    headline = headline_elem.text.strip()
                    
                    # Extract location
                    try:
                        location_elem = card.find_element(By.CSS_SELECTOR, ".entity-result__secondary-subtitle")
                        loc = location_elem.text.strip()
                    except NoSuchElementException:
                        loc = None
                    
                    persona = {
                        "name": name,
                        "role": headline,
                        "linkedinUrl": profile_url,
                        "location": loc,
                        "source": "LINKEDIN",
                        "company": None  # Requires visiting profile
                    }
                    
                    results.append(persona)
                
                except Exception as e:
                    print(f"[LinkedIn] Error parsing profile card: {e}")
                    continue
        
        except Exception as e:
            print(f"[LinkedIn] Search error: {e}")
        
        return results
    
    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()
            self.driver = None


# Example usage:
if __name__ == "__main__":
    scraper = LinkedInScraper()
    
    try:
        # Login required
        if scraper.login():
            print("[LinkedIn] Logged in successfully")
            
            # Search for marketing directors
            results = scraper.search_people("Marketing Director", location="Austin, TX", limit=5)
            
            print(f"\nFound {len(results)} LinkedIn profiles:")
            for r in results:
                print(f"- {r['name']} | {r['role']} | {r['linkedinUrl']}")
        else:
            print("[LinkedIn] Login failed. Set LINKEDIN_EMAIL and LINKEDIN_PASSWORD env vars.")
    
    finally:
        scraper.close()
