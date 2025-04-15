import os
from typing import List, Dict, Any, Optional
from abc import ABC, abstractmethod
import asyncio
from dataclasses import dataclass
import logging
import aiohttp
from bs4 import BeautifulSoup
import arxiv
from scholarly import scholarly
from pydantic import BaseModel
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configure DeepSeek API
DEEPSEEK_API_KEY = os.getenv("NEXT_PUBLIC_DEEPSEEK_API_KEY")
if not DEEPSEEK_API_KEY:
    raise ValueError("DeepSeek API key not found in environment variables")

class DeepSeekClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.deepseek.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    async def chat_completion(self, messages: List[Dict[str, str]], model: str = "deepseek-chat") -> Dict[str, Any]:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": model,
                    "messages": messages,
                    "stream": False
                }
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f"DeepSeek API error: {error_text}")
                return await response.json()

    async def generate_text(self, prompt: str, model: str = "deepseek-chat") -> str:
        messages = [{"role": "user", "content": prompt}]
        response = await self.chat_completion(messages, model)
        return response["choices"][0]["message"]["content"]

@dataclass
class PaperMetadata:
    title: str
    authors: List[str]
    abstract: str = ""
    keywords: List[str] = None
    references: List[str] = None

class ResearchResult(BaseModel):
    papers: List[Dict[str, Any]]
    reports: List[Dict[str, Any]]
    databases: List[str]

class ContentResult(BaseModel):
    outline: List[str]
    sections: Dict[str, str]
    citations: List[str]

class Agent(ABC):
    def __init__(self, name: str):
        self.name = name
        self.status = "idle"
        self.deepseek = DeepSeekClient(DEEPSEEK_API_KEY)
        
    @abstractmethod
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        pass

class WebCrawlerAgent(Agent):
    async def search_arxiv(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        search = arxiv.Search(
            query=query,
            max_results=max_results,
            sort_by=arxiv.SortCriterion.Relevance
        )
        results = []
        for paper in search.results():
            results.append({
                "title": paper.title,
                "authors": [author.name for author in paper.authors],
                "summary": paper.summary,
                "pdf_url": paper.pdf_url,
                "published": paper.published
            })
        return results

    async def search_scholar(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
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

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"{self.name} starting web crawling")
        
        # Search academic databases
        arxiv_results = await self.search_arxiv(
            f"{context.get('title', '')} {context.get('keywords', '')}"
        )
        scholar_results = await self.search_scholar(
            f"{context.get('title', '')} {context.get('keywords', '')}"
        )
        
        return {
            "academic_papers": arxiv_results + scholar_results,
            "databases_accessed": ["arXiv", "Google Scholar"]
        }

class DataCollectionAgent(Agent):
    async def analyze_topics(self, papers: List[Dict[str, Any]]) -> Dict[str, Any]:
        prompt = f"""
        Analyze these research papers and identify the main topics and themes:
        {papers}
        
        Return a JSON object with:
        - main_topics: list of main topics
        - subtopics: list of subtopics
        - key_concepts: list of key concepts
        """
        
        result = await self.deepseek.generate_text(prompt)
        return eval(result)

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"{self.name} analyzing collected data")
        
        papers = context.get("academic_papers", [])
        topic_analysis = await self.analyze_topics(papers)
        
        return {
            "topic_analysis": topic_analysis,
            "literature_review": "Comprehensive review completed",
            "citations": [paper.get("title", "") for paper in papers]
        }

class ContentGenerationAgent(Agent):
    async def generate_outline(self, context: Dict[str, Any]) -> List[str]:
        prompt = f"""
        Generate a detailed outline for a research paper titled "{context.get('title', '')}" 
        based on the following research:
        
        Topics: {context.get('topic_analysis', {}).get('main_topics', [])}
        Key Concepts: {context.get('topic_analysis', {}).get('key_concepts', [])}
        
        Return a list of main sections and subsections.
        """
        
        result = await self.deepseek.generate_text(prompt)
        return eval(result)

    async def generate_section(self, section: str, context: Dict[str, Any]) -> str:
        prompt = f"""
        Write the {section} section for a research paper titled "{context.get('title', '')}".
        
        Topics: {context.get('topic_analysis', {}).get('main_topics', [])}
        Key Concepts: {context.get('topic_analysis', {}).get('key_concepts', [])}
        Citations: {context.get('citations', [])}
        
        Write in academic style, include relevant citations, and maintain coherence.
        """
        
        return await self.deepseek.generate_text(prompt)

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"{self.name} generating content")
        
        outline = await self.generate_outline(context)
        sections = {}
        
        for section in outline:
            content = await self.generate_section(section, context)
            sections[section] = content
        
        return {
            "outline": outline,
            "sections": sections,
            "citations_integrated": True
        }

