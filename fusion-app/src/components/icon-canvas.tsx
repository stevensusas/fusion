"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Layers, Server, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { ConnectionConfigForm, type ConnectionConfig } from "@/components/connection-config-form"

// Define icon type
type IconType = {
  id: string
  component: React.ReactNode
  name: string
  comingSoon?: boolean
}

// Define canvas item type
type CanvasItem = {
  id: string
  icon: IconType
  x: number
  y: number
  isComposite?: boolean
  connectionConfig?: ConnectionConfig
}

// Define connection type
type Connection = {
  id: string
  sourceId: string
  targetId: string
}

export function IconCanvas() {
  // State for canvas items
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([])
  // State for selected item
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  // State for connections
  const [connections, setConnections] = useState<Connection[]>([])
  // State for connection mode
  const [connectionMode, setConnectionMode] = useState<boolean>(false)
  // State for connection source
  const [connectionSource, setConnectionSource] = useState<string | null>(null)
  // Ref for the canvas
  const canvasRef = useRef<HTMLDivElement>(null)
  // State for tracking if we're dragging
  const [isDragging, setIsDragging] = useState(false)
  // State for tracking the current dragging position
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  // State for tracking which item is being dragged
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  // State for config dialog
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  // State for the item that has the config dialog open
  const [configDialogItemId, setConfigDialogItemId] = useState<string | null>(null)

  // Define composite server icon
  const compositeServerIcon: IconType = {
    id: "composite-server",
    component: (
      <div className="relative">
        <Server className="h-6 w-6 text-purple-600" />
        <Layers className="h-4 w-4 absolute -bottom-1 -right-1 text-purple-600" />
      </div>
    ),
    name: "Composite Server",
  }

  // Define tech service icons
  const icons: IconType[] = [
    // Available services
    {
      id: "postgres",
      component: (
        <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded">
          <img src="/icons/postgres.svg" alt="PostgreSQL" className="w-6 h-6" draggable="false" />
        </div>
      ),
      name: "PostgreSQL",
    },
    {
      id: "redis",
      component: (
        <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded">
          <img src="/icons/redis.svg" alt="Redis" className="w-6 h-6" draggable="false" />
        </div>
      ),
      name: "Redis",
    },
    {
      id: "github",
      component: (
        <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded">
          <img src="/icons/gitub.svg" alt="GitHub" className="w-6 h-6" draggable="false" />
        </div>
      ),
      name: "GitHub",
    },
    {
      id: "sentry",
      component: (
        <div className="flex items-center justify-center w-8 h-8 bg-[#362D59] text-white rounded">
          <img src="/icons/sentry.svg" alt="Sentry" className="w-5 h-5" draggable="false" />
        </div>
      ),
      name: "Sentry",
    },

    // Coming soon services
    {
      id: "google-workspace",
      component: (
        <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded">
          <img src="/icons/gdrive.svg" alt="Google Workspace" className="w-6 h-6" draggable="false" />
        </div>
      ),
      name: "Google Workspace",
      comingSoon: true,
    },
    {
      id: "slack",
      component: (
        <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded">
          <img src="/icons/slack.svg" alt="Slack" className="w-6 h-6" draggable="false" />
        </div>
      ),
      name: "Slack",
      comingSoon: true,
    },
  ]

  // Function to get icon by id
  const getIconById = (id: string) => icons.find((icon) => icon.id === id) || icons[0]
  
  // Function to get base icon id from full id
  const getBaseIconId = (fullId: string) => {
    // Extract the base icon id from the full id (e.g., "postgres-123456789" -> "postgres")
    const match = fullId.match(/^([^-]+)-\d+$/)
    return match ? match[1] : fullId
  }

  // Function to get item by id
  const getItemById = (id: string) => canvasItems.find((item) => item.id === id)

  // Handle starting to drag an icon from the sidebar
  const handleDragStart = (e: React.DragEvent, icon: IconType) => {
    // Don't allow dragging of "Coming Soon" icons
    if (icon.comingSoon) {
      e.preventDefault()
      return
    }
    
    // Set drag data and effect
    e.dataTransfer.setData("text/plain", icon.id)
    e.dataTransfer.effectAllowed = "copy"
  }

  // Handle dropping an icon onto the canvas
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const iconId = e.dataTransfer.getData("text/plain")
    
    // If no data was transferred, return early
    if (!iconId) return
    
    const icon = getIconById(iconId)

    // Don't add "Coming Soon" icons to the canvas
    if (icon.comingSoon) return

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Add the new icon to the canvas
      const newItem: CanvasItem = {
        id: `${iconId}-${Date.now()}`,
        icon,
        x,
        y,
        connectionConfig: { value: "" },
      }

      setCanvasItems([...canvasItems, newItem])
    }
  }

  // Handle adding a composite server
  const handleAddCompositeServer = () => {
    // Use fixed coordinates if we can't get the canvas dimensions
    const x = 200
    const y = 200

    // Add the composite server to the canvas
    const newItem: CanvasItem = {
      id: `composite-server-${Date.now()}`,
      icon: compositeServerIcon,
      x,
      y,
      isComposite: true,
    }

    setCanvasItems((prevItems) => [...prevItems, newItem])
  }

  // Handle dragging over the canvas
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Handle clicking on the canvas (deselect items)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedItem(null)
      if (connectionMode) {
        setConnectionMode(false)
        setConnectionSource(null)
      }
    }
  }

  // Handle clicking on an item on the canvas
  const handleItemClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation()

    // If we're in connection mode, handle creating a connection
    if (connectionMode && connectionSource) {
      // Don't connect to self
      if (connectionSource !== itemId) {
        // Create a new connection
        const newConnection: Connection = {
          id: `connection-${Date.now()}`,
          sourceId: connectionSource,
          targetId: itemId,
        }

        // Add the connection
        setConnections((prevConnections) => [...prevConnections, newConnection])

        // Exit connection mode
        setConnectionMode(false)
        setConnectionSource(null)
      }
    } else {
      // Normal selection
      setSelectedItem(itemId)
    }
  }

  // Handle opening config dialog
  const handleOpenConfigDialog = (itemId: string) => {
    setConfigDialogItemId(itemId)
    setConfigDialogOpen(true)
  }

  // Handle saving connection config
  const handleSaveConnectionConfig = (itemId: string, config: ConnectionConfig) => {
    setCanvasItems(
      canvasItems.map((item) =>
        item.id === itemId ? { ...item, connectionConfig: config } : item
      )
    )
  }

  // Handle starting to drag an item on the canvas
  const handleItemDragStart = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation()

    // Don't start dragging if we're in connection mode
    if (connectionMode) return

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      setDragPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }

    setIsDragging(true)
    setDraggedItem(itemId)
    setSelectedItem(itemId)
  }

  // Handle mouse move when dragging an item
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && draggedItem && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Update the position of the dragged item
      setCanvasItems(
        canvasItems.map((item) => {
          if (item.id === draggedItem) {
            return { ...item, x, y }
          }
          return item
        }),
      )

      setDragPosition({ x, y })
    }
  }

  // Handle mouse up when dragging an item
  const handleMouseUp = () => {
    setIsDragging(false)
    setDraggedItem(null)
  }

  // Handle deleting the selected item
  const handleDeleteItem = () => {
    if (selectedItem) {
      // Remove the item
      setCanvasItems(canvasItems.filter((item) => item.id !== selectedItem))

      // Remove any connections involving this item
      setConnections(connections.filter((conn) => conn.sourceId !== selectedItem && conn.targetId !== selectedItem))

      setSelectedItem(null)
    }
  }

  // Handle clearing the canvas
  const handleClearCanvas = () => {
    setCanvasItems([])
    setConnections([])
    setSelectedItem(null)
    setConnectionMode(false)
    setConnectionSource(null)
  }

  // Handle starting connection mode
  const handleStartConnection = () => {
    if (selectedItem) {
      // Check if the selected item is a composite server
      const item = canvasItems.find((item) => item.id === selectedItem)
      if (item && item.isComposite) {
        setConnectionMode(true)
        setConnectionSource(selectedItem)
      }
    }
  }

  // Calculate the center point of an item
  const getItemCenter = (itemId: string) => {
    const item = canvasItems.find((item) => item.id === itemId)
    if (!item) return { x: 0, y: 0 }

    return {
      x: item.x,
      y: item.y,
    }
  }

  // Calculate the path for a connection arrow with exact 90-degree turns
  const getConnectionPath = (sourceId: string, targetId: string) => {
    const sourceCenter = getItemCenter(sourceId)
    const targetCenter = getItemCenter(targetId)

    // Calculate the start and end points (offset from center to edge of icon)
    const sourceRadius = 16 // Approximate radius of the icon
    const targetRadius = 16

    // Determine which sides to connect based on relative positions
    const dx = targetCenter.x - sourceCenter.x
    const dy = targetCenter.y - sourceCenter.y
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    let startX, startY, endX, endY, path

    // Calculate start and end points
    if (absDx > absDy) {
      // Connect horizontally
      startX = sourceCenter.x + (dx > 0 ? sourceRadius : -sourceRadius)
      startY = sourceCenter.y
      endX = targetCenter.x + (dx > 0 ? -targetRadius : targetRadius)
      endY = targetCenter.y
    } else {
      // Connect vertically
      startX = sourceCenter.x
      startY = sourceCenter.y + (dy > 0 ? sourceRadius : -sourceRadius)
      endX = targetCenter.x
      endY = targetCenter.y + (dy > 0 ? -targetRadius : targetRadius)
    }

    // Create path with exact 90-degree turns
    if (absDx > absDy) {
      // Horizontal dominant - create a path with a vertical segment in the middle
      const midY = endY
      path = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY}`
    } else {
      // Vertical dominant - create a path with a horizontal segment in the middle
      const midX = endX
      path = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY}`
    }

    // Calculate arrow head points
    const arrowSize = 6
    const arrowAngle = Math.PI / 6 // 30 degrees

    // Determine the angle of the arrow based on the last segment
    let arrowBaseAngle
    if (absDx > absDy) {
      arrowBaseAngle = dx > 0 ? Math.PI : 0
    } else {
      arrowBaseAngle = dy > 0 ? Math.PI * 1.5 : Math.PI * 0.5
    }

    const arrowPoint1X = endX + arrowSize * Math.cos(arrowBaseAngle - arrowAngle)
    const arrowPoint1Y = endY + arrowSize * Math.sin(arrowBaseAngle - arrowAngle)
    const arrowPoint2X = endX + arrowSize * Math.cos(arrowBaseAngle + arrowAngle)
    const arrowPoint2Y = endY + arrowSize * Math.sin(arrowBaseAngle + arrowAngle)

    // Create the path with right angles
    return {
      path,
      arrowHead: `M ${endX} ${endY} L ${arrowPoint1X} ${arrowPoint1Y} L ${arrowPoint2X} ${arrowPoint2Y} Z`,
    }
  }

  // Add event listeners for mouse up
  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  // Get the selected item
  const selectedItemData = selectedItem ? canvasItems.find((item) => item.id === selectedItem) : null
  const isCompositeSelected = selectedItemData?.isComposite || false

  // Get the item for config dialog
  const configDialogItem = configDialogItemId ? getItemById(configDialogItemId) : null

  return (
    <div className="flex h-full w-full">
      {/* Canvas area */}
      <div
        ref={canvasRef}
        className={`flex-1 relative ${connectionMode ? "cursor-crosshair" : ""}`}
        style={{
          backgroundColor: "#ffffff", // Pure white background
        }}
        onDrop={handleCanvasDrop}
        onDragOver={handleCanvasDragOver}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
      >
        {/* Connection mode indicator */}
        {connectionMode && (
          <div className="absolute top-4 left-4 bg-purple-100 text-purple-800 px-4 py-2 rounded-md shadow-md z-10">
            Click on a target server to create a connection
          </div>
        )}

        {/* Render connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="0"
              refY="3.5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
            </marker>
          </defs>
          {connections.map((connection) => {
            const { path, arrowHead } = getConnectionPath(connection.sourceId, connection.targetId)
            return (
              <g key={connection.id}>
                <path
                  d={path}
                  fill="none"
                  stroke="#666" // Grey color
                  strokeWidth="1.5" // Thinner line
                  className="animated-dash" // CSS animation class
                />
                <path d={arrowHead} fill="#666" />
              </g>
            )
          })}
        </svg>

        {/* Render canvas items with context menu (except for composite servers) */}
        {canvasItems.map((item) => (
          item.isComposite ? (
            // Render composite server without context menu
            <div
              key={item.id}
              className={`absolute cursor-move p-2 rounded-md ${
                selectedItem === item.id
                  ? "bg-blue-100 ring-2 ring-blue-500"
                  : "bg-purple-50 hover:bg-purple-100"
              } ${connectionMode && connectionSource !== item.id ? "hover:ring-2 hover:ring-purple-500" : ""}`}
              style={{ left: `${item.x - 16}px`, top: `${item.y - 16}px` }}
              onClick={(e) => handleItemClick(e, item.id)}
              onMouseDown={(e) => handleItemDragStart(e, item.id)}
            >
              {item.icon.component}
            </div>
          ) : (
            // Render regular items with context menu
            <ContextMenu key={item.id}>
              <ContextMenuTrigger>
                <div
                  className={`absolute cursor-move p-2 rounded-md ${
                    selectedItem === item.id
                      ? "bg-blue-100 ring-2 ring-blue-500"
                      : "hover:bg-gray-200"
                  } ${connectionMode && connectionSource !== item.id ? "hover:ring-2 hover:ring-purple-500" : ""}`}
                  style={{ left: `${item.x - 16}px`, top: `${item.y - 16}px` }}
                  onClick={(e) => handleItemClick(e, item.id)}
                  onMouseDown={(e) => handleItemDragStart(e, item.id)}
                >
                  <div className="relative">
                    {item.icon.component}
                    {item.connectionConfig && item.connectionConfig.value && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full" title="Has configuration" />
                    )}
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => handleOpenConfigDialog(item.id)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configure Connection</span>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          )
        ))}
      </div>

      {/* Right sidebar */}
      <div className="w-64 border-l border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Servers</h2>
          <p className="text-sm text-gray-500">Drag a server to canvas to add it to your MCP system</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-2 gap-4">
            {icons.map((icon) => (
              <div
                key={icon.id}
                className={`flex flex-col items-center justify-center p-2 border border-gray-200 rounded-md h-24 w-full ${
                  icon.comingSoon ? "opacity-50 cursor-not-allowed" : "cursor-grab hover:bg-gray-50"
                }`}
                draggable={!icon.comingSoon}
                onDragStart={(e) => handleDragStart(e, icon)}
              >
                {icon.component}
                <div className="mt-2 text-center">
                  <span className={`text-xs ${icon.comingSoon ? "text-gray-400" : "text-gray-600"}`}>{icon.name}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        {/* Actions */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={() => handleAddCompositeServer()}>
              Add Composite Server
            </Button>

            {isCompositeSelected && (
              <Button
                variant="outline"
                className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                onClick={() => handleStartConnection()}
              >
                Add Connection
              </Button>
            )}

            <Button variant="destructive" onClick={handleDeleteItem} disabled={!selectedItem} className="w-full">
              Delete Selected
            </Button>
            <Button variant="outline" onClick={handleClearCanvas} className="w-full">
              Clear Canvas
            </Button>
          </div>
        </div>
      </div>

      {/* Configuration Dialog */}
      {configDialogItem && (
        <ConnectionConfigForm
          itemId={configDialogItem.id}
          itemName={configDialogItem.icon.name}
          iconType={getBaseIconId(configDialogItem.id)}
          isOpen={configDialogOpen}
          onClose={() => {
            setConfigDialogOpen(false)
            setConfigDialogItemId(null)
          }}
          onSave={handleSaveConnectionConfig}
          initialConfig={configDialogItem.connectionConfig || { value: "" }}
        />
      )}

      {/* Add CSS for animated dashed lines */}
      <style jsx global>{`
        .animated-dash {
          stroke-dasharray: 5, 5;
          animation: dash 1s linear infinite;
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
      `}</style>
    </div>
  )
}
