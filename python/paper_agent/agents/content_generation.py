import logging
import json
from typing import Dict, Any
from .base import Agent

logger = logging.getLogger(__name__)

class ContentGenerationAgent(Agent):
    """Agent responsible for generating paper content"""
    
    async def generate_outline(self, context: Dict[str, Any]) -> list:
        """Generate a detailed outline for the paper"""
        prompt = f"""
        Generate a detailed outline for a research paper titled "{context.get('title', '')}" 
        based on the following research:
        
        Topics: {context.get('topic_analysis', {}).get('main_topics', [])}
        Key Concepts: {context.get('topic_analysis', {}).get('key_concepts', [])}
        
        Return a list of main sections and subsections as a valid JSON array.
        """
        
        result = await self.deepseek.generate_text(prompt)
        try:
            return json.loads(result)
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON response: {str(e)}")
            logger.error(f"Raw response: {result}")
            return []

    async def generate_section(self, section: str, context: Dict[str, Any]) -> str:
        """Generate content for a specific section"""
        prompt = f"""
        Write the {section} section for a research paper titled "{context.get('title', '')}".
        
        Topics: {context.get('topic_analysis', {}).get('main_topics', [])}
        Key Concepts: {context.get('topic_analysis', {}).get('key_concepts', [])}
        Citations: {context.get('citations', [])}
        
        Write in academic style, include relevant citations, and maintain coherence.
        """
        
        return await self.deepseek.generate_text(prompt)

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the content generation process"""
        self.update_status("generating")
        logger.info(f"{self.name} generating content")
        
        outline = await self.generate_outline(context)
        sections = {}
        
        for section in outline:
            content = await self.generate_section(section, context)
            sections[section] = content
        
        self.update_status("completed")
        return {
            "outline": outline,
            "sections": sections,
            "citations_integrated": True
        } 