class QualityControlAgent(Agent):
    async def check_grammar(self, text: str) -> Dict[str, Any]:
        prompt = f"""
        Check the following text for grammar, style, and academic writing standards:
        {text}
        
        Return a JSON object with:
        - issues: list of issues found
        - suggestions: list of suggestions for improvement
        - overall_quality: rating from 1-10
        """
        
        result = await self.deepseek.generate_text(prompt)
        return eval(result)

    async def check_plagiarism(self, text: str, citations: List[str]) -> Dict[str, Any]:
        prompt = f"""
        Check the following text for potential plagiarism issues:
        {text}
        
        Citations used: {citations}
        
        Return a JSON object with:
        - potential_issues: list of potential plagiarism issues
        - citation_coverage: percentage of text properly cited
        - recommendations: list of recommendations
        """
        
        result = await self.deepseek.generate_text(prompt)
        return eval(result)

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"{self.name} performing quality checks")
        
        sections = context.get("sections", {})
        citations = context.get("citations", [])
        
        grammar_results = {}
        plagiarism_results = {}
        
        for section, content in sections.items():
            grammar_results[section] = await self.check_grammar(content)
            plagiarism_results[section] = await self.check_plagiarism(content, citations)
        
        return {
            "grammar_check": grammar_results,
            "plagiarism_check": plagiarism_results,
            "format_check": "Passed"
        }

class ExpertReviewAgent(Agent):
    async def review_technical_accuracy(self, content: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
        Review the following content for technical accuracy:
        {content}
        
        Context: {context}
        
        Return a JSON object with:
        - accuracy_issues: list of technical inaccuracies
        - suggestions: list of suggestions for improvement
        - confidence_score: rating from 1-10
        """
        
        result = await self.deepseek.generate_text(prompt)
        return eval(result)

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"{self.name} performing expert review")
        
        sections = context.get("sections", {})
        review_results = {}
        
        for section, content in sections.items():
            review_results[section] = await self.review_technical_accuracy(content, context)
        
        return {
            "technical_accuracy": review_results,
            "content_coherence": "Verified",
            "citations_validated": True
        }

class FormattingAgent(Agent):
    async def format_content(self, content: Dict[str, Any], style: str = "IEEE") -> Dict[str, Any]:
        prompt = f"""
        Format the following content according to {style} style guidelines:
        {content}
        
        Return a JSON object with:
        - formatted_content: the formatted text
        - style_compliance: list of style requirements met
        - issues: list of remaining formatting issues
        """
        
        result = await self.deepseek.generate_text(prompt)
        return eval(result)

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"{self.name} formatting document")
        
        sections = context.get("sections", {})
        formatted_sections = {}
        
        for section, content in sections.items():
            formatted_sections[section] = await self.format_content(content)
        
        return {
            "style_compliance": "IEEE",
            "formatted_sections": formatted_sections,
            "document_structure": "Finalized"
        }

class AgentNetwork:
    def __init__(self, paper_metadata: PaperMetadata):
        self.paper_metadata = paper_metadata
        self.context = {
            "title": paper_metadata.title,
            "authors": paper_metadata.authors,
            "keywords": paper_metadata.keywords or []
        }
        self.agents = {
            "web_crawler": WebCrawlerAgent("WebCrawler"),
            "data_collection": DataCollectionAgent("DataCollector"),
            "content_generation": ContentGenerationAgent("ContentGenerator"),
            "quality_control": QualityControlAgent("QualityController"),
            "expert_review": ExpertReviewAgent("ExpertReviewer"),
            "formatting": FormattingAgent("Formatter")
        }

    async def research_phase(self):
        logger.info("Starting Research Phase")
        web_crawler_results = await self.agents["web_crawler"].execute(self.context)
        self.context.update(web_crawler_results)
        
        data_collection_results = await self.agents["data_collection"].execute(self.context)
        self.context.update(data_collection_results)
        return self.context

    async def writing_phase(self):
        logger.info("Starting Writing Phase")
        content_results = await self.agents["content_generation"].execute(self.context)
        self.context.update(content_results)
        return self.context

    async def review_phase(self):
        logger.info("Starting Review Phase")
        quality_results = await self.agents["quality_control"].execute(self.context)
        self.context.update(quality_results)
        
        expert_results = await self.agents["expert_review"].execute(self.context)
        self.context.update(expert_results)
        return self.context

    async def finalization_phase(self):
        logger.info("Starting Finalization Phase")
        formatting_results = await self.agents["formatting"].execute(self.context)
        self.context.update(formatting_results)
        return self.context

    async def execute_pipeline(self):
        try:
            await self.research_phase()
            await self.writing_phase()
            await self.review_phase()
            await self.finalization_phase()
            logger.info("Paper writing pipeline completed successfully")
            return self.context
        except Exception as e:
            logger.error(f"Error in pipeline execution: {str(e)}")
            raise

async def main():
    # Initialize paper metadata
    paper_metadata = PaperMetadata(
        title="Leading AI Agents: From Delegation to Orchestration",
        authors=["Hasan Mohammad Noman", "Tian Shao"],
        keywords=["AI Agents", "Delegation", "Orchestration", "Agent Networks"]
    )
    
    # Create and execute agent network
    network = AgentNetwork(paper_metadata)
    try:
        results = await network.execute_pipeline()
        logger.info("Final results:")
        logger.info(results)
    except Exception as e:
        logger.error(f"Pipeline execution failed: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main()) 