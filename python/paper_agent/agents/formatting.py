import logging
import json
from typing import Dict, Any
from .base import Agent

logger = logging.getLogger(__name__)

class FormattingAgent(Agent):
    """Agent responsible for formatting the paper"""
    
    async def format_content(self, content: Dict[str, Any], style: str = "IEEE") -> Dict[str, Any]:
        """Format content according to specified style"""
        prompt = f"""
        Format the following content according to {style} style guidelines:
        {content}
        
        Return a JSON object with:
        - formatted_content: the formatted text
        - style_compliance: list of style requirements met
        - issues: list of remaining formatting issues
        
        Format the response as a valid JSON string.
        """
        
        result = await self.deepseek.generate_text(prompt)
        try:
            return json.loads(result)
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON response: {str(e)}")
            logger.error(f"Raw response: {result}")
            return {
                "formatted_content": str(content),
                "style_compliance": [],
                "issues": ["Failed to parse formatting response"]
            }

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the formatting process"""
        self.update_status("formatting")
        logger.info(f"{self.name} formatting document")
        
        sections = context.get("sections", {})
        formatted_sections = {}
        
        for section, content in sections.items():
            formatted_sections[section] = await self.format_content(content)
        
        self.update_status("completed")
        return {
            "style_compliance": "IEEE",
            "formatted_sections": formatted_sections,
            "document_structure": "Finalized"
        } 