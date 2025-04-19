"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Layers, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

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
      id: "supabase",
      component: (
        <div className="flex items-center justify-center w-8 h-8 bg-[#3ECF8E] text-white rounded">
          <svg viewBox="0 0 109 113" className="w-5 h-5" fill="currentColor">
            <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" />
            <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.04076L54.4849 72.293H9.83113C1.64038 72.293 -2.92775 62.8329 2.1655 56.4183L45.317 2.07103Z" />
          </svg>
        </div>
      ),
      name: "Supabase",
    },
    {
      id: "gcp",
      component: (
        <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path
              d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 22.5c-5.79 0-10.5-4.71-10.5-10.5S6.21 1.5 12 1.5 22.5 6.21 22.5 12 17.79 22.5 12 22.5z"
              fill="#4285F4"
            />
            <path
              d="M12 4.5c-4.14 0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5 7.5-3.36 7.5-7.5-3.36-7.5-7.5-7.5zm0 13.5c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"
              fill="#EA4335"
            />
            <path
              d="M12 7.5c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5zm0 7.5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
              fill="#FBBC05"
            />
            <path d="M12 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" fill="#34A853" />
          </svg>
        </div>
      ),
      name: "Google Cloud",
    },
    {
      id: "sentry",
      component: (
        <div className="flex items-center justify-center w-8 h-8 bg-[#362D59] text-white rounded">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 19.2c-3.972 0-7.2-3.228-7.2-7.2 0-3.978 3.228-7.2 7.2-7.2 3.978 0 7.2 3.222 7.2 7.2 0 3.972-3.222 7.2-7.2 7.2zm.6-10.8h-1.2v4.8h1.2v-4.8zm0-2.4h-1.2v1.2h1.2V6z" />
          </svg>
        </div>
      ),
      name: "Sentry",
    },

    // Coming soon services
    {
      id: "google-workspace",
      component: (
        <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path d="M22 12L17 2H7L2 12L7 22H17L22 12Z" fill="#4285F4" />
            <path d="M12 8V16L16 12L12 8Z" fill="white" />
            <path d="M12 8L8 12L12 16V8Z" fill="#DADCE0" />
          </svg>
        </div>
      ),
      name: "Google Workspace",
      comingSoon: true,
    },
    {
      id: "aws",
      component: (
        <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path
              d="M13.527 12.49l-.23.23-.207-.207.207-.207.23.184zm.23.253l-.23.23-.207-.207.207-.23.23.207zm-.23-.69l-.23.23-.207-.208.207-.23.23.208zm-.437.437l-.23.23-.207-.207.207-.23.23.207zm-.23-.437l-.23.23-.207-.208.207-.23.23.208zm-.437.437l-.23.23-.207-.207.207-.23.23.207zm5.477-1.288c0 .23-.207.437-.437.437h-1.15c-.23 0-.437-.207-.437-.437v-1.15c0-.23.207-.437.437-.437h1.15c.23 0 .437.207.437.437v1.15zm-2.3 0c0 .23-.207.437-.437.437h-1.15c-.23 0-.437-.207-.437-.437v-1.15c0-.23.207-.437.437-.437h1.15c.23 0 .437.207.437.437v1.15zm-2.3 0c0 .23-.207.437-.437.437h-1.15c-.23 0-.437-.207-.437-.437v-1.15c0-.23.207-.437.437-.437h1.15c.23 0 .437.207.437.437v1.15zm-2.3 0c0 .23-.207.437-.437.437h-1.15c-.23 0-.437-.207-.437-.437v-1.15c0-.23.207-.437.437-.437h1.15c.23 0 .437.207.437.437v1.15zm-2.3 0c0 .23-.207.437-.437.437h-1.15c-.23 0-.437-.207-.437-.437v-1.15c0-.23.207-.437.437-.437h1.15c.23 0 .437.207.437.437v1.15zm9.2 2.3c0 .23-.207.437-.437.437h-1.15c-.23 0-.437-.207-.437-.437v-1.15c0-.23.207-.437.437-.437h1.15c.23 0 .437.207.437.437v1.15zm-2.3 0c0 .23-.207.437-.437.437h-1.15c-.23 0-.437-.207-.437-.437v-1.15c0-.23.207-.437.437-.437h1.15c.23 0 .437.207.437.437v1.15zm-2.3 0c0 .23-.207.437-.437.437h-1.15c-.23 0-.437-.207-.437-.437v-1.15c0-.23.207-.437.437-.437h1.15c.23 0 .437.207.437.437v1.15zm-2.3 0c0 .23-.207.437-.437.437h-1.15c-.23 0-.437-.207-.437-.437v-1.15c0-.23.207-.437.437-.437h1.15c.23 0 .437.207.437.437v1.15zm-2.3 0c0 .23-.207.437-.437.437h-1.15c-.23 0-.437-.207-.437-.437v-1.15c0-.23.207-.437.437-.437h1.15c.23 0 .437.207.437.437v1.15zm9.2 2.3c0 .23-.207.437-.437.437h-1.15c-.23 0-.437-.207-.437-.437v-1.15c0-.23.207-.437.437-.437h1.15c.23 0 .437.207.437.437v1.15zm-2.3 0c0 .23-.207.437-.437.437h-1.15c-.23 0-.437-.207-.437-.437v-1.15c0-.23.207-.437.437-.437h1.15c.23 0 .437.207.437.437v1.15zm-2.3 0c0 .23-.207.437-.437.437h-1.15c-.23 0-.437-.207-.437-.437v-1.15c0-.23.207-.437.437-.437h1.15c.23 0 .437.207.437.437v1.15zm-2.3 0c0 .23-.207.437-.437.437h-1.15c-.23 0-.437-.207-.437-.437v-1.15c0-.23.207-.437.437-.437h1.15c.23 0 .437.207.437.437v1.15zm-2.3 0c0 .23-.207.437-.437.437h-1.15c-.23 0-.437-.207-.437-.437v-1.15c0-.23.207-.437.437-.437h1.15c.23 0 .437.207.437.437v1.15z"
              fill="#F90"
            />
          </svg>
        </div>
      ),
      name: "AWS",
      comingSoon: true,
    },
    {
      id: "azure",
      component: (
        <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path
              d="M5.483 21.3H24L14.025 4.013l-3.038 8.347 5.836 6.938L5.483 21.3zM13.23 2.7L8.91 12.35 0 19.253h5.1L13.23 2.7z"
              fill="#0078D4"
            />
          </svg>
        </div>
      ),
      name: "Azure",
      comingSoon: true,
    },
    {
      id: "vercel",
      component: (
        <div className="flex items-center justify-center w-8 h-8 bg-black text-white rounded">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12 2L2 19.5h20L12 2z" />
          </svg>
        </div>
      ),
      name: "Vercel",
      comingSoon: true,
    },
    {
      id: "netlify",
      component: (
        <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path
              d="M16.934 8.519a1.044 1.044 0 0 1 .303.23l2.349-1.045-2.192-2.171-.491 2.954zM12.06 6.546a1.305 1.305 0 0 1 .209.574l3.497 1.482a1.044 1.044 0 0 1 .355-.177l.574-3.55-2.13-2.234-2.505 3.852v.053zm11.933 5.491l-3.748-3.748-2.548 1.044 6.264 2.662s.053.042.032.042zm-.627.606l-6.013-2.569a1.044 1.044 0 0 1-.7.407l-.647 3.957a1.044 1.044 0 0 1 .303.731l3.633.762 3.33-3.31v-.062zM15.4 9.25L12.132 7.86a1.2 1.2 0 0 1-1.044.543h-.199L8.185 12.58l7.225-3.132v.01a.887.887 0 0 1 0-.167.052.052 0 0 0-.01-.041zm3.967 7.308l-3.195-.658a1.096 1.096 0 0 1-.46.344l-.761 4.72 4.437-4.396s-.01.02-.021.02zm-4.469-.324a1.044 1.044 0 0 1-.616-.71l-5.95-1.222-.084.136 5.398 7.81.323-.324.919-5.67s.031.022.01.011zm-6.441-2.652l5.878 1.211a1.044 1.044 0 0 1 .824-.522l.637-3.894-.135-.115-7.308 3.132a1.817 1.817 0 0 1 .104.188zm-2.464.981l-.125-.125-2.537 1.044 1.232 1.222 1.399-2.172zm1.67.397a1.368 1.368 0 0 1-.563.125 1.389 1.389 0 0 1-.45-.073l-1.544 2.245 6.765 6.702 1.19-1.18zm-.95-2.641a1.702 1.702 0 0 1 .314 0 1.378 1.378 0 0 1 .344 0l2.735-4.25a1.19 1.19 0 0 1-.334-.824 1.242 1.242 0 0 1 0-.271l-3.32-1.535-2.672 2.6zm.303-7.402l3.237 1.378a1.242 1.242 0 0 1 .835-.282 1.357 1.357 0 0 1 .397.063l2.526-3.947L11.923.041 7.016 4.854s-.01.052 0 .063zm-1.21 8.164a1.566 1.566 0 0 1 .24-.334L3.278 8.613 0 11.797l5.804 1.284zm-.262.7L.533 12.735l2.203 2.235 2.777-1.18z"
              fill="#00C7B7"
            />
          </svg>
        </div>
      ),
      name: "Netlify",
      comingSoon: true,
    },
    {
      id: "stripe",
      component: (
        <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path
              d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"
              fill="#6772E5"
            />
          </svg>
        </div>
      ),
      name: "Stripe",
      comingSoon: true,
    },
    {
      id: "github",
      component: (
        <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              fill="#181717"
            />
          </svg>
        </div>
      ),
      name: "GitHub",
      comingSoon: true,
    },
    {
      id: "auth0",
      component: (
        <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path
              d="M21.98 7.448L19.62 0H4.347L2.02 7.448c-1.352 4.312.03 9.206 3.815 12.015L12.007 24l6.157-4.552c3.755-2.81 5.182-7.688 3.815-12.015l-6.16 4.58 2.343 7.45-6.157-4.597-6.158 4.58 2.358-7.433-6.188-4.55 7.63-.045L12.008 0l2.356 7.404 7.615.044z"
              fill="#EB5424"
            />
          </svg>
        </div>
      ),
      name: "Auth0",
      comingSoon: true,
    },
    {
      id: "firebase",
      component: (
        <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path
              d="M3.89 15.673L6.255.461A.542.542 0 0 1 7.27.289L9.813 5.06 3.89 15.673zm16.795 3.691L18.433 5.365a.543.543 0 0 0-.918-.295l-14.2 14.294 7.857 4.428a1.62 1.62 0 0 0 1.587 0l7.926-4.428zM14.3 7.148l-1.82-3.482
              a.542.542 0 0 0-.96 0L3.53 17.984 14.3 7.148z"
              fill="#FFCA28"
            />
          </svg>
        </div>
      ),
      name: "Firebase",
      comingSoon: true,
    },
    {
      id: "mongodb",
      component: (
        <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path
              d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0 1 11.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 0 0 3.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z"
              fill="#13AA52"
            />
          </svg>
        </div>
      ),
      name: "MongoDB",
      comingSoon: true,
    },
  ]

  // Function to get icon by id
  const getIconById = (id: string) => icons.find((icon) => icon.id === id) || icons[0]

  // Handle starting to drag an icon from the sidebar
  const handleDragStart = (e: React.DragEvent, icon: IconType) => {
    // Don't allow dragging of "Coming Soon" icons
    if (icon.comingSoon) {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData("text/plain", icon.id)
  }

  // Handle dropping an icon onto the canvas
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const iconId = e.dataTransfer.getData("text/plain")
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

        {/* Render canvas items */}
        {canvasItems.map((item) => (
          <div
            key={item.id}
            className={`absolute cursor-move p-2 rounded-md ${
              selectedItem === item.id
                ? "bg-blue-100 ring-2 ring-blue-500"
                : item.isComposite
                  ? "bg-purple-50 hover:bg-purple-100"
                  : "hover:bg-gray-200"
            } ${connectionMode && connectionSource !== item.id ? "hover:ring-2 hover:ring-purple-500" : ""}`}
            style={{ left: `${item.x - 16}px`, top: `${item.y - 16}px` }}
            onClick={(e) => handleItemClick(e, item.id)}
            onMouseDown={(e) => handleItemDragStart(e, item.id)}
          >
            {item.icon.component}
          </div>
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
