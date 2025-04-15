import logging
import arxiv
import aiohttp
import io
import PyPDF2
from scholarly import scholarly
from typing import List, Dict, Any
from .base import Agent

logger = logging.getLogger(__name__)

class WebCrawlerAgent(Agent):
    """Agent responsible for gathering research papers and information"""
    
    async def download_arxiv_pdf(self, pdf_url: str) -> str:
        """Download and extract text from arXiv PDF"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(pdf_url) as response:
                    if response.status == 200:
                        pdf_data = await response.read()
                        pdf_file = io.BytesIO(pdf_data)
                        pdf_reader = PyPDF2.PdfReader(pdf_file)
                        text = ""
                        for page in pdf_reader.pages:
                            text += page.extract_text() + "\n"
                        return text
                    else:
                        logger.error(f"Failed to download PDF: {response.status}")
                        return ""
        except Exception as e:
            logger.error(f"Error downloading PDF: {str(e)}")
            return ""

    async def search_arxiv(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Search arXiv for relevant papers"""
        try:
            search = arxiv.Search(
                query=query,
                max_results=max_results,
                sort_by=arxiv.SortCriterion.Relevance
            )
            results = []
            for paper in search.results():
                pdf_url = paper.pdf_url
                pdf_text = await self.download_arxiv_pdf(pdf_url)
                results.append({
                    "title": paper.title,
                    "authors": [author.name for author in paper.authors],
                    "summary": paper.summary,
                    "pdf_url": pdf_url,
                    "pdf_text": pdf_text,
                    "published": paper.published
                })
            return results
        except Exception as e:
            logger.error(f"Error searching arXiv: {str(e)}")
            return []

    async def search_scholar(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Search Google Scholar for relevant papers"""
        try:
            search_query = scholarly.search_pubs(query)
            results = []
            for i, paper in enumerate(search_query):
                if i >= max_results:
                    break
                results.append({
                    "title": paper.bib.get('title', ''),
                    "authors": paper.bib.get('author', ''),
                    "abstract": paper.bib.get('abstract', ''),
                    "url": paper.bib.get('url', ''),
                    "year": paper.bib.get('year', '')
                })
            return results
        except Exception as e:
            logger.error(f"Error searching Google Scholar: {str(e)}")
            return []

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the web crawling process"""
        self.update_status("searching")
        logger.info(f"{self.name} starting web crawling")
        
        # Search academic databases
        arxiv_results = await self.search_arxiv(
            f"{context.get('title', '')} {context.get('keywords', '')}"
        )
        scholar_results = await self.search_scholar(
            f"{context.get('title', '')} {context.get('keywords', '')}"
        )
        
        self.update_status("completed")
        return {
            "academic_papers": arxiv_results + scholar_results,
            "databases_accessed": ["arXiv", "Google Scholar"]
        } 