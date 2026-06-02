import { env } from '../../core/config/env'
import { http } from '../../core/lib/http'
import type { GeminiEvaluation } from '../../domain/types'

const DEFAULT_MODEL = 'gemini-2.5-flash'
const DEFAULT_FALLBACK_MODEL = 'gemini-2.5-flash-lite'
const DEFAULT_GROK_MODEL = 'grok-4.3'

export const getGeminiApiKey = (): string => {
  try {
    const currentUserId = localStorage.getItem('current_user_id')
    if (currentUserId) {
      const perUser = localStorage.getItem(`gemini_api_key_${currentUserId}`)
      if (perUser) return perUser
    }
  } catch {
    // ignore storage errors
  }
  return (localStorage.getItem('gemini_api_key') || env.geminiApiKey || '').trim()
}

export const getGrokApiKey = (): string => {
  try {
    const currentUserId = localStorage.getItem('current_user_id')
    if (currentUserId) {
      const perUser = localStorage.getItem(`grok_api_key_${currentUserId}`)
      if (perUser) return perUser
    }
  } catch { /* ignore */ }
  return (localStorage.getItem('grok_api_key') || env.grokApiKey || '').trim()
}

export const fetchGoogleDocText = async (url: string): Promise<string> => {
  const documentId = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/)?.[1]
  if (!documentId) throw new Error('INVALID_GOOGLE_DOC_URL')

  try {
    const response = await fetch(`https://docs.google.com/document/d/${documentId}/export?format=txt`)
    if (!response.ok) throw new Error('GOOGLE_DOC_FETCH_FAILED')
    const text = (await response.text()).trim()
    if (text.length < 20) throw new Error('GOOGLE_DOC_EMPTY')
    return text
  } catch (err) {
    if (err instanceof Error && ['GOOGLE_DOC_FETCH_FAILED', 'GOOGLE_DOC_EMPTY'].includes(err.message)) {
      throw err
    }
    throw new Error('GOOGLE_DOC_FETCH_FAILED', { cause: err })
  }
}

const extractJsonObject = (raw: string): string => {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  try {
    JSON.parse(cleaned)
    return cleaned
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start >= 0 && end > start) {
      return cleaned.slice(start, end + 1)
    }
    return cleaned
  }
}

const parseModelJson = (raw: string): GeminiEvaluation => {
  const parsed = JSON.parse(extractJsonObject(raw)) as Partial<GeminiEvaluation>

  if (typeof parsed.overall_score !== 'number' || !Array.isArray(parsed.criterion_scores)) {
    throw new Error('AI provider returned an incomplete evaluation structure.')
  }

  return {
    overall_score: parsed.overall_score,
    criterion_scores: parsed.criterion_scores,
    strengths: parsed.strengths ?? [],
    improvements: parsed.improvements ?? [],
    suggestions: parsed.suggestions ?? [],
    reflective_questions: parsed.reflective_questions ?? [],
    risk_flags: parsed.risk_flags ?? [],
    ready_for_review: parsed.ready_for_review ?? parsed.overall_score >= 70,
  }
}

/**
 * Builds the final model prompt by combining mentor instructions with the
 * rubric and submission text. Only essential response-format rules are added
 * so the UI receives a parseable JSON object.
 */
const buildPrompt = (payload: {
  submissionText: string
  rubricText: string
  promptText: string
}): string => `${payload.promptText.trim()}

Rubric:
${payload.rubricText}

Submitted plan:
${payload.submissionText}

Return only valid JSON with this exact structure:
{
  "overall_score": <integer 0-100>,
  "criterion_scores": [
    {
      "criterion": "<exact rubric criterion name>",
      "score": <integer>,
      "max_score": <integer>,
      "reasoning": "<string>",
      "evidence": "<string>"
    }
  ],
  "strengths": ["<string>"],
  "improvements": ["<string>"],
  "suggestions": ["<string>"],
  "reflective_questions": ["<string>"],
  "risk_flags": ["<string>"],
  "ready_for_review": <true | false>
}`

const requestGeminiModel = async (
  model: string,
  prompt: string,
  apiKey: string,
): Promise<GeminiEvaluation> => {
  let response
  try {
    response = await http.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
      },
      { headers: { 'x-goog-api-key': apiKey } },
    )
  } catch (err: unknown) {
    // Surface rate-limit and auth errors immediately — no point retrying other models
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 429) throw new Error('RATE_LIMITED', { cause: err })
    if (status === 400) throw new Error('BAD_REQUEST', { cause: err })
    if (status === 403) throw new Error('INVALID_API_KEY', { cause: err })
    throw err
  }

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error(`Empty response from model ${model}`)

  return parseModelJson(text)
}

const requestGrokModel = async (
  model: string,
  prompt: string,
  apiKey: string,
): Promise<GeminiEvaluation> => {
  let response
  try {
    response = await http.post(
      'https://api.x.ai/v1/chat/completions',
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      },
      { headers: { Authorization: `Bearer ${apiKey}` } },
    )
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 429) throw new Error('RATE_LIMITED', { cause: err })
    if (status === 400) throw new Error('BAD_REQUEST', { cause: err })
    if (status === 401 || status === 403) throw new Error('INVALID_API_KEY', { cause: err })
    throw err
  }

  const text = response.data?.choices?.[0]?.message?.content
  if (!text) throw new Error('Empty response from Grok')

  return parseModelJson(text)
}

export const geminiService = {
  async evaluateSubmission(payload: {
    submissionText: string
    rubricText: string
    promptText: string
  }): Promise<GeminiEvaluation> {
    const geminiKey = getGeminiApiKey()
    const grokKey = getGrokApiKey()

    if (!geminiKey && !grokKey) throw new Error('NO_API_KEY')

    const prompt = buildPrompt(payload)
    const terminalErrors = new Set(['RATE_LIMITED', 'INVALID_API_KEY', 'BAD_REQUEST'])

    let lastGeminiError: unknown

    // Try Gemini models first if a key is set
    if (geminiKey) {
      const models = [
        ...new Set(
          [env.geminiModel || DEFAULT_MODEL, env.geminiFallbackModel || DEFAULT_FALLBACK_MODEL, DEFAULT_MODEL].filter(Boolean),
        ),
      ]
      for (const model of models) {
        try {
          return await requestGeminiModel(model, prompt, geminiKey)
        } catch (err: unknown) {
          lastGeminiError = err
          // Stop trying more Gemini models but still allow the other configured provider below.
          if (terminalErrors.has((err as Error)?.message)) break
        }
      }
    }

    // Fall back to Grok if a key is set
    if (grokKey) {
      return await requestGrokModel(env.grokModel || DEFAULT_GROK_MODEL, prompt, grokKey)
    }

    throw lastGeminiError ?? new Error('All AI providers failed. Please check your API keys and try again.')
  },
}

