"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, FileText, Calendar, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { db, Paper } from "@/lib/indexeddb"

export default function LoadPaperPage() {
  const router = useRouter()
  const [papers, setPapers] = useState<Paper[]>([])
  const [filteredPapers, setFilteredPapers] = useState<Paper[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPapers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPapers(papers)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredPapers(
        papers.filter(
          (paper) =>
            paper.title.toLowerCase().includes(query) ||
            paper.authors.some((author) =>
              author.toLowerCase().includes(query)
            ) ||
            paper.keywords.some((keyword) =>
              keyword.toLowerCase().includes(query)
            )
        )
      )
    }
  }, [searchQuery, papers])

  async function loadPapers() {
    try {
      setIsLoading(true)
      setError(null)
      await db.init()
      const papers = await db.getPapers()
      setPapers(papers)
      setFilteredPapers(papers)
    } catch (error) {
      console.error("Error loading papers:", error)
      setError(error instanceof Error ? error.message : "Failed to load papers")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaperClick = (paper: Paper) => {
    // Navigate to the appropriate phase page based on the paper's current phase
    const phasePath = paper.phase.toLowerCase()
    router.push(`/${phasePath}/${paper.id}`)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadPapers}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Load Existing Paper</h1>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search papers by title, author, or keywords..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredPapers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No papers found</p>
          </div>
        ) : (
          filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="rounded-lg border border-gray-800 bg-gray-900 p-6 hover:bg-gray-800/50 cursor-pointer transition-colors"
              onClick={() => handlePaperClick(paper)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{paper.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{paper.authors.join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(paper.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span className="capitalize">{paper.phase}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 line-clamp-2">{paper.abstract}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {paper.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 