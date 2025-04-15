const DB_NAME = 'PaperAgentDB'
const DB_VERSION = 1

const STORES = {
  PAPERS: 'papers',
  RESEARCH: 'research',
  WRITING: 'writing',
  REVIEW: 'review',
  FINALIZATION: 'finalization',
  SETTINGS: 'settings',
  AGENTS: 'agents',
  TASKS: 'tasks'
}

export interface Paper {
  id: string
  title: string
  authors: string[]
  abstract: string
  keywords: string[]
  createdAt: Date
  updatedAt: Date
  content: string
  status: 'draft' | 'in_progress' | 'completed'
  phase: 'research' | 'writing' | 'review' | 'finalization'
  researchId?: string
  writingId?: string
  reviewId?: string
  finalizationId?: string
}

export interface ResearchData {
  id: string
  paperId: string
  researchQuestions: string[]
  targetDatabases: string[]
  publicationDateRange: {
    start: Date
    end: Date
  }
  sources: {
    url: string
    title: string
    authors: string[]
    abstract: string
    keywords: string[]
    citation: string
  }[]
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface WritingData {
  id: string
  paperId: string
  outline: {
    sections: {
      title: string
      content: string
      order: number
    }[]
  }
  drafts: {
    version: number
    content: string
    createdAt: Date
    updatedAt: Date
  }[]
  citations: {
    id: string
    text: string
    sourceId: string
    location: {
      section: string
      paragraph: number
    }
  }[]
  createdAt: Date
  updatedAt: Date
}

export interface ReviewData {
  id: string
  paperId: string
  grammarChecks: {
    id: string
    text: string
    suggestions: string[]
    status: 'pending' | 'accepted' | 'rejected'
  }[]
  plagiarismChecks: {
    id: string
    text: string
    matches: {
      source: string
      similarity: number
    }[]
    status: 'pending' | 'accepted' | 'rejected'
  }[]
  expertReviews: {
    id: string
    reviewer: string
    comments: string[]
    status: 'pending' | 'accepted' | 'rejected'
  }[]
  createdAt: Date
  updatedAt: Date
}

export interface FinalizationData {
  id: string
  paperId: string
  styleGuide: string
  formatting: {
    sections: {
      title: string
      content: string
      format: string
    }[]
  }
  references: {
    id: string
    citation: string
    format: string
  }[]
  exportFormats: {
    format: 'pdf' | 'word' | 'latex'
    content: string
    createdAt: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

export interface Agent {
  id: string
  name: string
  type: 'web_crawler' | 'data_collection' | 'content_generation' | 'quality_control' | 'expert_review' | 'formatting'
  status: 'idle' | 'busy' | 'error'
  lastActive: Date
  settings: Record<string, any>
}

export interface Task {
  id: string
  agentId: string
  paperId: string
  type: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  input: Record<string, any>
  output?: Record<string, any>
  error?: string
  createdAt: Date
  updatedAt: Date
}

export interface DBSettings {
  autoBackup: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  syncEnabled: boolean
  storageLimit: number
  agentSettings: Record<string, any>
}

export class IndexedDBService {
  private db: IDBDatabase | null = null

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.PAPERS)) {
          const papersStore = db.createObjectStore(STORES.PAPERS, { keyPath: 'id' })
          papersStore.createIndex('title', 'title', { unique: false })
          papersStore.createIndex('status', 'status', { unique: false })
          papersStore.createIndex('phase', 'phase', { unique: false })
        }

        if (!db.objectStoreNames.contains(STORES.RESEARCH)) {
          const researchStore = db.createObjectStore(STORES.RESEARCH, { keyPath: 'id' })
          researchStore.createIndex('paperId', 'paperId', { unique: true })
        }

        if (!db.objectStoreNames.contains(STORES.WRITING)) {
          const writingStore = db.createObjectStore(STORES.WRITING, { keyPath: 'id' })
          writingStore.createIndex('paperId', 'paperId', { unique: true })
        }

        if (!db.objectStoreNames.contains(STORES.REVIEW)) {
          const reviewStore = db.createObjectStore(STORES.REVIEW, { keyPath: 'id' })
          reviewStore.createIndex('paperId', 'paperId', { unique: true })
        }

        if (!db.objectStoreNames.contains(STORES.FINALIZATION)) {
          const finalizationStore = db.createObjectStore(STORES.FINALIZATION, { keyPath: 'id' })
          finalizationStore.createIndex('paperId', 'paperId', { unique: true })
        }

        if (!db.objectStoreNames.contains(STORES.AGENTS)) {
          const agentsStore = db.createObjectStore(STORES.AGENTS, { keyPath: 'id' })
          agentsStore.createIndex('type', 'type', { unique: false })
          agentsStore.createIndex('status', 'status', { unique: false })
        }

