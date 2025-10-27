'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { supabase } from '@/lib/supabase'
import superjson from 'superjson'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: '/api/trpc',
          async headers() {
            const { data: { session }, error } = await supabase.auth.getSession()
            
            if (error) {
              console.error('❌ Session error:', error)
            }
            
            if (session?.access_token) {
              console.log('✅ Auth token found:', session.access_token.substring(0, 20) + '...')
              return {
                authorization: `Bearer ${session.access_token}`,
              }
            }
            
            console.log('⚠️ No auth token found - user needs to login')
            return {}
          },
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}