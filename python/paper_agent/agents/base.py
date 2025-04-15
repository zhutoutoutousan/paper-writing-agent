from abc import ABC, abstractmethod
from typing import Dict, Any
import logging
from ..utils.deepseek_client import DeepSeekClient

logger = logging.getLogger(__name__)

class Agent(ABC):
    """Base class for all agents in the system"""
    
    def __init__(self, name: str):
        self.name = name
        self.status = "idle"
        self.deepseek = DeepSeekClient()
        
    @abstractmethod
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the agent's main task"""
        pass

    def update_status(self, status: str):
        """Update the agent's status"""
        self.status = status
        logger.info(f"{self.name} status updated to: {status}") 