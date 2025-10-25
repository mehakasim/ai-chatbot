import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Message = {
  id: string
  user_id: string
  model_tag: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export type Model = {
  id: string
  tag: string
  name: string
  description: string | null
  created_at: string
}