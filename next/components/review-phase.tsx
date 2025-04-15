import { Button } from "@/components/ui/button"
import { CheckCircle, Users, FileText } from "lucide-react"

export function ReviewPhase() {
  return (
    <div className="rounded-lg border bg-background p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-semibold">Quality Control Agent</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Grammar Check</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Plagiarism Detection</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Format Verification</span>
          </div>
        </div>
        <Button size="sm" className="w-full">
          Run Quality Check
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-semibold">Expert Review Agent</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Technical Accuracy</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Content Coherence</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Citation Validation</span>
          </div>
        </div>
        <Button size="sm" className="w-full">
          Start Expert Review
        </Button>
      </div>
    </div>
  )
} 