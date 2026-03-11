'use client'
import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { getMoodInfo, MOODS } from '@/lib/utils'
import { BookOpen, Flame, Star, Loader2 } from 'lucide-react'

interface StatsData {
    totalEntries: number; streak: number; moodCounts: Record<string, number>;
    weeklyData: { day: string; count: number }[]; topMood: string
}

export default function StatsPage() {
    const [data, setData] = useState<StatsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/journals/stats')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false) })
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
        </div>
    )

    if (!data) return null

    const moodChartData = MOODS.map(m => ({
        name: m.label,
        value: data.moodCounts[m.value] || 0,
        color: m.color.includes('yellow') ? '#fbbf24' : m.color.includes('orange') ? '#fb923c' : m.color.includes('blue') ? '#60a5fa' : m.color.includes('indigo') ? '#818cf8' : m.color.includes('red') ? '#f87171' : m.color.includes('purple') ? '#c084fc' : m.color.includes('green') ? '#4ade80' : '#9ca3af'
    })).filter(d => d.value > 0)

    const topMoodInfo = getMoodInfo(data.topMood || 'neutral')

    return (
        <div className="animate-fade-in space-y-6">
            <h1 className="text-2xl font-bold mb-6">Analisis Jurnal Anda</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">Total Entri</p>
                        <p className="text-2xl font-bold">{data.totalEntries}</p>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                        <Flame className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">Streak Menulis</p>
                        <p className="text-2xl font-bold">{data.streak} Hari</p>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-xl">
                        {topMoodInfo.emoji}
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">Mood Terbanyak</p>
                        <p className="text-2xl font-bold">{topMoodInfo.label}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mood Distribution */}
                <div className="card p-6">
                    <h3 className="font-semibold mb-6">Distribusi Mood</h3>
                    <div className="h-[300px] w-full">
                        {moodChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={moodChartData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {moodChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                                        itemStyle={{ color: 'var(--text-primary)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-[var(--text-secondary)] text-sm">
                                Belum ada data untuk ditampilkan
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                        {moodChartData.map(m => (
                            <div key={m.name} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                                {m.name}: {m.value}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weekly Activity */}
                <div className="card p-6">
                    <h3 className="font-semibold mb-6">Aktivitas Mingguan</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'var(--card-hover)', opacity: 0.4 }}
                                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                                />
                                <Bar dataKey="count" fill="var(--primary-500)" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
