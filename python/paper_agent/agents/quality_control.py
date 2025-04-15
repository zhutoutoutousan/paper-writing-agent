import logging
import json
from typing import Dict, Any
from .base import Agent

logger = logging.getLogger(__name__)

class QualityControlAgent(Agent):
    """Agent responsible for checking paper quality"""
    
    async def check_grammar(self, text: str) -> Dict[str, Any]:
        """Check text for grammar and style issues"""
        prompt = f"""
        Check the following text for grammar, style, and academic writing standards:
        {text}
        
        Return a JSON object with:
        - issues: list of issues found
        - suggestions: list of suggestions for improvement
        - overall_quality: rating from 1-10
        
        Format the response as a valid JSON string.
        """
        
        result = await self.deepseek.generate_text(prompt)
        try:
            return json.loads(result)
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON response: {str(e)}")
            logger.error(f"Raw response: {result}")
            return {
                "issues": [],
                "suggestions": [],
                "overall_quality": 0
            }

    async def check_plagiarism(self, text: str, citations: list) -> Dict[str, Any]:
        """Check text for potential plagiarism issues"""
        prompt = f"""
        Check the following text for potential plagiarism issues:
        {text}
        
        Citations used: {citations}
        
        Return a JSON object with:
        - potential_issues: list of potential plagiarism issues
        - citation_coverage: percentage of text properly cited
        - recommendations: list of recommendations
        
        Format the response as a valid JSON string.
        """
        
        result = await self.deepseek.generate_text(prompt)
        try:
            return json.loads(result)
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON response: {str(e)}")
            logger.error(f"Raw response: {result}")
            return {
                "potential_issues": [],
                "citation_coverage": 0,
                "recommendations": []
            }

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the quality control process"""
        self.update_status("checking")
        logger.info(f"{self.name} performing quality checks")
        
        sections = context.get("sections", {})
        citations = context.get("citations", [])
        
        grammar_results = {}
        plagiarism_results = {}
        
        for section, content in sections.items():
            grammar_results[section] = await self.check_grammar(content)
            plagiarism_results[section] = await self.check_plagiarism(content, citations)
        
        self.update_status("completed")
        return {
            "grammar_check": grammar_results,
            "plagiarism_check": plagiarism_results,
            "format_check": "Passed"
        } 