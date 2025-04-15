"use client"

import { Button } from "@/components/ui/button"
import { Database } from "lucide-react"
import { useState } from "react"
import { DatabaseManager } from "./database-manager"

export function FloatingDatabaseButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-blue-600 shadow-lg hover:bg-blue-700"
        onClick={() => setIsOpen(true)}
      >
        <Database className="h-6 w-6" />
      </Button>
      <DatabaseManager isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
} 