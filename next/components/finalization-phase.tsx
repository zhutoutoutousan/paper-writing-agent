import { Button } from "@/components/ui/button"
import { FileText, CheckCircle } from "lucide-react"

export function FinalizationPhase() {
  return (
    <div className="rounded-lg border bg-background p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-semibold">Formatting Agent</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Style Guide Compliance</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Reference Formatting</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Document Structure</span>
          </div>
        </div>
        <Button size="sm" className="w-full">
          Format Paper
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-semibold">Export Options</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">PDF</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Word</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">LaTeX</span>
          </div>
        </div>
        <Button size="sm" className="w-full">
          Export Paper
        </Button>
      </div>
    </div>
  )
} 