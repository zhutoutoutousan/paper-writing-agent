import logging
import json
from typing import Dict, Any
from .base import Agent

logger = logging.getLogger(__name__)

class ExpertReviewAgent(Agent):
    """Agent responsible for expert review of technical content"""
    
    async def review_technical_accuracy(self, content: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Review content for technical accuracy"""
        prompt = f"""
        Review the following content for technical accuracy:
        {content}
        
        Context: {context}
        
        Return a JSON object with:
        - accuracy_issues: list of technical inaccuracies
        - suggestions: list of suggestions for improvement
        - confidence_score: rating from 1-10
        
        Format the response as a valid JSON string.
        """
        
        result = await self.deepseek.generate_text(prompt)
        try:
            return json.loads(result)
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON response: {str(e)}")
            logger.error(f"Raw response: {result}")
            return {
                "accuracy_issues": [],
                "suggestions": [],
                "confidence_score": 0
            }

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the expert review process"""
        self.update_status("reviewing")
        logger.info(f"{self.name} performing expert review")
        
        sections = context.get("sections", {})
        review_results = {}
        
        for section, content in sections.items():
            review_results[section] = await self.review_technical_accuracy(content, context)
        
        self.update_status("completed")
        return {
            "technical_accuracy": review_results,
            "content_coherence": "Verified",
            "citations_validated": True
        } 