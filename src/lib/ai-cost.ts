/**
 * OpenAI API Cost Tracking & Monitoring
 * Logs token usage to analytics_events table and provides cost metrics
 */

import { getSupabase } from './db'

export interface TokenUsage {
  model: string
  inputTokens: number
  outputTokens: number
  feature: 'interpret' | 'gunghap' | 'fortune' | 'movie' | 'ask' | 'premium_report' | 'gunghap_premium_report' | 'scene_image'
  estimatedCost: number // in USD
}

// Cost rates (USD per 1M tokens)
const MODEL_COSTS = {
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4o': { input: 5.0, output: 15.0 },
  'dall-e-3': { input: 0, output: 0.02 }, // per image, not per token
}

/**
 * Calculate estimated cost for a given model and token counts
 */
export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const costs = MODEL_COSTS[model as keyof typeof MODEL_COSTS]
  if (!costs) return 0

  // For DALL-E, cost is per image (outputTokens = 1 for single image)
  if (model === 'dall-e-3') {
    return costs.output * (outputTokens || 1)
  }

  const inputCost = (inputTokens * costs.input) / 1_000_000
  const outputCost = (outputTokens * costs.output) / 1_000_000
  return inputCost + outputCost
}

/**
 * Log token usage to analytics_events table
 */
export async function logTokenUsage(usage: TokenUsage): Promise<void> {
  try {
    const supabase = getSupabase()
    if (!supabase) return

    await supabase.from('analytics_events').insert({
      event_type: 'ai_token_usage',
      user_id: null,
      metadata: {
        model: usage.model,
        input_tokens: usage.inputTokens,
        output_tokens: usage.outputTokens,
        feature: usage.feature,
        estimated_cost_usd: usage.estimatedCost,
      },
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    // Non-critical: log but don't throw
    console.error('Failed to log token usage:', err)
  }
}

/**
 * Get monthly AI cost usage
 */
export async function getMonthlyUsage(): Promise<{
  totalCost: number
  byFeature: Record<string, number>
  byDay: Array<{ date: string; cost: number }>
}> {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return { totalCost: 0, byFeature: {}, byDay: [] }
    }

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('analytics_events')
      .select('metadata, created_at')
      .eq('event_type', 'ai_token_usage')
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd)

    if (error) {
      console.error('Failed to fetch monthly usage:', error)
      return { totalCost: 0, byFeature: {}, byDay: [] }
    }

    let totalCost = 0
    const byFeature: Record<string, number> = {}
    const byDay: Record<string, number> = {}

    for (const event of data || []) {
      const meta = event.metadata as Record<string, unknown>
      const cost = (meta.estimated_cost_usd as number) || 0
      const feature = (meta.feature as string) || 'unknown'
      const date = event.created_at?.split('T')[0] || ''

      totalCost += cost
      byFeature[feature] = (byFeature[feature] || 0) + cost
      byDay[date] = (byDay[date] || 0) + cost
    }

    return {
      totalCost,
      byFeature,
      byDay: Object.entries(byDay)
        .map(([date, cost]) => ({ date, cost }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    }
  } catch (err) {
    console.error('Error getting monthly usage:', err)
    return { totalCost: 0, byFeature: {}, byDay: [] }
  }
}

/**
 * Check if monthly budget is exceeded
 */
export async function checkBudget(): Promise<{
  withinBudget: boolean
  monthlySpend: number
  monthlyBudget: number
}> {
  const monthlyBudget = parseFloat(process.env.OPENAI_MONTHLY_BUDGET || '50')
  const usage = await getMonthlyUsage()

  return {
    withinBudget: usage.totalCost <= monthlyBudget,
    monthlySpend: usage.totalCost,
    monthlyBudget,
  }
}

/**
 * Get recent API calls for admin dashboard
 */
export async function getRecentCalls(limit = 20): Promise<
  Array<{
    timestamp: string
    feature: string
    model: string
    inputTokens: number
    outputTokens: number
    cost: number
  }>
> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('analytics_events')
      .select('metadata, created_at')
      .eq('event_type', 'ai_token_usage')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch recent calls:', error)
      return []
    }

    return (data || []).map((event) => {
      const meta = event.metadata as Record<string, unknown>
      return {
        timestamp: event.created_at || '',
        feature: (meta.feature as string) || 'unknown',
        model: (meta.model as string) || 'unknown',
        inputTokens: (meta.input_tokens as number) || 0,
        outputTokens: (meta.output_tokens as number) || 0,
        cost: (meta.estimated_cost_usd as number) || 0,
      }
    })
  } catch (err) {
    console.error('Error getting recent calls:', err)
    return []
  }
}
