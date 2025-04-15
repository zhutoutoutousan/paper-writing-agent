import tkinter as tk
from tkinter import ttk, scrolledtext
import asyncio
import logging
from typing import Dict, Any
from ..models.paper_metadata import PaperMetadata
from ..agents.web_crawler import WebCrawlerAgent
from ..agents.data_collection import DataCollectionAgent
from ..agents.content_generation import ContentGenerationAgent
from ..agents.quality_control import QualityControlAgent
from ..agents.expert_review import ExpertReviewAgent
from ..agents.formatting import FormattingAgent

logger = logging.getLogger(__name__)

class MainWindow:
    """Main GUI window for the paper agent application"""
    
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Paper Writing Agent")
        self.root.geometry("1600x800")  # Increased width for side-by-side layout
        
        self.context: Dict[str, Any] = {}
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the user interface"""
        # Create main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Left panel for controls and results
        left_panel = ttk.Frame(main_frame)
        left_panel.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 10))
        
        # Paper metadata section
        metadata_frame = ttk.LabelFrame(left_panel, text="Paper Metadata", padding="5")
        metadata_frame.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=5)
        
        ttk.Label(metadata_frame, text="Title:").grid(row=0, column=0, sticky=tk.W)
        self.title_entry = ttk.Entry(metadata_frame, width=50)
        self.title_entry.grid(row=0, column=1, sticky=(tk.W, tk.E), padx=5)
        
        ttk.Label(metadata_frame, text="Authors:").grid(row=1, column=0, sticky=tk.W)
        self.authors_entry = ttk.Entry(metadata_frame, width=50)
        self.authors_entry.grid(row=1, column=1, sticky=(tk.W, tk.E), padx=5)
        
        ttk.Label(metadata_frame, text="Keywords:").grid(row=2, column=0, sticky=tk.W)
        self.keywords_entry = ttk.Entry(metadata_frame, width=50)
        self.keywords_entry.grid(row=2, column=1, sticky=(tk.W, tk.E), padx=5)
        
        # Status section
        status_frame = ttk.LabelFrame(left_panel, text="Status", padding="5")
        status_frame.grid(row=1, column=0, sticky=(tk.W, tk.E), pady=5)
        
        self.status_text = scrolledtext.ScrolledText(status_frame, height=10, width=80)
        self.status_text.grid(row=0, column=0, sticky=(tk.W, tk.E))
        
        # Control buttons
        button_frame = ttk.Frame(left_panel)
        button_frame.grid(row=2, column=0, pady=5)
        
        ttk.Button(button_frame, text="Start Research", command=self.start_research).grid(row=0, column=0, padx=5)
        ttk.Button(button_frame, text="Generate Content", command=self.generate_content).grid(row=0, column=1, padx=5)
        ttk.Button(button_frame, text="Review", command=self.review).grid(row=0, column=2, padx=5)
        ttk.Button(button_frame, text="Format", command=self.format).grid(row=0, column=3, padx=5)
        
        # Results section
        results_frame = ttk.LabelFrame(left_panel, text="Results", padding="5")
        results_frame.grid(row=3, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5)
        
        self.results_text = scrolledtext.ScrolledText(results_frame, height=20, width=80)
        self.results_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Right panel for final paper
        right_panel = ttk.Frame(main_frame)
        right_panel.grid(row=0, column=1, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Final paper section
        paper_frame = ttk.LabelFrame(right_panel, text="Final Paper", padding="5")
        paper_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5)
        
        self.paper_text = scrolledtext.ScrolledText(paper_frame, height=40, width=80)
        self.paper_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(0, weight=1)
        left_panel.columnconfigure(0, weight=1)
        left_panel.rowconfigure(3, weight=1)
        right_panel.columnconfigure(0, weight=1)
        right_panel.rowconfigure(0, weight=1)
        
    def update_status(self, message: str):
        """Update the status text area"""
        self.status_text.insert(tk.END, f"{message}\n")
        self.status_text.see(tk.END)
        
    def update_results(self, message: str):
        """Update the results text area"""
        self.results_text.insert(tk.END, f"{message}\n")
        self.results_text.see(tk.END)
        
    def update_paper(self, content: str):
        """Update the final paper text area"""
        self.paper_text.delete(1.0, tk.END)
        self.paper_text.insert(tk.END, content)
        self.paper_text.see(tk.END)
        
    def get_paper_metadata(self) -> PaperMetadata:
        """Get paper metadata from the form"""
        return PaperMetadata(
            title=self.title_entry.get(),
            authors=self.authors_entry.get().split(","),
            keywords=self.keywords_entry.get().split(",")
        )
        
    async def run_agent(self, agent, phase_name: str):
        """Run an agent and update the UI"""
        try:
            self.update_status(f"Starting {phase_name} phase...")
            results = await agent.execute(self.context)
            self.context.update(results)
            
            # Generate content if this is the content generation phase
            if phase_name == "Content Generation":
                self.generate_paper_content()
            
            self.update_status(f"{phase_name} phase completed successfully")
            self.update_results(str(results))
            
            # Update final paper if we have formatted sections
            if "formatted_sections" in results:
                paper_content = self.format_paper_content(results["formatted_sections"])
                self.update_paper(paper_content)
        except Exception as e:
            self.update_status(f"Error in {phase_name} phase: {str(e)}")
            logger.error(f"Error in {phase_name} phase: {str(e)}")
            
    def generate_paper_content(self):
        """Generate paper content from research data"""
        if "academic_papers" not in self.context:
            return
            
        # Generate outline
        outline = [
            {"title": "Introduction", "level": 1},
            {"title": "Literature Review", "level": 1},
            {"title": "Methodology", "level": 1},
            {"title": "Findings and Analysis", "level": 1},
            {"title": "Discussion", "level": 1},
            {"title": "Conclusion", "level": 1}
        ]
        
        # Generate sections
        sections = {
            "Introduction": {
                "content": "This paper explores the evolving landscape of AI delegation and orchestration, examining recent developments and their implications for human-AI collaboration.",
                "citations": []
            },
            "Literature Review": {
                "content": "Recent research has focused on several key aspects of AI delegation:\n\n",
                "citations": self.context.get("citations", [])
            },
            "Methodology": {
                "content": "This study employs a systematic literature review approach, analyzing recent publications on AI delegation and orchestration.",
                "citations": []
            },
            "Findings and Analysis": {
                "content": "Key findings from the literature review include:\n\n",
                "citations": []
            },
            "Discussion": {
                "content": "The research indicates several important trends in AI delegation and orchestration:",
                "citations": []
            },
            "Conclusion": {
                "content": "The findings suggest significant potential for improved human-AI collaboration through effective delegation and orchestration.",
                "citations": []
            }
        }
        
        # Add paper summaries to Literature Review
        for paper in self.context["academic_papers"]:
            sections["Literature Review"]["content"] += f"- {paper['title']} ({paper['year']})\n"
            sections["Literature Review"]["content"] += f"  Authors: {', '.join(paper['authors'])}\n"
            sections["Literature Review"]["content"] += f"  Key Points: {paper['abstract'][:200]}...\n\n"
            
        # Add key findings
        if "topic_analysis" in self.context:
            sections["Findings and Analysis"]["content"] += "Key concepts identified in the research:\n"
            for concept in self.context["topic_analysis"].get("key_concepts", []):
                sections["Findings and Analysis"]["content"] += f"- {concept}\n"
                
        # Update context with generated content
        self.context["outline"] = outline
        self.context["sections"] = sections
        self.context["citations_integrated"] = True
        
        # Update the paper display
        paper_content = self.format_paper_content(sections)
        self.update_paper(paper_content)
        
    def format_paper_content(self, sections: Dict[str, Dict[str, Any]]) -> str:
        """Format the paper content for display"""
        paper = []
        paper.append("=== Final Paper ===\n")
        
        # If sections are empty, try to generate content from research data
        if not sections and "academic_papers" in self.context:
            paper.append("\n=== Introduction ===\n")
            paper.append("This paper explores the topic of AI delegation and orchestration based on recent research findings.\n")
            
            paper.append("\n=== Literature Review ===\n")
            for paper_data in self.context["academic_papers"]:
                paper.append(f"- {paper_data['title']} ({paper_data['year']})")
                paper.append(f"  Authors: {', '.join(paper_data['authors'])}")
                paper.append(f"  Abstract: {paper_data['abstract']}\n")
            
            paper.append("\n=== Key Findings ===\n")
            if "topic_analysis" in self.context:
                paper.append("Key concepts identified in the research:\n")
                for concept in self.context["topic_analysis"].get("key_concepts", []):
                    paper.append(f"- {concept}")
            
            paper.append("\n=== Conclusion ===\n")
            paper.append("The research indicates significant developments in AI delegation and orchestration, with implications for future AI systems.")
            
            return "\n".join(paper)
        
        # If we have formatted sections, use those
        for section, content in sections.items():
            paper.append(f"\n=== {section} ===\n")
            if isinstance(content, dict) and "formatted_content" in content:
                paper.append(content["formatted_content"])
            else:
                paper.append(str(content))
        
        return "\n".join(paper)
            
    def start_research(self):
        """Start the research phase"""
        paper_metadata = self.get_paper_metadata()
        self.context = {
            "title": paper_metadata.title,
            "authors": paper_metadata.authors,
            "keywords": paper_metadata.keywords
        }
        
        web_crawler = WebCrawlerAgent("WebCrawler")
        data_collector = DataCollectionAgent("DataCollector")
        
        asyncio.run(self.run_agent(web_crawler, "Research"))
        asyncio.run(self.run_agent(data_collector, "Data Collection"))
        
    def generate_content(self):
        """Start the content generation phase"""
        content_generator = ContentGenerationAgent("ContentGenerator")
        asyncio.run(self.run_agent(content_generator, "Content Generation"))
        
    def review(self):
        """Start the review phase"""
        quality_control = QualityControlAgent("QualityController")
        expert_review = ExpertReviewAgent("ExpertReviewer")
        
        asyncio.run(self.run_agent(quality_control, "Quality Control"))
        asyncio.run(self.run_agent(expert_review, "Expert Review"))
        
    def format(self):
        """Start the formatting phase"""
        formatter = FormattingAgent("Formatter")
        asyncio.run(self.run_agent(formatter, "Formatting"))
        
    def run(self):
        """Start the application"""
        self.root.mainloop() 