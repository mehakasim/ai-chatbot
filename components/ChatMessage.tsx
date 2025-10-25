'use client'

import { type Message } from '@/lib/supabase'
import { Bot, User, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from './ui/button'

interface ChatMessageProps {
  message: Message
  onDelete?: (id: string) => void
  canDelete?: boolean
}

export function ChatMessage({ message, onDelete, canDelete }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const time = format(new Date(message.created_at), 'h:mm a')

  return (
    <div
      className={cn(
        "flex gap-3 mb-4 animate-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isUser
            ? "bg-gradient-to-br from-blue-500 to-indigo-600"
            : "bg-gradient-to-br from-purple-500 to-pink-600"
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col max-w-[75%] md:max-w-[65%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 shadow-sm",
            isUser
              ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1.5 px-2">
          <span className="text-xs text-muted-foreground">{time}</span>
          {canDelete && isUser && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-red-100 dark:hover:bg-red-900/20"
              onClick={() => onDelete(message.id)}
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}