'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ModelSelector } from '@/components/ModelSelector'
import { ChatMessage } from '@/components/ChatMessage'
import { TypingIndicator } from '@/components/TypingIndicator'
import { MessageSquare, Send, LogOut, Loader2, AlertCircle } from 'lucide-react'
import { type Message } from '@/lib/supabase'

export default function ChatPage() {
  const router = useRouter()
  const [selectedModel, setSelectedModel] = useState('')
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
      }
    }
    checkAuth()
  }, [router])

  // Fetch models
  const { data: models, isLoading: modelsLoading } = trpc.models.getAvailable.useQuery()

  // Fetch messages
  const { data: messages, refetch: refetchMessages } = trpc.chat.history.useQuery(
    { limit: 100 },
    { refetchOnMount: true }
  )

  // Combine real messages with optimistic messages
  const displayMessages = [...(messages || []), ...optimisticMessages]

  // Send message mutation
  const sendMutation = trpc.chat.send.useMutation({
    onSuccess: () => {
      setOptimisticMessages([])
      refetchMessages()
      setIsTyping(false)
    },
    onError: () => {
      setOptimisticMessages([])
      setIsTyping(false)
    },
  })

  // Delete message mutation
  const deleteMutation = trpc.chat.delete.useMutation({
    onSuccess: () => {
      refetchMessages()
    },
  })

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayMessages, isTyping])

  // Select first model when available
  useEffect(() => {
    if (models && models.length > 0 && !selectedModel) {
      setSelectedModel(models[0].tag)
    }
  }, [models, selectedModel])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const prompt = input.trim()
    setInput('')
    setIsTyping(true)

    // Create optimistic user message (shows immediately)
    const optimisticUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      user_id: 'current-user',
      model_tag: selectedModel,
      role: 'user',
      content: prompt,
      created_at: new Date().toISOString(),
    }

    // Show user message immediately
    setOptimisticMessages([optimisticUserMessage])

    try {
      console.log('🚀 Sending message:', { modelTag: selectedModel, prompt })
      await sendMutation.mutateAsync({
        modelTag: selectedModel,
        prompt,
      })
      console.log('✅ Message sent successfully')
    } catch (error: any) {
      console.error('❌ Send error:', error)
      setOptimisticMessages([])
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleDelete = (messageId: string) => {
    deleteMutation.mutate({ messageId })
  }

  if (modelsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Chat
              </h1>
              <p className="text-xs text-muted-foreground">Powered by multiple models</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Model Selector */}
        <div className="mb-4">
          {models && (
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onSelect={setSelectedModel}
            />
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {displayMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="text-6xl">👋</div>
                <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">
                  Start a conversation
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Select a model above and send your first message to begin chatting with AI
                </p>
              </div>
            </div>
          ) : (
            <>
              {displayMessages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onDelete={handleDelete}
                  canDelete={message.role === 'user' && !message.id.startsWith('temp-')}
                />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
          {sendMutation.isError && (
            <div className="mb-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>Failed to send message. Please try again.</span>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isTyping}
              className="flex-1 border-slate-300 dark:border-slate-600 focus-visible:ring-blue-500"
            />
            <Button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6"
            >
              {isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI responses may not always be accurate. Always verify important information.
          </p>
        </div>
      </main>
    </div>
  )
}