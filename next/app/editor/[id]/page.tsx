"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { BookOpen, ChevronLeft, Download, FileText, MessageSquare, Save, Share2, Users } from "lucide-react"

export default function EditorPage({ params }: { params: { id: string } }) {
  const [content, setContent] = useState(`# Introduction to Machine Learning Techniques

This paper explores the recent advancements in machine learning techniques and their applications in various domains. The rapid evolution of artificial intelligence has led to significant breakthroughs in how machines learn and adapt.

## Literature Review

Previous studies have demonstrated the effectiveness of deep learning models in image recognition tasks (Smith et al., 2020). However, there remains a gap in understanding how these models perform in resource-constrained environments.

## Methodology

Our research employs a mixed-methods approach combining quantitative analysis of model performance with qualitative assessment of implementation challenges. We collected data from three distinct sources:

1. Benchmark datasets for standard performance evaluation
2. Custom datasets designed to test edge cases
3. Survey responses from practitioners implementing these models in production environments

## Results

Initial findings suggest that while transformer-based models achieve superior accuracy on standard benchmarks, their computational requirements make them impractical for many real-world applications. Conversely, optimized convolutional neural networks offer a better balance between performance and resource utilization.

## Discussion

The implications of these findings are significant for both researchers and practitioners. Future work should focus on developing more efficient architectures that maintain high accuracy while reducing computational overhead.`)

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-2 font-bold">
              <BookOpen className="h-5 w-5" />
              <span>PaperCollab</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex -space-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">
                JD
              </div>
              <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-xs text-white">
                KL
              </div>
              <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-xs text-white">
                MR
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="container flex flex-1 gap-6 py-6">
        <div className="hidden w-64 flex-col md:flex">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Document</h2>
            <Button variant="ghost" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Structure
            </Button>
          </div>
          <nav className="mt-4 flex flex-col gap-1">
            {[
              "Introduction",
              "Literature Review",
              "Methodology",
              "Results",
              "Discussion",
              "Conclusion",
              "References",
            ].map((section) => (
              <Button key={section} variant="ghost" className="justify-start" size="sm">
                {section}
              </Button>
            ))}
          </nav>
          <div className="mt-auto">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Collaborators</h3>
                <Button variant="ghost" size="icon">
                  <Users className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">
                    JD
                  </div>
                  <span className="text-sm">John Doe (You)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center text-xs text-white">
                    KL
                  </div>
                  <span className="text-sm">Karen Lee</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center text-xs text-white">
                    MR
                  </div>
                  <span className="text-sm">Mike Roberts</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <Tabs defaultValue="write">
            <TabsList>
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
            <TabsContent value="write" className="mt-4">
              <Textarea
                className="min-h-[calc(100vh-200px)] font-mono text-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-4">
              <div className="prose max-w-none dark:prose-invert">
                <h1>Introduction to Machine Learning Techniques</h1>
                <p>
                  This paper explores the recent advancements in machine learning techniques and their applications in
                  various domains. The rapid evolution of artificial intelligence has led to significant breakthroughs
                  in how machines learn and adapt.
                </p>

                <h2>Literature Review</h2>
                <p>
                  Previous studies have demonstrated the effectiveness of deep learning models in image recognition
                  tasks (Smith et al., 2020). However, there remains a gap in understanding how these models perform in
                  resource-constrained environments.
                </p>

                <h2>Methodology</h2>
                <p>
                  Our research employs a mixed-methods approach combining quantitative analysis of model performance
                  with qualitative assessment of implementation challenges. We collected data from three distinct
                  sources:
                </p>
                <ol>
                  <li>Benchmark datasets for standard performance evaluation</li>
                  <li>Custom datasets designed to test edge cases</li>
                  <li>Survey responses from practitioners implementing these models in production environments</li>
                </ol>

                <h2>Results</h2>
                <p>
                  Initial findings suggest that while transformer-based models achieve superior accuracy on standard
                  benchmarks, their computational requirements make them impractical for many real-world applications.
                  Conversely, optimized convolutional neural networks offer a better balance between performance and
                  resource utilization.
                </p>

                <h2>Discussion</h2>
                <p>
                  The implications of these findings are significant for both researchers and practitioners. Future work
                  should focus on developing more efficient architectures that maintain high accuracy while reducing
                  computational overhead.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="comments" className="mt-4">
              <div className="space-y-4">
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-xs text-white">
                      KL
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Karen Lee</span>
                          <span className="ml-2 text-xs text-muted-foreground">2 hours ago</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Reply
                        </Button>
                      </div>
                      <p className="mt-1 text-sm">
                        In the methodology section, we should add more details about the specific models we tested. I
                        suggest including a table with model architectures and parameters.
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-xs text-white">
                      MR
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Mike Roberts</span>
                          <span className="ml-2 text-xs text-muted-foreground">Yesterday</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Reply
                        </Button>
                      </div>
                      <p className="mt-1 text-sm">
                        The literature review needs to include the recent paper by Johnson et al. (2023) on efficient
                        transformers. Their findings directly relate to our discussion on computational requirements.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">
                  JD
                </div>
                <div className="relative flex-1">
                  <Textarea placeholder="Add a comment..." className="pr-20" />
                  <Button className="absolute right-2 top-2" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Comment
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
