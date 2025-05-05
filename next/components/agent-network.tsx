"use client"
import { Brain, Network, Settings, Plus, ArrowRight, ArrowDown, Maximize2, Minimize2, ZoomIn, ZoomOut, Move, Minus } from "lucide-react"
import { Agent } from "@/lib/agent-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useState, useEffect, useRef, useCallback } from "react"
import { db } from '../lib/indexeddb'
import type { AgentEdge } from '../lib/indexeddb'

interface AgentNode {
  id: string
  agent: Agent
  position: { x: number; y: number }
  status: "idle" | "running" | "completed" | "error"
  capabilities: string[]
}

interface Transform {
  scale: number
  translateX: number
  translateY: number
}

const AGENT_TYPES = {
  research: {
    title: "Research Agent",
    description: "Searches and analyzes research papers",
    color: "bg-blue-500",
    icon: Brain,
  },
  writing: {
    title: "Writing Agent",
    description: "Generates and structures content",
    color: "bg-green-500",
    icon: Brain,
  },
  review: {
    title: "Review Agent",
    description: "Reviews and validates content",
    color: "bg-purple-500",
    icon: Brain,
  },
}

const AGENT_FLOWS = {
  default: [
    { type: 'research', position: { x: 0, y: 0 } },
    { type: 'writing', position: { x: 300, y: 0 } },
    { type: 'review', position: { x: 600, y: 0 } },
  ],
  parallel: [
    { type: 'research', position: { x: 0, y: 0 } },
    { type: 'writing', position: { x: 0, y: 200 } },
    { type: 'review', position: { x: 300, y: 100 } },
  ],
  custom: [
    { type: 'research', position: { x: 0, y: 0 } },
    { type: 'writing', position: { x: 200, y: 100 } },
    { type: 'review', position: { x: 400, y: 0 } },
  ],
}

interface NodeProps {
  node: AgentNode
  onMove: (id: string, position: { x: number; y: number }) => void
  onEdgeStart: (e: React.MouseEvent, id: string) => void
  onEdgeEnd: (targetId: string) => void
  onStartAgent: (agentId: string) => void
  onDeleteAgent: (agentId: string) => void
  isAgentRunning: Record<string, boolean>
  transform: Transform
  isCreatingEdge: boolean
}

const Node = ({ 
  node, 
  onMove, 
  onEdgeStart, 
  onEdgeEnd,
  onStartAgent, 
  onDeleteAgent, 
  isAgentRunning, 
  transform,
  isCreatingEdge
}: NodeProps) => {
  const agentType = AGENT_TYPES[node.agent.type]
  const Icon = agentType.icon
  const nodeRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only handle left click
    e.stopPropagation()
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setInitialPosition(node.position)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    
    const dx = (e.clientX - dragStart.x) / transform.scale
    const dy = (e.clientY - dragStart.y) / transform.scale
    
    onMove(node.id, {
      x: initialPosition.x + dx,
      y: initialPosition.y + dy
    })
  }, [isDragging, dragStart, initialPosition, transform.scale])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleMinusClick = (e: React.MouseEvent) => {
    console.log("Minus button clicked on node:", node.id)
    console.log("Current edge creation state:", { isCreatingEdge })
    e.preventDefault()
    e.stopPropagation()
    if (isCreatingEdge) {
      console.log("Attempting to end edge creation with target:", node.id)
      onEdgeEnd(node.id)
    } else {
      console.log("Not in edge creation mode, ignoring minus click")
    }
  }

  const handlePlusClick = (e: React.MouseEvent) => {
    console.log("Plus button clicked on node:", node.id)
    e.preventDefault()
    e.stopPropagation()
    onEdgeStart(e, node.id)
  }

  return (
    <div
      ref={nodeRef}
      id={`node-${node.id}`}
      className={cn(
        "absolute p-4 rounded-lg shadow-lg bg-card border border-border",
        "cursor-move select-none",
        "transition-shadow duration-200",
        "hover:shadow-xl",
        isDragging && "shadow-2xl"
      )}
      style={{
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        minWidth: '200px',
        touchAction: 'none',
        zIndex: isDragging ? 10 : 1
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              isCreatingEdge && "bg-blue-500/10 hover:bg-blue-500/20"
            )}
            onClick={handleMinusClick}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", agentType.color)}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium">{agentType.title}</h3>
            <p className="text-sm text-muted-foreground">{agentType.description}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handlePlusClick}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStartAgent(node.id)}
          disabled={isAgentRunning[node.id]}
          className="flex-1"
        >
          {isAgentRunning[node.id] ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
              Running
            </div>
          ) : (
            'Start'
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteAgent(node.id)}
          disabled={isAgentRunning[node.id]}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}

