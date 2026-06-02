const read = (key: string): string => import.meta.env[key] ?? ''

export const env = {
  supabaseUrl: read('VITE_SUPABASE_URL'),
  supabaseAnonKey: read('VITE_SUPABASE_ANON_KEY'),
  geminiApiKey: read('VITE_GEMINI_API_KEY'),
  geminiModel: read('VITE_GEMINI_MODEL'),
  geminiFallbackModel: read('VITE_GEMINI_FALLBACK_MODEL'),
  grokApiKey: read('VITE_GROK_API_KEY'),
  grokModel: read('VITE_GROK_MODEL'),
}
