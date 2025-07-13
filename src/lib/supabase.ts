// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nsseucqzvtnjecpzeivj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zc2V1Y3F6dnRuamVjcHplaXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMDQwMjIsImV4cCI6MjA2Nzg4MDAyMn0.ldLNthPsWV_HRnBBkRVnZtW_lR3HeAsIFVcm-EmSdkY'


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})