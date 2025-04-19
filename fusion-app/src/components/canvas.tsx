"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Palette } from "lucide-react"

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)

  // Available colors
  const colors = [
    { name: "Black", value: "#000000" },
    { name: "Red", value: "#ff0000" },
    { name: "Green", value: "#00ff00" },
    { name: "Blue", value: "#0000ff" },
    { name: "Yellow", value: "#ffff00" },
    { name: "Purple", value: "#800080" },
    { name: "Orange", value: "#ffa500" },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = 400
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Get context
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      setContext(ctx)
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  useEffect(() => {
    if (context) {
      context.strokeStyle = color
      context.lineWidth = brushSize
    }
  }, [color, brushSize, context])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)

    const canvas = canvasRef.current
    if (!canvas || !context) return

    const rect = canvas.getBoundingClientRect()
    let x, y

    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    context.beginPath()
    context.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    let x, y

    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    context.lineTo(x, y)
    context.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    if (context) {
      context.closePath()
    }
  }

  const clearCanvas = () => {
    if (context && canvasRef.current) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const saveCanvas = () => {
    if (canvasRef.current) {
      const link = document.createElement("a")
      link.download = "drawing.png"
      link.href = canvasRef.current.toDataURL("image/png")
      link.click()
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-3xl">
      <div className="flex flex-wrap justify-center gap-2 mb-4 w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
              <Palette className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {colors.map((c) => (
              <DropdownMenuItem key={c.value} onClick={() => setColor(c.value)} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.value }}></div>
                {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2 min-w-[200px]">
          <span className="text-sm">Size:</span>
          <Slider
            value={[brushSize]}
            min={1}
            max={20}
            step={1}
            onValueChange={(value) => setBrushSize(value[0])}
            className="w-32"
          />
          <span className="text-sm w-6">{brushSize}</span>
        </div>

        <Button variant="outline" onClick={clearCanvas}>
          Clear
        </Button>
        <Button variant="outline" onClick={saveCanvas}>
          Save
        </Button>
      </div>

      <div className="w-full border border-gray-300 rounded-md">
        <canvas
          ref={canvasRef}
          className="w-full touch-none cursor-crosshair bg-white"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  )
}
