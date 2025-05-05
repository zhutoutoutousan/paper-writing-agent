import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatDeepSeek } from "@langchain/deepseek";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { Agent } from "./agent-service";
import { SearchService } from "./search-service";

export class LangGraphResearchAgent {
  private static instance: LangGraphResearchAgent;
  private agent: any;
  private model: ChatDeepSeek;
  private searchService: SearchService;

  private constructor() {
    this.model = new ChatDeepSeek({
      model: "deepseek-chat",
      temperature: 0.7,
      maxTokens: 4000,
      apiKey: process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY
    });
    this.searchService = SearchService.getInstance();

    // Define research tools
    const searchArxivTool = tool(async ({ query }) => {
      const results = await this.searchService.searchArxiv(query, {
        start: new Date(0),
        end: new Date()
      });
      return JSON.stringify(results);
    }, {
      name: "search_arxiv",
      description: "Search for papers on arXiv",
      schema: z.object({
        query: z.string().describe("The search query for arXiv"),
      }),
    });

    const analyzePaperTool = tool(async ({ paper }) => {
      const prompt = `
        Analyze the following research paper:
        ${JSON.stringify(paper)}
        
        Return a JSON object with:
        - main_topics: list of main topics
        - subtopics: list of subtopics
        - key_concepts: list of key concepts
        - relevance_score: rating from 1-10
        - summary: brief summary
      `;
      
      const result = await this.model.invoke(prompt);
      return result.content;
    }, {
      name: "analyze_paper",
      description: "Analyze a research paper",
      schema: z.object({
        paper: z.object({
          title: z.string(),
          abstract: z.string(),
          authors: z.array(z.string()),
          url: z.string(),
        }),
      }),
    });

    const generateResearchQuestionsTool = tool(async ({ context }) => {
      const prompt = `
        Based on the following research context:
        ${JSON.stringify(context)}
        
        Generate a list of research questions that need to be answered.
        Return a JSON array of questions.
      `;
      
      const result = await this.model.invoke(prompt);
      return result.content;
    }, {
      name: "generate_research_questions",
      description: "Generate research questions based on context",
      schema: z.object({
        context: z.object({
          paper: z.object({
            title: z.string(),
            abstract: z.string(),
            keywords: z.array(z.string()),
          }),
          researchData: z.object({
            researchQuestions: z.array(z.string()),
            targetDatabases: z.array(z.string()),
          }),
        }),
      }),
    });

    // Create the agent
    this.agent = createReactAgent({
      llm: this.model,
      tools: [searchArxivTool, analyzePaperTool, generateResearchQuestionsTool],
    });
  }

  public static getInstance(): LangGraphResearchAgent {
    if (!LangGraphResearchAgent.instance) {
      LangGraphResearchAgent.instance = new LangGraphResearchAgent();
    }
    return LangGraphResearchAgent.instance;
  }

  async execute(agent: Agent, context: any) {
    try {
      const result = await this.agent.invoke({
        messages: [{
          role: "user",
          content: `
            Research task for paper: ${context.paperId}
            Paper title: ${context.paper?.title}
            Paper abstract: ${context.paper?.abstract}
            Current research questions: ${context.researchData?.researchQuestions?.join(', ')}
            Target databases: ${context.researchData?.targetDatabases?.join(', ')}
            
            Please help with the following tasks:
            1. Search for relevant papers on arXiv
            2. Analyze the found papers
            3. Generate additional research questions
            4. Update the research plan
          `
        }]
      });

      return {
        status: "completed",
        result: result
      };
    } catch (error) {
      console.error("Error executing LangGraph agent:", error);
      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
} 