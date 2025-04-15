import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Brain, Network, Settings, Users, FileText, FolderOpen } from "lucide-react"
import { AgentNetwork } from "@/components/agent-network"
import { PaperFlow } from "@/components/paper-flow"
import { ResearchPhase } from "@/components/research-phase"
import { WritingPhase } from "@/components/writing-phase"
import { ReviewPhase } from "@/components/review-phase"
import { FinalizationPhase } from "@/components/finalization-phase"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 to-black text-white">
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold">
            <BookOpen className="h-5 w-5 text-blue-400" />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">PaperAgent</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link
              href="#agent-network"
              className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              Agent Network
            </Link>
            <Link
              href="#paper-flow"
              className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              Paper Flow
            </Link>
            <Link
              href="#settings"
              className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              Settings
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent animate-pulse" />
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-gradient">
                    AI-Powered Paper Writing Assistant
                  </h1>
                  <p className="max-w-[600px] text-gray-400 md:text-xl">
                    Write research papers with the help of specialized AI agents. Our platform uses a network of agents to assist with research, writing, review, and formatting.
                  </p>
                </div>
                <div className="mt-8 flex flex-col gap-4">
                  <Link href="/new-paper">
                    <Button className="w-full gap-2">
                      <FileText className="h-4 w-4" />
                      Start New Paper
                    </Button>
                  </Link>
                  <Link href="/load-paper">
                    <Button variant="outline" className="w-full gap-2">
                      <FolderOpen className="h-4 w-4" />
                      Load Existing Paper
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 p-4 shadow-xl sm:h-[400px] lg:h-[500px] backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse" />
                  <AgentNetwork />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="paper-flow" className="w-full py-12 md:py-24 lg:py-32 bg-gray-900/50 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent animate-pulse" />
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                  Paper Writing Process
                </h2>
                <p className="max-w-[900px] text-gray-400 md:text-xl">
                  Our platform follows a structured approach to paper writing, with specialized agents for each phase.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12">
              <PaperFlow />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent animate-pulse" />
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col space-y-4">
                <h2 className="text-2xl font-bold text-white">Research Phase</h2>
                <ResearchPhase />
              </div>
              <div className="flex flex-col space-y-4">
                <h2 className="text-2xl font-bold text-white">Writing Phase</h2>
                <WritingPhase />
              </div>
              <div className="flex flex-col space-y-4">
                <h2 className="text-2xl font-bold text-white">Review Phase</h2>
                <ReviewPhase />
              </div>
              <div className="flex flex-col space-y-4">
                <h2 className="text-2xl font-bold text-white">Finalization Phase</h2>
                <FinalizationPhase />
              </div>
            </div>
          </div>
        </section>

        <section id="settings" className="w-full py-12 md:py-24 lg:py-32 bg-gray-900/50 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent animate-pulse" />
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                  Agent Network Settings
                </h2>
                <p className="max-w-[900px] text-gray-400 md:text-xl">
                  Configure your agent network and manage local storage.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12">
              <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 shadow-sm backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white">Local Storage</h3>
                <p className="text-gray-400">
                  All your work is stored locally using IndexedDB. No login required.
                </p>
                <div className="mt-4 flex gap-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure Storage
                  </Button>
                  <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105">
                    <Network className="mr-2 h-4 w-4" />
                    Manage Agents
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t border-gray-800 bg-gray-900">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex items-center gap-2 font-bold">
            <BookOpen className="h-5 w-5 text-blue-400" />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">PaperAgent</span>
          </div>
          <p className="text-center text-sm text-gray-400 md:text-left">
            &copy; {new Date().getFullYear()} PaperAgent. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
