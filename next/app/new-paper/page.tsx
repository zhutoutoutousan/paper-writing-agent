"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Wand2, Search, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { db } from "@/lib/indexeddb"

export default function NewPaperPage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    authors: "",
    abstract: "",
    keywords: "",
    researchQuestions: "",
    targetDatabases: "",
    targetJournal: "",
    styleGuide: "",
    targetWordCount: ""
  })

  const handleGenerateWithAI = async (field: string) => {
    setIsGenerating(field)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          field,
          context: formData,
        }),
      })

      if (!response.ok) throw new Error("Generation failed")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      let generatedText = ""
      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6) // Remove 'data: ' prefix
            if (data === '[DONE]') break
            
            try {
              const parsed = JSON.parse(data)
              if (parsed.choices?.[0]?.delta?.content) {
                generatedText += parsed.choices[0].delta.content
                setFormData(prev => ({ ...prev, [field]: generatedText }))
              }
            } catch (e) {
              console.error('Error parsing chunk:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error("Generation error:", error)
    } finally {
      setIsGenerating(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const paper = await db.addPaper({
        title: formData.title,
        authors: formData.authors.split(",").map(a => a.trim()),
        abstract: formData.abstract,
        keywords: formData.keywords.split(",").map(k => k.trim()),
        content: "",
        status: "draft",
        phase: "research"
      })

      const researchData = await db.addResearchData({
        paperId: paper.id,
        researchQuestions: formData.researchQuestions.split("\n").filter(q => q.trim()),
        targetDatabases: formData.targetDatabases.split(",").map(db => db.trim()),
        publicationDateRange: {
          start: new Date(),
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        },
        sources: [],
        notes: ""
      })

      router.push(`/research/${paper.id}`)
    } catch (error) {
      console.error("Error saving paper:", error)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Start New Paper</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">Paper Metadata</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Paper Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleGenerateWithAI("title")}
                disabled={isGenerating === "title"}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isGenerating === "title" ? "Generating..." : "Generate"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Authors (comma-separated)"
                value={formData.authors}
                onChange={(e) => setFormData(prev => ({ ...prev, authors: e.target.value }))}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleGenerateWithAI("authors")}
                disabled={isGenerating === "authors"}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isGenerating === "authors" ? "Generating..." : "Generate"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Textarea
                placeholder="Abstract"
                value={formData.abstract}
                onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
                className="flex-1"
                rows={4}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleGenerateWithAI("abstract")}
                disabled={isGenerating === "abstract"}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isGenerating === "abstract" ? "Generating..." : "Generate"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Keywords (comma-separated)"
                value={formData.keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleGenerateWithAI("keywords")}
                disabled={isGenerating === "keywords"}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isGenerating === "keywords" ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">Research Parameters</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Research Questions (one per line)"
                value={formData.researchQuestions}
                onChange={(e) => setFormData(prev => ({ ...prev, researchQuestions: e.target.value }))}
                className="flex-1"
                rows={4}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleGenerateWithAI("researchQuestions")}
                disabled={isGenerating === "researchQuestions"}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isGenerating === "researchQuestions" ? "Generating..." : "Generate"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Target Databases (comma-separated)"
                value={formData.targetDatabases}
                onChange={(e) => setFormData(prev => ({ ...prev, targetDatabases: e.target.value }))}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleGenerateWithAI("targetDatabases")}
                disabled={isGenerating === "targetDatabases"}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isGenerating === "targetDatabases" ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">Writing Preferences</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Target Journal/Conference"
                value={formData.targetJournal}
                onChange={(e) => setFormData(prev => ({ ...prev, targetJournal: e.target.value }))}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleGenerateWithAI("targetJournal")}
                disabled={isGenerating === "targetJournal"}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isGenerating === "targetJournal" ? "Generating..." : "Generate"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Style Guide"
                value={formData.styleGuide}
                onChange={(e) => setFormData(prev => ({ ...prev, styleGuide: e.target.value }))}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleGenerateWithAI("styleGuide")}
                disabled={isGenerating === "styleGuide"}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isGenerating === "styleGuide" ? "Generating..." : "Generate"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Target Word Count"
                value={formData.targetWordCount}
                onChange={(e) => setFormData(prev => ({ ...prev, targetWordCount: e.target.value }))}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleGenerateWithAI("targetWordCount")}
                disabled={isGenerating === "targetWordCount"}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isGenerating === "targetWordCount" ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="gap-2">
            <Search className="h-4 w-4" />
            Start Research
          </Button>
        </div>
      </form>
    </div>
  )
} 