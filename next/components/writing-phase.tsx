import { Button } from "@/components/ui/button"
import { PenTool, Users, FileText } from "lucide-react"

export function WritingPhase() {
  return (
    <div className="rounded-lg border bg-background p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <PenTool className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-semibold">Content Generation Agent</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Outline Creation</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Section Writing</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Citation Integration</span>
          </div>
        </div>
        <Button size="sm" className="w-full">
          Generate Content
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-semibold">Collaborative Platform</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Version Control</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Real-time Editing</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Author Feedback</span>
          </div>
        </div>
        <Button size="sm" className="w-full">
          Start Collaboration
        </Button>
      </div>
    </div>
  )
} 