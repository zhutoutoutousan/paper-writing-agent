import { Brain, Network, Settings } from "lucide-react"

export function AgentNetwork() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Agent Network</span>
        </div>
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Configure</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Research Phase Agents */}
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-semibold">Research Phase</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span>Web Crawler Agent</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span>Data Collection Agent</span>
              </div>
            </div>
          </div>

          {/* Writing Phase Agents */}
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-semibold">Writing Phase</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span>Content Generation Agent</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span>Collaborative Platform</span>
              </div>
            </div>
          </div>

          {/* Review Phase Agents */}
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-semibold">Review Phase</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span>Quality Control Agent</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span>Expert Review Agent</span>
              </div>
            </div>
          </div>

          {/* Finalization Phase Agents */}
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-semibold">Finalization Phase</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span>Formatting Agent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 