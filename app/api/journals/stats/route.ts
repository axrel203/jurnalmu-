import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const journals = await prisma.journal.findMany({
        where: { userId: session.user.id },
        select: { mood: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
    })

    // Count per mood
    const moodCounts: Record<string, number> = {}
    journals.forEach(j => {
        moodCounts[j.mood] = (moodCounts[j.mood] || 0) + 1
    })

    // Streak calculation
    const sortedDates = journals.map(j => new Date(j.createdAt).toDateString())
    const uniqueDates = [...new Set(sortedDates)]
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        if (uniqueDates.includes(d.toDateString())) {
            streak++
        } else {
            break
        }
    }

    // Weekly mood data
    const weeklyData: { date: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toDateString()
        weeklyData.push({
            date: d.toLocaleDateString('en-US', { weekday: 'short' }),
            count: sortedDates.filter(s => s === dateStr).length,
        })
    }

    return NextResponse.json({
        total: journals.length,
        moodCounts,
        streak,
        weeklyData,
    })
}
