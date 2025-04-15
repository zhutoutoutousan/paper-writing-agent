import { ArrowRight } from "lucide-react"

export function PaperFlow() {
  return (
    <div className="rounded-lg border bg-background p-6 shadow-sm">
      <div className="space-y-6">
        {/* Research Phase */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
            1
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">Research Phase</h3>
            <p className="text-muted-foreground">
              Web crawler and data collection agents gather and organize research materials.
            </p>
          </div>
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
        </div>

        {/* Writing Phase */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
            2
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">Writing Phase</h3>
            <p className="text-muted-foreground">
              Content generation agents create the paper structure and content.
            </p>
          </div>
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
        </div>

        {/* Review Phase */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
            3
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">Review Phase</h3>
            <p className="text-muted-foreground">
              Quality control and expert review agents ensure technical accuracy and content coherence.
            </p>
          </div>
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
        </div>

        {/* Finalization Phase */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
            4
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">Finalization Phase</h3>
            <p className="text-muted-foreground">
              Formatting agents ensure compliance with style guides and prepare for submission.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 