        if (!db.objectStoreNames.contains(STORES.TASKS)) {
          const tasksStore = db.createObjectStore(STORES.TASKS, { keyPath: 'id' })
          tasksStore.createIndex('agentId', 'agentId', { unique: false })
          tasksStore.createIndex('paperId', 'paperId', { unique: false })
          tasksStore.createIndex('status', 'status', { unique: false })
        }

        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' })
        }
      }
    })
  }

  // Paper operations
  async addPaper(paper: Omit<Paper, 'id' | 'createdAt' | 'updatedAt'>) {
    const newPaper: Paper = {
      ...paper,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await this.add(STORES.PAPERS, newPaper)
    return newPaper
  }

  async getPapers() {
    return this.getAll<Paper>(STORES.PAPERS)
  }

  async getPaper(id: string): Promise<Paper | undefined> {
    console.log("[IndexedDB] Getting paper with ID:", id)
    const db = await this.getDB()
    const tx = db.transaction(STORES.PAPERS, "readonly")
    const store = tx.objectStore(STORES.PAPERS)
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => {
        console.log("[IndexedDB] Paper request result:", request.result)
        resolve(request.result)
      }
      request.onerror = () => {
        console.error("[IndexedDB] Error getting paper:", request.error)
        reject(request.error)
      }
    })
  }

  async updatePaper(id: string, data: Partial<Paper>): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(STORES.PAPERS, "readwrite")
    const store = tx.objectStore(STORES.PAPERS)
    const paper = await store.get(id)
    if (!paper) throw new Error("Paper not found")
    await store.put({ ...paper, ...data, updatedAt: new Date() })
  }

  // Research operations
  async addResearchData(data: Omit<ResearchData, 'id' | 'createdAt'>) {
    const newData: ResearchData = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date()
    }

    await this.add(STORES.RESEARCH, newData)
    return newData
  }

  async getResearchData(paperId: string) {
    console.log("[IndexedDB] Getting research data for paper ID:", paperId)
    const db = await this.getDB()
    const tx = db.transaction(STORES.RESEARCH, "readonly")
    const store = tx.objectStore(STORES.RESEARCH)
    const index = store.index('paperId')
    return new Promise<ResearchData | undefined>((resolve, reject) => {
      const request = index.get(paperId)
      request.onsuccess = () => {
        console.log("[IndexedDB] Research data request result:", request.result)
        resolve(request.result)
      }
      request.onerror = () => {
        console.error("[IndexedDB] Error getting research data:", request.error)
        reject(request.error)
      }
    })
  }

  async getAllResearchData() {
    return this.getAll<ResearchData>(STORES.RESEARCH)
  }

  async updateResearchData(paperId: string, data: Partial<ResearchData>): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(STORES.RESEARCH, "readwrite")
    const store = tx.objectStore(STORES.RESEARCH)
    const researchData = await store.get(paperId)
    if (!researchData) throw new Error("Research data not found")
    await store.put({ ...researchData, ...data, updatedAt: new Date() })
  }

  // Writing operations
  async addWritingData(data: Omit<WritingData, 'id' | 'createdAt'>) {
    const newData: WritingData = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date()
    }

    return this.add(STORES.WRITING, newData)
  }

  async getWritingData(paperId: string) {
    return this.getAll<WritingData>(STORES.WRITING, 'paperId', paperId)
  }

  // Review operations
  async addReviewData(data: Omit<ReviewData, 'id' | 'createdAt'>) {
    const newData: ReviewData = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date()
    }

    return this.add(STORES.REVIEW, newData)
  }

  async getReviewData(paperId: string) {
    return this.getAll<ReviewData>(STORES.REVIEW, 'paperId', paperId)
  }

  // Finalization operations
  async addFinalizationData(data: Omit<FinalizationData, 'id' | 'createdAt'>) {
    const newData: FinalizationData = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date()
    }

    return this.add(STORES.FINALIZATION, newData)
  }

  async getFinalizationData(paperId: string) {
    return this.getAll<FinalizationData>(STORES.FINALIZATION, 'paperId', paperId)
  }

  // Settings operations
  async getSettings() {
    const settings = await this.get<DBSettings>(STORES.SETTINGS, 'default')
    if (!settings) {
      const defaultSettings: DBSettings = {
        autoBackup: false,
        backupFrequency: 'weekly',
        syncEnabled: false,
        storageLimit: 10 * 1024 * 1024, // 10MB
        agentSettings: {
          researchAgent: { enabled: true, model: "gpt-4" },
          writingAgent: { enabled: true, model: "gpt-4" },
          reviewAgent: { enabled: true, model: "gpt-4" },
          finalizationAgent: { enabled: true, model: "gpt-4" }
        }
      }
      await this.add(STORES.SETTINGS, { id: 'default', ...defaultSettings })
      return defaultSettings
    }
    return settings
  }

  async updateSettings(settings: Partial<DBSettings>) {
    const currentSettings = await this.getSettings()
    return this.update(STORES.SETTINGS, {
      id: 'default',
      ...currentSettings,
      ...settings
    })
  }

  // Generic operations
  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    const db = await this.getDB()
    const tx = db.transaction(storeName, "readonly")
    const store = tx.objectStore(storeName)
    return store.get(id)
  }

  async update(storeName: string, data: any): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(storeName, "readwrite")
    const store = tx.objectStore(storeName)
    await store.put(data)
  }

  async add(storeName: string, data: any): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(storeName, "readwrite")
    const store = tx.objectStore(storeName)
    return new Promise((resolve, reject) => {
      const request = store.add(data)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async delete(storeName: string, id: string): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(storeName, "readwrite")
    const store = tx.objectStore(storeName)
    await store.delete(id)
  }

  async getAll<T>(
    storeName: string,
    indexName?: string,
    value?: any
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = indexName && value
        ? store.index(indexName).getAll(value)
        : store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async addAgent(agent: any): Promise<void> {
    await this.add('agents', agent)
  }

  async getAgents(): Promise<any[]> {
    return await this.getAll('agents')
  }

  async updateAgent(id: string, agent: any): Promise<void> {
    await this.update('agents', { ...agent, id })
  }

  async deleteAgent(id: string): Promise<void> {
    await this.delete('agents', id)
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }
    return this.db
  }
}

export const db = new IndexedDBService() 