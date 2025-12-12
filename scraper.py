#!/usr/bin/env python3
"""
Shamela Book Scraper
Scrapes text from books on shamela.ws that are split by pages
"""

import requests
from bs4 import BeautifulSoup
import time
import argparse
import json
from typing import Optional, List, Dict


class ShamelaBookScraper:
    def __init__(self, book_id: int, start_page: int = 1, delay: float = 1.0):
        """
        Initialize the scraper
        
        Args:
            book_id: The book ID from the URL
            start_page: Starting page number (default: 1)
            delay: Delay between requests in seconds (default: 1.0)
        """
        self.book_id = book_id
        self.start_page = start_page
        self.delay = delay
        self.base_url = f"https://shamela.ws/book/{book_id}"
        
        # Headers to mimic a real browser
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
        }
        
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    def fetch_page(self, page_num: int) -> Optional[str]:
        """
        Fetch a single page
        
        Args:
            page_num: Page number to fetch
            
        Returns:
            HTML content if successful, None otherwise
        """
        url = f"{self.base_url}/{page_num}"
        
        try:
            response = self.session.get(url, timeout=10)
            
            # Check if page exists
            if response.status_code == 404:
                print(f"Page {page_num} not found (404)")
                return None
            
            response.raise_for_status()
            return response.text
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching page {page_num}: {e}")
            return None
    
    def extract_text(self, html: str) -> Optional[str]:
        """
        Extract text from HTML page
        
        Args:
            html: HTML content
            
        Returns:
            Extracted text or None if extraction fails
        """
        try:
            soup = BeautifulSoup(html, 'html.parser')
            
            # Try different possible content containers
            # Adjust these selectors based on actual page structure
            content_selectors = [
                'div.book-page',
                'div.nass',
                'div.book-content',
                'div.content',
                'article',
                'main',
                'div#content',
                'div.text-content'
            ]
            
            text_content = None
            
            for selector in content_selectors:
                element = soup.select_one(selector)
                if element:
                    text_content = element.get_text(separator='\n', strip=True)
                    break
            
            # Fallback: if no specific container found, try body
            if not text_content:
                body = soup.find('body')
                if body:
                    # Remove script and style tags
                    for tag in body(['script', 'style', 'nav', 'header', 'footer']):
                        tag.decompose()
                    text_content = body.get_text(separator='\n', strip=True)
            
            return text_content
            
        except Exception as e:
            print(f"Error extracting text: {e}")
            return None
    
    def scrape_book(self, max_pages: Optional[int] = None) -> List[Dict[str, any]]:
        """
        Scrape the entire book or up to max_pages
        
        Args:
            max_pages: Maximum number of pages to scrape (None for all)
            
        Returns:
            List of dictionaries containing page number and text
        """
        pages_data = []
        current_page = self.start_page
        consecutive_failures = 0
        max_consecutive_failures = 3
        
        print(f"Starting to scrape book {self.book_id} from page {self.start_page}")
        
        while True:
            # Check if we've reached max_pages
            if max_pages and len(pages_data) >= max_pages:
                print(f"Reached maximum of {max_pages} pages")
                break
            
            # Check if we've had too many consecutive failures
            if consecutive_failures >= max_consecutive_failures:
                print(f"Stopping after {max_consecutive_failures} consecutive failures")
                break
            
            print(f"Fetching page {current_page}...")
            
            # Fetch page
            html = self.fetch_page(current_page)
            
            if html is None:
                consecutive_failures += 1
                current_page += 1
                time.sleep(self.delay)
                continue
            
            # Extract text
            text = self.extract_text(html)
            
            if text and len(text.strip()) > 50:  # Only save pages with substantial content
                pages_data.append({
                    'page': current_page,
                    'text': text
                })
                print(f"✓ Page {current_page} scraped ({len(text)} characters)")
                consecutive_failures = 0
            else:
                print(f"✗ Page {current_page} has no content or failed to extract")
                consecutive_failures += 1
            
            current_page += 1
            
            # Respectful delay between requests
            time.sleep(self.delay)
        
        print(f"\nScraping complete! Collected {len(pages_data)} pages")
        return pages_data
    
    def save_to_file(self, pages_data: List[Dict], output_format: str = 'txt'):
        """
        Save scraped data to file
        
        Args:
            pages_data: List of page data dictionaries
            output_format: 'txt' or 'json'
        """
        if output_format == 'txt':
            filename = f"book_{self.book_id}.txt"
            with open(filename, 'w', encoding='utf-8') as f:
                for page_data in pages_data:
                    f.write(f"\n{'='*80}\n")
                    f.write(f"PAGE {page_data['page']}\n")
                    f.write(f"{'='*80}\n\n")
                    f.write(page_data['text'])
                    f.write("\n\n")
            print(f"Saved to {filename}")
            
        elif output_format == 'json':
            filename = f"book_{self.book_id}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(pages_data, f, ensure_ascii=False, indent=2)
            print(f"Saved to {filename}")


def main():
    parser = argparse.ArgumentParser(
        description='Scrape books from shamela.ws',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python shamela_scraper.py 26585
  python shamela_scraper.py 26585 --start-page 14 --max-pages 10
  python shamela_scraper.py 26585 --output json --delay 2
        """
    )
    
    parser.add_argument('book_id', type=int, help='Book ID from the URL')
    parser.add_argument('--start-page', type=int, default=1, help='Starting page number (default: 1)')
    parser.add_argument('--max-pages', type=int, help='Maximum number of pages to scrape (default: all)')
    parser.add_argument('--delay', type=float, default=1.0, help='Delay between requests in seconds (default: 1.0)')
    parser.add_argument('--output', choices=['txt', 'json'], default='txt', help='Output format (default: txt)')
    
    args = parser.parse_args()
    
    # Create scraper
    scraper = ShamelaBookScraper(
        book_id=args.book_id,
        start_page=args.start_page,
        delay=args.delay
    )
    
    # Scrape book
    pages_data = scraper.scrape_book(max_pages=args.max_pages)
    
    # Save to file
    if pages_data:
        scraper.save_to_file(pages_data, output_format=args.output)
    else:
        print("No pages were successfully scraped")


if __name__ == "__main__":
    main()