interface EdgeProps {
  source: { x: number; y: number };
  target: { x: number; y: number };
  isCreating?: boolean;
  isNear?: boolean;
}

const Edge = ({ source, target, isCreating, isNear }: EdgeProps) => {
  // Calculate the distance and angle between source and target
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  // Calculate the midpoint
  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;

  // Calculate control points for a curved path
  const controlX1 = source.x + (dx * 0.25);
  const controlY1 = source.y + (dy * 0.25);
  const controlX2 = source.x + (dx * 0.75);
  const controlY2 = source.y + (dy * 0.75);

  return (
    <div 
      className="edge-container"
      style={{
        position: 'absolute',
        left: `${midX}px`,
        top: `${midY}px`,
        width: `${distance}px`,
        height: '40px',
        transform: `rotate(${angle}deg)`,
        transformOrigin: 'center',
        zIndex: 100
      }}
    >
      {/* Water Flow Effect */}
      <div className={`
        water-flow 
        ${isCreating ? 'creating' : ''} 
        ${isNear ? 'near' : ''}
      `} 
        style={{
          '--flow-distance': `${distance}px`,
          '--flow-angle': `${angle}deg`,
          '--control-x1': `${controlX1}px`,
          '--control-y1': `${controlY1}px`,
          '--control-x2': `${controlX2}px`,
          '--control-y2': `${controlY2}px`
        } as React.CSSProperties}
      >
        <div className="water-drops">
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i} 
              className="water-drop"
              style={{
                '--delay': `${i * 0.2}s`,
                '--duration': `${1 + Math.random() * 0.5}s`
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface AgentNetworkProps {
  paperId: string;
  agents: Agent[];
  onStartAgent: (agentId: string) => void;
  onDeleteAgent: (agentId: string) => void;
  isAgentRunning: Record<string, boolean>;
  onCreateAgent: (agent: Agent) => void;
}

export default function AgentNetwork({
  paperId,
  agents,
  onStartAgent,
  onDeleteAgent,
  isAgentRunning,
  onCreateAgent
}: AgentNetworkProps) {
  const [nodes, setNodes] = useState<AgentNode[]>([])
  const [edges, setEdges] = useState<AgentEdge[]>([])
  const [newEdge, setNewEdge] = useState<{ source: string; x: number; y: number } | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [transform, setTransform] = useState<Transform>({ scale: 1, translateX: 0, translateY: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [isCreatingEdge, setIsCreatingEdge] = useState(false)
  const [edgeStart, setEdgeStart] = useState<string | null>(null)
  const [currentMousePosition, setCurrentMousePosition] = useState<{ x: number; y: number } | null>(null)
  const isMouseDown = useRef(false)

  useEffect(() => {
    const newNodes = (agents || []).map((agent, index) => {
      const row = Math.floor(index / 3)
      const col = index % 3
      return {
        id: agent.id,
        agent: agent,
        position: { 
          x: 300 + (col * 400), 
          y: 200 + (row * 300)
        },
        status: "idle" as const,
        capabilities: agent.capabilities,
      }
    })
    setNodes(newNodes)
  }, [agents])

  useEffect(() => {
    // Load edges from IndexedDB
    const loadEdges = async () => {
      try {
        const savedEdges = await db.getEdges(paperId);
        setEdges(savedEdges);
      } catch (error) {
        console.error('Error loading edges:', error);
      }
    };
    loadEdges();
  }, [paperId]);

  const handleNodeMove = (id: string, position: { x: number; y: number }) => {
    setNodes(nodes.map(node => 
      node.id === id ? { ...node, position } : node
    ))
  }

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 1 && e.button !== 2) return // Middle click or right click
    e.preventDefault()
    setIsPanning(true)
    setPanStart({ x: e.clientX, y: e.clientY })
  }

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - panStart.x
      const dy = e.clientY - panStart.y
      setTransform(prev => ({
        ...prev,
        translateX: prev.translateX + dx,
        translateY: prev.translateY + dy
      }))
      setPanStart({ x: e.clientX, y: e.clientY })
    }

    if (newEdge && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setMousePosition({
        x: (e.clientX - rect.left - transform.translateX) / transform.scale,
        y: (e.clientY - rect.top - transform.translateY) / transform.scale
      })
    }
  }

  const handleContainerMouseUp = () => {
    setIsPanning(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.1, Math.min(2, transform.scale * scaleFactor))
    
    // Calculate cursor position relative to container
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    // Calculate new transform origin based on cursor position
    setTransform(prev => ({
      scale: newScale,
      translateX: mouseX - (mouseX - prev.translateX) * (newScale / prev.scale),
      translateY: mouseY - (mouseY - prev.translateY) * (newScale / prev.scale)
    }))
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const resetView = () => {
    setTransform({ scale: 1, translateX: 0, translateY: 0 })
  }

  const findClosestNode = (x: number, y: number, excludeId?: string) => {
    return nodes.reduce((closest, node) => {
      if (node.id === excludeId) return closest
      
      const dx = node.position.x - x
      const dy = node.position.y - y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 200 && (!closest || distance < closest.distance)) {
        return { node, distance }
      }
      return closest
    }, { node: null as AgentNode | null, distance: Infinity })
  }

  const handleEdgeStart = (sourceId: string) => {
    console.log("Starting edge from:", sourceId)
    console.log("Current state before edge start:", { isCreatingEdge, edgeStart })
    
    // Update state
    setIsCreatingEdge(true)
    setEdgeStart(sourceId)
  }

  const handleEdgeMove = (e: React.MouseEvent) => {
    if (!isCreatingEdge || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - transform.translateX) / transform.scale
    const y = (e.clientY - rect.top - transform.translateY) / transform.scale

    setCurrentMousePosition({ x, y })
  }

  const handleEdgeEnd = (targetId: string) => {
    console.log("Edge end called with target:", targetId)
    console.log("Current state during edge end:", { isCreatingEdge, edgeStart })
    
    if (edgeStart && targetId && edgeStart !== targetId) {
      const newEdge: AgentEdge = {
        id: `${edgeStart}-${targetId}`,
        source: edgeStart,
        target: targetId,
        type: 'sequential',
        label: 'Processes',
        paperId
      }
      
      // Check if edge already exists
      const edgeExists = edges.some(edge => 
        (edge.source === edgeStart && edge.target === targetId) ||
        (edge.source === targetId && edge.target === edgeStart)
      )

      if (!edgeExists) {
        console.log("Creating new edge:", newEdge)
        setEdges(prevEdges => [...prevEdges, newEdge])
      } else {
        console.log("Edge already exists")
      }
    } else {
      console.log("Invalid edge creation attempt:", { edgeStart, targetId })
    }
    
    // Reset state
    setIsCreatingEdge(false)
    setEdgeStart(null)
    setCurrentMousePosition(null)
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsCreatingEdge(false)
      setEdgeStart(null)
    }
  }

  const handlePlusClick = (agentId: string) => {
    setIsCreatingEdge(true)
    setEdgeStart(agentId)
  }

  const handleMinusClick = async (agentId: string) => {
    if (isCreatingEdge && edgeStart) {
      const newEdge: AgentEdge = {
        id: `${edgeStart}-${agentId}`,
        source: edgeStart,
        target: agentId,
        type: 'sequential',
        label: 'Processes',
        paperId
      }

      try {
        await db.saveEdge(paperId, newEdge)
        setEdges(prev => [...prev, newEdge])
      } catch (error) {
        console.error('Error saving edge:', error)
      }
    }
    setIsCreatingEdge(false)
    setEdgeStart(null)
  }

  return (
    <div className={cn(
      "flex flex-col",
      isFullscreen ? "fixed inset-0 z-50 bg-background" : "h-[600px] border rounded-lg"
    )}>
      <div className="flex items-center justify-between border-b p-2 bg-card">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Agent Network</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={resetView}>
            <Move className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setTransform(prev => ({ ...prev, scale: Math.min(2, prev.scale * 1.2) }))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setTransform(prev => ({ ...prev, scale: Math.max(0.1, prev.scale * 0.8) }))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onCreateAgent(agents[0])} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Agent
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={cn(
          "relative flex-1 overflow-hidden bg-background/50",
          isPanning && "cursor-grabbing",
          isCreatingEdge && "cursor-crosshair"
        )}
        onMouseDown={handleContainerMouseDown}
        onMouseMove={(e) => {
          handleContainerMouseMove(e)
          handleEdgeMove(e)
        }}
        onMouseUp={handleContainerMouseUp}
        onClick={handleContainerClick}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          className="absolute inset-0 transition-transform duration-75"
          style={{
            transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`
          }}
        >
          {/* Render edges */}
          {edges.map((edge) => {
            const sourceNode = nodes.find(n => n.id === edge.source)
            const targetNode = nodes.find(n => n.id === edge.target)
            if (!sourceNode || !targetNode) return null

            return (
              <Edge
                key={edge.id}
                source={{
                  x: sourceNode.position.x + 200,
                  y: sourceNode.position.y + 50
                }}
                target={{
                  x: targetNode.position.x,
                  y: targetNode.position.y + 50
                }}
              />
            )
          })}

          {/* Render creating edge */}
          {isCreatingEdge && edgeStart && currentMousePosition && (
            <>
              {nodes.map((node) => {
                if (node.id === edgeStart) return null
                const dx = node.position.x - currentMousePosition.x
                const dy = node.position.y - currentMousePosition.y
                const distance = Math.sqrt(dx * dx + dy * dy)
                const isNear = distance < 100

                return (
                  <div
                    key={`target-${node.id}`}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${node.position.x + 100}px`,
                      top: `${node.position.y + 50}px`,
                      width: '200px',
                      height: '200px',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full border-2",
                        isNear ? "border-blue-400" : "border-transparent",
                        "animate-pulse"
                      )}
                    />
              </div>
                )
              })}

              {(() => {
                const sourceNode = nodes.find(n => n.id === edgeStart)
                if (!sourceNode) return null

                return (
                  <Edge
                    source={{
                      x: sourceNode.position.x + 200,
                      y: sourceNode.position.y + 50
                    }}
                    target={{
                      x: currentMousePosition.x,
                      y: currentMousePosition.y
                    }}
                    isCreating
                  />
                )
              })()}
            </>
          )}

          {/* Render nodes */}
          {nodes.map((node) => (
            <Node
              key={node.id}
              node={node}
              onMove={handleNodeMove}
              onEdgeStart={(e, id) => {
                e.stopPropagation()
                handleEdgeStart(id)
              }}
              onEdgeEnd={handleEdgeEnd}
              onStartAgent={onStartAgent}
              onDeleteAgent={onDeleteAgent}
              isAgentRunning={isAgentRunning}
              transform={transform}
              isCreatingEdge={isCreatingEdge && node.id !== edgeStart}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 