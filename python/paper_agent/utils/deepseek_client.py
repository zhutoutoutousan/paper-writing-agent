import os
import logging
import aiohttp
from typing import List, Dict, Any
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

class DeepSeekClient:
    """Client for interacting with DeepSeek API"""
    
    def __init__(self, api_key: str = None):
        load_dotenv()
        self.api_key = api_key or os.getenv("NEXT_PUBLIC_DEEPSEEK_API_KEY")
        if not self.api_key:
            raise ValueError("DeepSeek API key not found in environment variables")
        
        self.base_url = "https://api.deepseek.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def chat_completion(self, messages: List[Dict[str, str]], model: str = "deepseek-chat") -> Dict[str, Any]:
        """Make a chat completion request to DeepSeek API"""
        async with aiohttp.ClientSession() as session:
            try:
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
                        logger.error(f"DeepSeek API error: {error_text}")
                        raise Exception(f"DeepSeek API error: {error_text}")
                    return await response.json()
            except Exception as e:
                logger.error(f"Error in DeepSeek API call: {str(e)}")
                raise

    async def generate_text(self, prompt: str, model: str = "deepseek-chat") -> str:
        """Generate text using DeepSeek API"""
        messages = [{"role": "user", "content": prompt}]
        response = await self.chat_completion(messages, model)
        return response["choices"][0]["message"]["content"] 