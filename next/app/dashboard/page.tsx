"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, FileText, Plus, Search, Users } from "lucide-react"

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const recentPapers = [
    {
      id: "1",
      title: "Machine Learning Applications in Healthcare",
      lastEdited: "2 hours ago",
      collaborators: 3,
      status: "In progress",
    },
    {
      id: "2",
      title: "Quantum Computing: Recent Advances",
      lastEdited: "Yesterday",
      collaborators: 2,
      status: "Review",
    },
    {
      id: "3",
      title: "Climate Change Impact on Biodiversity",
      lastEdited: "3 days ago",
      collaborators: 4,
      status: "Draft",
    },
  ]

  const filteredPapers = recentPapers.filter((paper) => paper.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <BookOpen className="h-5 w-5" />
            <span>PaperCollab</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search papers..."
                className="w-full bg-background pl-8 md:w-[300px] lg:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="sm" variant="ghost">
              <Users className="mr-2 h-4 w-4" />
              Team
            </Button>
            <Button size="sm" variant="ghost">
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </Button>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground">
              JD
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 py-6">
        <div className="container">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Paper
            </Button>
          </div>
          <Tabs defaultValue="recent" className="mt-6">
            <TabsList>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="shared">Shared with me</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
            </TabsList>
            <TabsContent value="recent" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPapers.map((paper) => (
                  <Link href={`/editor/${paper.id}`} key={paper.id}>
                    <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">{paper.title}</CardTitle>
                        <div className="rounded-full px-2 py-1 text-xs bg-primary/10 text-primary">{paper.status}</div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            Last edited {paper.lastEdited}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {Array.from({ length: paper.collaborators }).map((_, i) => (
                              <div
                                key={i}
                                className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground"
                                style={{
                                  backgroundColor: ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316"][i % 4],
                                }}
                              >
                                {["JD", "KL", "MR", "TS"][i % 4]}
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{paper.collaborators} collaborators</span>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
                <Card className="h-full cursor-pointer border-dashed transition-colors hover:bg-muted/50">
                  <CardHeader className="flex h-full flex-col items-center justify-center space-y-4 py-8">
                    <div className="rounded-full bg-muted p-3">
                      <Plus className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg font-medium">Create new paper</CardTitle>
                    <CardDescription>Start a new research paper from scratch or from a template</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="shared" className="mt-6">
              <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
                <div className="flex flex-col items-center gap-1 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <h3 className="font-medium">No shared papers</h3>
                  <p className="text-sm text-muted-foreground">Papers shared with you will appear here</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="drafts" className="mt-6">
              <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
                <div className="flex flex-col items-center gap-1 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <h3 className="font-medium">No drafts</h3>
                  <p className="text-sm text-muted-foreground">Your draft papers will appear here</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="published" className="mt-6">
              <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
                <div className="flex flex-col items-center gap-1 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <h3 className="font-medium">No published papers</h3>
                  <p className="text-sm text-muted-foreground">Your published papers will appear here</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
