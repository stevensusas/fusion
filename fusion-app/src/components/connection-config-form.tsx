"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

// Define the connection config type
export type ConnectionConfig = {
  value: string
}

// Define the props for the ConnectionConfigForm component
type ConnectionConfigFormProps = {
  itemId: string
  itemName: string
  iconType: string
  isOpen: boolean
  onClose: () => void
  onSave: (itemId: string, config: ConnectionConfig) => void
  initialConfig?: ConnectionConfig
}

// Get field configuration based on icon type
const getFieldConfig = (iconType: string) => {
  switch (iconType) {
    case "postgres":
      return {
        label: "Database Connection String",
        placeholder: "postgresql://username:password@localhost:5432/dbname",
        title: "PostgreSQL Connection"
      }
    case "redis":
      return {
        label: "Redis URL",
        placeholder: "redis://username:password@localhost:6379",
        title: "Redis Connection"
      }
    case "github":
      return {
        label: "Personal Access Token",
        placeholder: "ghp_xxxxxxxxxxxxxxxxxxxx",
        title: "GitHub Authentication"
      }
    case "sentry":
      return {
        label: "Auth Token",
        placeholder: "sentry_xxxxxxxxxxxxxxxxxxxxxxx",
        title: "Sentry Configuration"
      }
    default:
      return {
        label: "Configuration",
        placeholder: "Enter configuration value",
        title: "Service Configuration"
      }
  }
}

export function ConnectionConfigForm({
  itemId,
  itemName,
  iconType,
  isOpen,
  onClose,
  onSave,
  initialConfig = { value: "" },
}: ConnectionConfigFormProps) {
  // State for the connection config
  const [config, setConfig] = useState<ConnectionConfig>(initialConfig)
  
  // Get field configuration
  const fieldConfig = getFieldConfig(iconType)

  // Function to update the config
  const updateConfig = (value: string) => {
    setConfig({ value })
  }

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(itemId, config)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{fieldConfig.title} for {itemName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="config-value">{fieldConfig.label}</Label>
              <Input
                id="config-value"
                value={config.value}
                onChange={(e) => updateConfig(e.target.value)}
                placeholder={fieldConfig.placeholder}
                type={iconType === "github" || iconType === "sentry" ? "password" : "text"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 