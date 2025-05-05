import { db } from './indexeddb'
import { LangGraphResearchAgent } from './langgraph-research-agent'

export interface Agent {
  id: string
  name: string
  type: 'research' | 'writing' | 'review'
  paperId: string
  status: 'idle' | 'running' | 'completed' | 'error'
  capabilities: string[]
  settings: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export class AgentService {
  private static instance: AgentService
  private langGraphAgent: LangGraphResearchAgent
  private initialized: boolean = false

  private constructor() {
    this.langGraphAgent = LangGraphResearchAgent.getInstance()
  }

  public static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService()
    }
    return AgentService.instance
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await db.init()
      this.initialized = true
    }
  }

  async createAgent(
    paperId: string,
    type: Agent['type'],
    capabilities: string[]
  ): Promise<Agent> {
    await this.ensureInitialized()
    
    const agent: Agent = {
      id: crypto.randomUUID(),
      name: `${type} Agent ${new Date().toISOString().slice(0, 10)}`,
      type,
      paperId,
      status: 'idle',
      capabilities,
      settings: {},
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.addAgent(agent)
    return agent
  }

  async getAgents(paperId: string): Promise<Agent[]> {
    await this.ensureInitialized()
    const allAgents = await db.getAgents()
    return allAgents.filter(agent => agent.paperId === paperId)
  }

  async updateAgent(agentId: string, updates: Partial<Agent>): Promise<void> {
    await this.ensureInitialized()
    const agent = await db.getAgent(agentId)
    if (!agent) throw new Error("Agent not found")
    
    const updatedAgent: Agent = {
      ...agent,
      ...updates,
      updatedAt: new Date()
    }
    await db.updateAgent(agentId, updatedAgent)
  }

  async deleteAgent(agentId: string): Promise<void> {
    await this.ensureInitialized()
    await db.deleteAgent(agentId)
  }

  async startAgent(agentId: string, context: any): Promise<void> {
    await this.ensureInitialized()
    
    const agent = await db.getAgent(agentId)
    if (!agent) throw new Error("Agent not found")

    await this.updateAgent(agentId, { status: 'running' })

    if (agent.type === 'research') {
      const result = await this.langGraphAgent.execute(agent, context)
      await this.updateAgent(agentId, {
        status: result.status as 'idle' | 'running' | 'completed' | 'error',
        settings: {
          ...agent.settings,
          lastResult: result
        }
      })
    }
  }

  async stopAgent(agentId: string): Promise<void> {
    await this.ensureInitialized()
    await this.updateAgent(agentId, { status: 'idle' })
  }
} 