from setuptools import setup, find_packages

setup(
    name="paper_agent",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "aiohttp",
        "arxiv",
        "scholarly",
        "pydantic",
        "python-dotenv",
    ],
    python_requires=">=3.8",
) 