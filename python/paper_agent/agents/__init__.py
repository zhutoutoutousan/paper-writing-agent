"""
Agents for the paper writing process
"""

from .base import Agent
from .web_crawler import WebCrawlerAgent
from .data_collection import DataCollectionAgent
from .content_generation import ContentGenerationAgent
from .quality_control import QualityControlAgent
from .expert_review import ExpertReviewAgent
from .formatting import FormattingAgent

__all__ = [
    'Agent',
    'WebCrawlerAgent',
    'DataCollectionAgent',
    'ContentGenerationAgent',
    'QualityControlAgent',
    'ExpertReviewAgent',
    'FormattingAgent'
] 