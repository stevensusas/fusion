"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type ChatPopupProps = {
  isOpen: boolean
  onClose: () => void
  serverUrl: string
  serverName: string
}

export function ChatPopup({ isOpen, onClose, serverUrl, serverName }: ChatPopupProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Send message to the API
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    
    // Add user message to the chat
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    
    // Set loading state
    setIsLoading(true)
    
    try {
      // Call the API
      const response = await fetch(`${serverUrl}/api/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: userMessage }),
      })
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Add assistant message
      setMessages(prev => [...prev, { role: "assistant", content: data.response }])
    } catch (error) {
      console.error("Failed to send message:", error)
      // Add error message
      setMessages(prev => [
        ...prev, 
        { 
          role: "assistant", 
          content: "Sorry, I couldn't process your request. There was an error communicating with the server." 
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) return null
  
  return (
    <div className="fixed bottom-4 right-4 w-80 sm:w-96 h-[500px] bg-white rounded-lg shadow-lg flex flex-col overflow-hidden border border-gray-200 z-50">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="font-semibold">Chat with {serverName}</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Send a message to start chatting with the composite server
            </p>
          ) : (
            messages.map((message, i) => (
              <div key={i} className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "assistant" 
                      ? "bg-gray-100 text-gray-900" 
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-gray-100">
                <div className="flex space-x-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
} 