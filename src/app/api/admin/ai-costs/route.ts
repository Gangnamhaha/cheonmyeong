import { NextRequest, NextResponse } from 'next/server'
import { getMonthlyUsage, getRecentCalls, checkBudget } from '@/lib/ai-cost'

/**
 * Admin endpoint for AI cost monitoring
 * GET: Returns monthly/daily AI cost data
 */
export async function GET(req: NextRequest) {
  // Verify admin auth via cookie
  const adminToken = req.cookies.get('admin_token')?.value
  if (!adminToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [monthlyUsage, recentCalls, budget] = await Promise.all([
      getMonthlyUsage(),
      getRecentCalls(20),
      checkBudget(),
    ])

    return NextResponse.json({
      monthlyUsage,
      recentCalls,
      budget,
    })
  } catch (err) {
    console.error('Error fetching AI costs:', err)
    return NextResponse.json(
      { error: 'Failed to fetch AI cost data' },
      { status: 500 }
    )
  }
}
