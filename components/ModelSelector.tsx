'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { type Model } from '@/lib/supabase'

interface ModelSelectorProps {
  models: Model[]
  selectedModel: string
  onSelect: (modelTag: string) => void
}

export function ModelSelector({ models, selectedModel, onSelect }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  
  const selected = models.find((m) => m.tag === selectedModel)

  return (
    <div className="relative">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="w-full justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="font-medium">{selected?.name || 'Select model...'}</span>
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-50 mt-2 w-full rounded-lg border bg-popover p-1 shadow-lg">
            {models.map((model) => (
              <button
                key={model.tag}
                onClick={() => {
                  onSelect(model.tag)
                  setOpen(false)
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                  selectedModel === model.tag
                    ? "bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100"
                    : "hover:bg-accent"
                )}
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    selectedModel === model.tag ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col items-start flex-1">
                  <span className="font-medium">{model.name}</span>
                  {model.description && (
                    <span className="text-xs text-muted-foreground">
                      {model.description}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}