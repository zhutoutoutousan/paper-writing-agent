import React from 'react'
import { Database, FileText, Users, CheckCircle, PenTool, Settings } from 'lucide-react'

interface TableNode {
  name: string
  icon: React.ReactNode
  fields: string[]
  relationships: {
    to: string
    type: 'one-to-one' | 'one-to-many' | 'many-to-many'
  }[]
}

const schema: TableNode[] = [
  {
    name: 'PAPERS',
    icon: <FileText className="w-5 h-5" />,
    fields: ['id', 'title', 'authors', 'abstract', 'keywords', 'phase', 'researchId', 'writingId', 'reviewId', 'finalizationId'],
    relationships: [
      { to: 'RESEARCH', type: 'one-to-one' },
      { to: 'WRITING', type: 'one-to-one' },
      { to: 'REVIEW', type: 'one-to-one' },
      { to: 'FINALIZATION', type: 'one-to-one' }
    ]
  },
  {
    name: 'RESEARCH',
    icon: <Database className="w-5 h-5" />,
    fields: ['id', 'paperId', 'researchQuestions', 'targetDatabases', 'publicationDateRange', 'searchResults', 'analysisResults'],
    relationships: [
      { to: 'PAPERS', type: 'one-to-one' }
    ]
  },
  {
    name: 'WRITING',
    icon: <PenTool className="w-5 h-5" />,
    fields: ['id', 'paperId', 'outline', 'sections', 'citations', 'drafts'],
    relationships: [
      { to: 'PAPERS', type: 'one-to-one' }
    ]
  },
  {
    name: 'REVIEW',
    icon: <CheckCircle className="w-5 h-5" />,
    fields: ['id', 'paperId', 'grammarCheck', 'plagiarismCheck', 'formatCheck', 'expertReview'],
    relationships: [
      { to: 'PAPERS', type: 'one-to-one' }
    ]
  },
  {
    name: 'FINALIZATION',
    icon: <FileText className="w-5 h-5" />,
    fields: ['id', 'paperId', 'formatting', 'exportOptions', 'finalVersion'],
    relationships: [
      { to: 'PAPERS', type: 'one-to-one' }
    ]
  },
  {
    name: 'AGENTS',
    icon: <Users className="w-5 h-5" />,
    fields: ['id', 'type', 'status', 'lastActive', 'performance'],
    relationships: []
  },
  {
    name: 'TASKS',
    icon: <Settings className="w-5 h-5" />,
    fields: ['id', 'paperId', 'agentId', 'type', 'status', 'result'],
    relationships: [
      { to: 'PAPERS', type: 'many-to-many' },
      { to: 'AGENTS', type: 'many-to-many' }
    ]
  }
]

export function DatabaseSchema() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Database Schema</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schema.map((table) => (
          <div
            key={table.name}
            className="scholarly-card p-4 space-y-4"
          >
            <div className="flex items-center gap-2">
              {table.icon}
              <h3 className="text-lg font-semibold">{table.name}</h3>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400">Fields</h4>
              <ul className="text-sm space-y-1">
                {table.fields.map((field) => (
                  <li key={field} className="text-gray-300">{field}</li>
                ))}
              </ul>
            </div>

            {table.relationships.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400">Relationships</h4>
                <ul className="text-sm space-y-1">
                  {table.relationships.map((rel) => (
                    <li key={rel.to} className="text-gray-300">
                      {rel.type} → {rel.to}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 