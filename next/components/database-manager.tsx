"use client"

import { Button } from "@/components/ui/button"
import { Database, Download, RefreshCw, Settings, Trash2, X, Table2, GitBranch, Plus, Edit, Search, Upload, CheckCircle } from "lucide-react"
import { useEffect, useState, useRef, useCallback } from "react"
import { db, Paper, ResearchData, DBSettings } from "@/lib/indexeddb"
import { formatDistanceToNow } from "date-fns"
import { DatabaseSchema } from './database-schema'
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface DatabaseManagerProps {
  isOpen: boolean
  onClose: () => void
}

interface TableData {
  id: string
  [key: string]: any
}

export function DatabaseManager({ isOpen, onClose }: DatabaseManagerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "schema" | "data">("overview")
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableData, setTableData] = useState<TableData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<TableData | null>(null)
  const [storageUsage, setStorageUsage] = useState(0)

  const tables = [
    { name: "papers", label: "Papers" },
    { name: "research", label: "Research" },
    { name: "writing", label: "Writing" },
    { name: "review", label: "Review" },
    { name: "finalization", label: "Finalization" },
    { name: "agents", label: "Agents" },
    { name: "tasks", label: "Tasks" }
  ]

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable)
    }
  }, [selectedTable])

  async function loadData() {
    try {
      setIsLoading(true)
      await db.init()
      calculateStorageUsage()
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadTableData(tableName: string) {
    try {
      setIsLoading(true)
      const data = await db.getAll(tableName)
      setTableData(data as TableData[])
    } catch (error) {
      console.error(`Error loading ${tableName} data:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  async function calculateStorageUsage() {
    try {
      const usage = await navigator.storage.estimate()
      if (usage.usage) {
        setStorageUsage(Math.round(usage.usage / 1024 / 1024)) // Convert to MB
      }
    } catch (error) {
      console.error("Error calculating storage usage:", error)
    }
  }

  async function handleDelete(tableName: string, id: string) {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        await db.delete(tableName, id)
        loadTableData(tableName)
      } catch (error) {
        console.error("Error deleting record:", error)
      }
    }
  }

  async function handleUpdate(tableName: string, data: TableData) {
    try {
      await db.update(tableName, data)
      setIsEditing(null)
      setEditData(null)
      loadTableData(tableName)
    } catch (error) {
      console.error("Error updating record:", error)
    }
  }

  async function handleExport(tableName: string) {
    try {
      const data = await db.getAll(tableName)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `paperagent-${tableName}-${new Date().toISOString()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting data:", error)
    }
  }

  async function handleImport(tableName: string, file: File) {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (Array.isArray(data)) {
        for (const item of data) {
          await db.add(tableName, item)
        }
        loadTableData(tableName)
      }
    } catch (error) {
      console.error("Error importing data:", error)
    }
  }

  const handleEditDataChange = (key: string, value: string) => {
    setEditData(prev => {
      if (!prev) return null
      return {
        ...prev,
        [key]: value
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative h-[90vh] w-full max-w-6xl rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-2xl">
        <div className="absolute right-4 top-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <Database className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Database Manager</h2>
        </div>

        <div className="mb-6 flex gap-4 border-b border-gray-800">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            onClick={() => setActiveTab("overview")}
            className="text-gray-400 hover:text-white"
          >
            Overview
          </Button>
          <Button
            variant={activeTab === "schema" ? "default" : "ghost"}
            onClick={() => setActiveTab("schema")}
            className="text-gray-400 hover:text-white"
          >
            Schema
          </Button>
          <Button
            variant={activeTab === "data" ? "default" : "ghost"}
            onClick={() => setActiveTab("data")}
            className="text-gray-400 hover:text-white"
          >
            Data
          </Button>
        </div>

        <div className="h-[calc(90vh-12rem)] overflow-y-auto">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="scholarly-card p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Database className="w-5 h-5" />
                      <h3 className="text-lg font-semibold">Database Status</h3>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Version: 1.0</p>
                      <p className="text-sm text-gray-400">Size: {storageUsage} MB</p>
                      <p className="text-sm text-gray-400">Last Backup: Never</p>
                    </div>
                  </div>

                  <div className="scholarly-card p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Table2 className="w-5 h-5" />
                      <h3 className="text-lg font-semibold">Tables</h3>
                    </div>
                    <div className="space-y-2">
                      {tables.map(table => (
                        <p key={table.name} className="text-sm text-gray-400">
                          {table.label}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="scholarly-card p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="w-5 h-5" />
                      <h3 className="text-lg font-semibold">Actions</h3>
                    </div>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleExport("papers")}
                      >
                        Backup Database
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          // Implement restore functionality
                        }}
                      >
                        Restore Database
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "schema" && (
                <DatabaseSchema />
              )}

              {activeTab === "data" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <select
                      className="flex h-10 w-full rounded-md border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white"
                      value={selectedTable || ""}
                      onChange={(e) => setSelectedTable(e.target.value)}
                    >
                      <option value="">Select a table</option>
                      {tables.map(table => (
                        <option key={table.name} value={table.name}>
                          {table.label}
                        </option>
                      ))}
                    </select>
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button
                      variant="outline"
                      onClick={() => selectedTable && handleExport(selectedTable)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Upload className="mr-2 h-4 w-4" />
                          Import
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Import Data</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            type="file"
                            accept=".json"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file && selectedTable) {
                                handleImport(selectedTable, file)
                              }
                            }}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {selectedTable && (
                    <div className="relative">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {tableData.length > 0 && Object.keys(tableData[0]).map(key => (
                                <TableHead key={key} className="text-gray-400">
                                  {key}
                                </TableHead>
                              ))}
                              <TableHead className="sticky right-0 bg-gray-900 text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tableData
                              .filter(row => 
                                Object.values(row).some(value => 
                                  String(value).toLowerCase().includes(searchQuery.toLowerCase())
                                )
                              )
                              .map(row => (
                                <TableRow key={row.id}>
                                  {Object.entries(row).map(([key, value]) => (
                                    <TableCell key={key} className="text-gray-300">
                                      {isEditing === row.id ? (
                                        <Input
                                          value={editData?.[key] || ""}
                                          onChange={(e) => handleEditDataChange(key, e.target.value)}
                                        />
                                      ) : (
                                        String(value)
                                      )}
                                    </TableCell>
                                  ))}
                                  <TableCell className="sticky right-0 bg-gray-900 text-right">
                                    {isEditing === row.id ? (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleUpdate(selectedTable, editData!)}
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            setIsEditing(null)
                                            setEditData(null)
                                          }}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            setIsEditing(row.id)
                                            setEditData(row)
                                          }}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleDelete(selectedTable, row.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
} 