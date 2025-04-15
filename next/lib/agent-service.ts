import { db } from './indexeddb'

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

  private constructor() {}

  public static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService()
    }
    return AgentService.instance
  }

  async createAgent(
    paperId: string,
    type: Agent['type'],
    capabilities: string[]
  ): Promise<Agent> {
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
    return await db.getAgents(paperId)
  }

  async updateAgent(agentId: string, updates: Partial<Agent>): Promise<void> {
    await db.updateAgent(agentId, updates)
  }

  async deleteAgent(agentId: string): Promise<void> {
    await db.deleteAgent(agentId)
  }

  async startAgent(agentId: string): Promise<void> {
    await this.updateAgent(agentId, { status: 'running' })
  }

  async stopAgent(agentId: string): Promise<void> {
    await this.updateAgent(agentId, { status: 'idle' })
  }
} 