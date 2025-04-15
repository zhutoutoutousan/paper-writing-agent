import { Button } from "@/components/ui/button"
import { Search, Database, FileText } from "lucide-react"

export function ResearchPhase() {
  return (
    <div className="rounded-lg border bg-background p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-semibold">Web Crawler Agent</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Academic Databases</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Research Papers</span>
          </div>
        </div>
        <Button size="sm" className="w-full">
          Start Research
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-semibold">Data Collection Agent</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Topic Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Literature Review</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Citation Management</span>
          </div>
        </div>
        <Button size="sm" className="w-full">
          Collect Data
        </Button>
      </div>
    </div>
  )
} 