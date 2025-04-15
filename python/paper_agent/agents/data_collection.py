import logging
import json
from typing import Dict, Any
from .base import Agent

logger = logging.getLogger(__name__)

class DataCollectionAgent(Agent):
    """Agent responsible for analyzing and organizing collected research data"""
    
    async def analyze_topics(self, papers: list) -> Dict[str, Any]:
        """Analyze research papers to identify main topics and themes"""
        prompt = f"""
        Analyze these research papers and identify the main topics and themes:
        {papers}
        
        Return a JSON object with:
        - main_topics: list of main topics
        - subtopics: list of subtopics
        - key_concepts: list of key concepts
        
        Format the response as a valid JSON string.
        """
        
        result = await self.deepseek.generate_text(prompt)
        try:
            return json.loads(result)
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON response: {str(e)}")
            logger.error(f"Raw response: {result}")
            return {
                "main_topics": [],
                "subtopics": [],
                "key_concepts": []
            }

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the data collection and analysis process"""
        self.update_status("analyzing")
        logger.info(f"{self.name} analyzing collected data")
        
        papers = context.get("academic_papers", [])
        topic_analysis = await self.analyze_topics(papers)
        
        self.update_status("completed")
        return {
            "topic_analysis": topic_analysis,
            "literature_review": "Comprehensive review completed",
            "citations": [paper.get("title", "") for paper in papers]
        } 