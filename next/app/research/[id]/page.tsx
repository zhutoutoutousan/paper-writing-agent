"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search, ArrowLeft, BookOpen, FileText, Users, Wand2, Save, Plus, Trash2, Bot } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { db, Paper, ResearchData } from "@/lib/indexeddb"
import { use } from "react"
import { AgentService, Agent } from '@/lib/agent-service'
import { SearchService } from '@/lib/search-service'
import AgentNetwork from "@/components/agent-network"

interface ResearchPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    [key: string]: string | string[] | undefined
  }>
}

export default function ResearchPage({ params, searchParams }: ResearchPageProps) {
  const router = useRouter()
  const [paper, setPaper] = useState<Paper | null>(null)
  const [researchData, setResearchData] = useState<ResearchData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedPapers, setSelectedPapers] = useState<any[]>([])
  const [isAddingPaper, setIsAddingPaper] = useState(false)
  const [newPaperUrl, setNewPaperUrl] = useState("")
  const [agents, setAgents] = useState<Agent[]>([])
  const [isManagingAgents, setIsManagingAgents] = useState(false)
  const [newAgentType, setNewAgentType] = useState<Agent['type']>('research')
  const [newAgentCapabilities, setNewAgentCapabilities] = useState<string[]>([])
  const [selectedArxivId, setSelectedArxivId] = useState('')
  const [searchQuery, setSearchQuery] = useState("")
  const [arxivResults, setArxivResults] = useState<any[]>([])
  const [isAgentRunning, setIsAgentRunning] = useState<Record<string, boolean>>({})

  const resolvedParams = use(params)
  const paperId = resolvedParams.id

  const agentService = AgentService.getInstance()
  const searchService = SearchService.getInstance()

  useEffect(() => {
    initializeAndLoadData()
  }, [paperId])

  useEffect(() => {
    if (paperId) {
      loadAgents()
    }
  }, [paperId])

  async function initializeAndLoadData() {
    try {
      console.log("[ResearchPage] Starting data load for paper ID:", paperId)
      setIsLoading(true)
      setError(null)
      
      // Wait for database to be ready
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const [paperData, researchData] = await Promise.all([
        db.getPaper(paperId),
        db.getResearchData(paperId)
      ])
      
      if (!paperData) {
        throw new Error("Paper not found")
      }
      
      setPaper(paperData)
      
      if (!researchData) {
        const newResearchData = await db.addResearchData({
          paperId,
          researchQuestions: [],
          targetDatabases: [],
          publicationDateRange: {
            start: new Date(),
            end: new Date()
          },
          sources: [],
          notes: "",
          updatedAt: new Date()
        })
        setResearchData(newResearchData)
      } else {
        setResearchData(researchData)
      }
    } catch (error) {
      console.error("[ResearchPage] Error loading data:", error)
      setError(error instanceof Error ? error.message : "Failed to load paper data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!paper || !researchData) return

    try {
      setIsLoading(true)
      await Promise.all([
        db.updatePaper(paper.id, paper),
        db.updateResearchData(paper.id, researchData)
      ])
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving data:", error)
      setError(error instanceof Error ? error.message : "Failed to save data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!paper || !researchData) return

    try {
      setIsGenerating(true)
      const response = await fetch("/api/generate-research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: paper.title,
          abstract: paper.abstract,
          keywords: paper.keywords
        }),
      })

      if (!response.ok) throw new Error("Generation failed")

      const generatedData = await response.json()
      
      setResearchData({
        ...researchData,
        researchQuestions: generatedData.researchQuestions,
        targetDatabases: generatedData.targetDatabases,
        publicationDateRange: generatedData.publicationDateRange
      })
    } catch (error) {
      console.error("Generation error:", error)
      setError(error instanceof Error ? error.message : "Failed to generate research data")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSearch = async () => {
    if (!researchData) return

    setIsSearching(true)
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          researchQuestions: researchData.researchQuestions,
          targetDatabases: researchData.targetDatabases,
          publicationDateRange: researchData.publicationDateRange
        }),
      })

      if (!response.ok) throw new Error("Search failed")

      const results = await response.json()
      setSearchResults(results)

      if (researchData.id) {
        await db.updateResearchData(paperId, {
          id: researchData.id,
          sources: results.map((result: any) => ({
            url: result.url,
            title: result.title,
            authors: result.authors,
            abstract: result.abstract,
            keywords: result.keywords,
            citation: result.citation
          }))
        })
      }

      await initializeAndLoadData()
    } catch (error) {
      console.error("Search error:", error)
      setError(error instanceof Error ? error.message : "Failed to update research data")
    } finally {
      setIsSearching(false)
    }
  }

  const handleProceedToWriting = async () => {
    try {
      await db.updatePaper(paperId, { phase: "writing" })
      router.push(`/writing/${paperId}`)
    } catch (error) {
      console.error("Error updating paper phase:", error)
    }
  }

  const handleAddPaper = async () => {
    if (!newPaperUrl) return

    try {
      // TODO: Implement paper metadata extraction from URL
      const newPaper = {
        url: newPaperUrl,
        title: "New Paper",
        authors: [],
        abstract: "",
        keywords: [],
        citation: ""
      }

      setSelectedPapers([...selectedPapers, newPaper])
      setNewPaperUrl("")
      setIsAddingPaper(false)
    } catch (error) {
      console.error("Error adding paper:", error)
      setError(error instanceof Error ? error.message : "Failed to add paper")
    }
  }

  const handleRemovePaper = (index: number) => {
    setSelectedPapers(selectedPapers.filter((_, i) => i !== index))
  }

  const handleAddToResearchPool = async () => {
    if (!researchData) return

    try {
      await db.updateResearchData(paperId, {
        ...researchData,
        sources: [...researchData.sources, ...selectedPapers]
      })
      setSelectedPapers([])
      await initializeAndLoadData()
    } catch (error) {
      console.error("Error adding papers to research pool:", error)
      setError(error instanceof Error ? error.message : "Failed to add papers to research pool")
    }
  }

  const loadAgents = async () => {
    try {
      const loadedAgents = await agentService.getAgents(paperId)
      setAgents(loadedAgents)
    } catch (error) {
      console.error('Error loading agents:', error)
      setError(error instanceof Error ? error.message : 'Failed to load agents')
    }
  }

  const handleCreateAgent = async () => {
    try {
      const newAgent = await agentService.createAgent(
        paperId,
        newAgentType,
        newAgentCapabilities
      )
      setAgents([...agents, newAgent])
      setNewAgentType('research')
      setNewAgentCapabilities([])
    } catch (error) {
      console.error('Error creating agent:', error)
      setError(error instanceof Error ? error.message : 'Failed to create agent')
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    try {
      await agentService.deleteAgent(agentId)
      setAgents(agents.filter(agent => agent.id !== agentId))
    } catch (error) {
      console.error('Error deleting agent:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete agent')
    }
  }

  const handleAddArxivPaper = async () => {
    if (!selectedArxivId) return

    try {
      const paper = await searchService.getArxivPaper(selectedArxivId)
      if (paper) {
        setSelectedPapers([...selectedPapers, paper])
        setSelectedArxivId('')
      }
    } catch (error) {
      console.error('Error adding Arxiv paper:', error)
      setError(error instanceof Error ? error.message : 'Failed to add Arxiv paper')
    }
  }

  const handleArxivSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const results = await searchService.searchArxiv(searchQuery, {
        start: new Date(0), // Search all time
        end: new Date()
      })
      setArxivResults(results)
    } catch (error) {
      console.error("Error searching Arxiv:", error)
      setError(error instanceof Error ? error.message : "Failed to search Arxiv")
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddToResearch = async (paper: any) => {
    if (!researchData) return

    try {
      const updatedSources = [...researchData.sources, {
        url: paper.pdfLink,
        title: paper.title,
        authors: paper.authors,
        abstract: paper.summary,
        keywords: [],
        citation: `arXiv:${paper.arxivId}`
      }]

      await db.updateResearchData(paperId, {
        ...researchData,
        sources: updatedSources
      })

      setResearchData({
        ...researchData,
        sources: updatedSources
      })
    } catch (error) {
      console.error("Error adding paper to research:", error)
      setError(error instanceof Error ? error.message : "Failed to add paper to research")
    }
  }

  const handleStartAgent = async (agentId: string) => {
    try {
      setIsAgentRunning(prev => ({ ...prev, [agentId]: true }))
      const context = {
        paperId,
        paper,
        researchData,
        searchResults,
        arxivResults
      }
      await agentService.startAgent(agentId, context)
      await loadAgents()
    } catch (error) {
      console.error('Error starting agent:', error)
      setError(error instanceof Error ? error.message : 'Failed to start agent')
    } finally {
      setIsAgentRunning(prev => ({ ...prev, [agentId]: false }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (!paper || !researchData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Paper not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{paper.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "default" : "outline"}
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
          {isEditing && (
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Paper Information */}
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">Paper Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
              {isEditing ? (
                <Input
                  value={paper.title}
                  onChange={(e) => setPaper({ ...paper, title: e.target.value })}
                />
              ) : (
                <p className="text-gray-300">{paper.title}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Abstract</label>
              {isEditing ? (
                <Textarea
                  value={paper.abstract}
                  onChange={(e) => setPaper({ ...paper, abstract: e.target.value })}
                  className="min-h-[100px]"
                />
              ) : (
                <p className="text-gray-300 whitespace-pre-wrap">{paper.abstract}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Keywords</label>
              {isEditing ? (
                <Input
                  value={paper.keywords.join(", ")}
                  onChange={(e) => setPaper({ ...paper, keywords: e.target.value.split(",").map(k => k.trim()) })}
                  placeholder="Comma-separated keywords"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {paper.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Research Data */}
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Research Data</h2>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="gap-2"
            >
              <Wand2 className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate with AI"}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Research Questions</label>
              {isEditing ? (
                <Textarea
                  value={researchData.researchQuestions.join("\n")}
                  onChange={(e) => setResearchData({
                    ...researchData,
                    researchQuestions: e.target.value.split("\n").filter(q => q.trim())
                  })}
                  className="min-h-[100px]"
                  placeholder="One question per line"
                />
              ) : (
                <div className="space-y-2">
                  {researchData.researchQuestions.map((question, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <p className="text-gray-300">{question}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Target Databases</label>
              {isEditing ? (
                <Input
                  value={researchData.targetDatabases.join(", ")}
                  onChange={(e) => setResearchData({
                    ...researchData,
                    targetDatabases: e.target.value.split(",").map(db => db.trim())
                  })}
                  placeholder="Comma-separated databases"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {researchData.targetDatabases.map((database, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300"
                    >
                      {database}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Publication Date Range</label>
              {isEditing ? (
                <div className="flex gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                    <Input
                      type="date"
                      value={new Date(researchData.publicationDateRange.start).toISOString().split('T')[0]}
                      onChange={(e) => setResearchData({
                        ...researchData,
                        publicationDateRange: {
                          ...researchData.publicationDateRange,
                          start: new Date(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">End Date</label>
                    <Input
                      type="date"
                      value={new Date(researchData.publicationDateRange.end).toISOString().split('T')[0]}
                      onChange={(e) => setResearchData({
                        ...researchData,
                        publicationDateRange: {
                          ...researchData.publicationDateRange,
                          end: new Date(e.target.value)
                        }
                      })}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-300">
                  {new Date(researchData.publicationDateRange.start).toLocaleDateString()} -{" "}
                  {new Date(researchData.publicationDateRange.end).toLocaleDateString()}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
              {isEditing ? (
                <Textarea
                  value={researchData.notes}
                  onChange={(e) => setResearchData({ ...researchData, notes: e.target.value })}
                  className="min-h-[100px]"
                  placeholder="Add research notes..."
                />
              ) : (
                <p className="text-gray-300 whitespace-pre-wrap">{researchData.notes || "No notes yet"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Agent Management */}
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Research Agents</h2>
            <Button
              onClick={() => setIsManagingAgents(!isManagingAgents)}
              variant={isManagingAgents ? "default" : "outline"}
              className="gap-2"
            >
              <Bot className="h-4 w-4" />
              {isManagingAgents ? "Done" : "Manage Agents"}
            </Button>
          </div>

          {isManagingAgents && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={newAgentType}
                  onChange={(e) => setNewAgentType(e.target.value as Agent['type'])}
                  className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white"
                >
                  <option value="research">Research Agent</option>
                  <option value="writing">Writing Agent</option>
                  <option value="review">Review Agent</option>
                </select>
                <Input
                  value={newAgentCapabilities.join(', ')}
                  onChange={(e) => setNewAgentCapabilities(e.target.value.split(',').map(c => c.trim()))}
                  placeholder="Capabilities (comma-separated)"
                  className="flex-1"
                />
                <Button onClick={handleCreateAgent} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Agent
                </Button>
              </div>
              
              <AgentNetwork
                paperId={paperId}
                agents={agents}
                onStartAgent={handleStartAgent}
                onDeleteAgent={handleDeleteAgent}
                isAgentRunning={isAgentRunning}
                onCreateAgent={handleCreateAgent}
              />
            </div>
          )}
        </div>

        {/* Arxiv Paper Selection */}
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Add Arxiv Paper</h2>
          </div>
          <div className="flex gap-2">
            <Input
              value={selectedArxivId}
              onChange={(e) => setSelectedArxivId(e.target.value)}
              placeholder="Enter Arxiv ID (e.g., 2107.12345)"
              className="flex-1"
            />
            <Button onClick={handleAddArxivPaper} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Paper
            </Button>
          </div>
        </div>

        {/* Selected Papers */}
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Selected Papers</h2>
            <Button
              onClick={() => setIsAddingPaper(!isAddingPaper)}
              variant={isAddingPaper ? "default" : "outline"}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {isAddingPaper ? "Cancel" : "Add Paper"}
            </Button>
          </div>

          {isAddingPaper && (
            <div className="mb-4 flex gap-2">
              <Input
                value={newPaperUrl}
                onChange={(e) => setNewPaperUrl(e.target.value)}
                placeholder="Enter paper URL"
                className="flex-1"
              />
              <Button onClick={handleAddPaper}>Add</Button>
            </div>
          )}

          {selectedPapers.length > 0 ? (
            <div className="space-y-4">
              {selectedPapers.map((paper, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800/50 p-4"
                >
                  <div>
                    <h3 className="font-medium text-white">{paper.title}</h3>
                    <p className="text-sm text-gray-400">{paper.authors.join(", ")}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePaper(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={handleAddToResearchPool}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Add to Research Pool
              </Button>
            </div>
          ) : (
            <p className="text-gray-400">No papers selected yet.</p>
          )}
        </div>

        {/* Search Results */}
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Search Results</h2>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {researchData.sources.length > 0 ? (
            <div className="space-y-4">
              {researchData.sources.map((source, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-800 bg-gray-800/50 p-4"
                >
                  <h3 className="font-medium text-white">{source.title}</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    {source.authors.join(", ")}
                  </p>
                  <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                    {source.abstract}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {source.keywords.map((keyword, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-gray-700 px-2 py-1 text-xs text-gray-300"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-sm text-blue-400 hover:text-blue-300"
                  >
                    View Source
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No sources found yet. Click Search to find relevant papers.</p>
          )}
        </div>

        {/* Arxiv Search Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Search Arxiv</h2>
          <div className="flex gap-2 mb-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Arxiv papers..."
              className="flex-1"
            />
            <Button onClick={handleArxivSearch} disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Arxiv Results */}
          {arxivResults.length > 0 && (
            <div className="space-y-4">
              {arxivResults.map((paper) => (
                <div key={paper.arxivId} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold">{paper.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {paper.authors.join(", ")}
                  </p>
                  <p className="text-sm mb-2 line-clamp-3">{paper.summary}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Published: {new Date(paper.published).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleAddToResearch(paper)}
                    >
                      Add to Research
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleProceedToWriting}
            className="gap-2"
            disabled={researchData.sources.length === 0}
          >
            Proceed to Writing
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 