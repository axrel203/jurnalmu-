'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { PenLine, Search, SlidersHorizontal, BookOpen, Loader2, X } from 'lucide-react'
import { getMoodInfo, formatDate, formatRelative, truncate, MOODS } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useTheme } from '@/components/ThemeProvider'

interface Journal {
    id: string; title: string; content: string; mood: string; isPublic: boolean; isPinLocked: boolean; createdAt: string
}

export default function DashboardPage() {
    const { data: session } = useSession()
    const [journals, setJournals] = useState<Journal[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [moodFilter, setMoodFilter] = useState('')
    const { theme } = useTheme()
    const [showFilters, setShowFilters] = useState(false)

    const fetchJournals = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (moodFilter) params.set('mood', moodFilter)
        const res = await fetch(`/api/journals?${params}`)
        const data = await res.json()
        setJournals(Array.isArray(data) ? data : [])
        setLoading(false)
    }, [search, moodFilter])

    useEffect(() => {
        const t = setTimeout(fetchJournals, 300)
        return () => clearTimeout(t)
    }, [fetchJournals])

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault()
        if (!confirm('Hapus entri jurnal ini?')) return
        const res = await fetch(`/api/journals/${id}`, { method: 'DELETE' })
        if (res.ok) {
            setJournals(js => js.filter(j => j.id !== id))
            toast.success('Jurnal dihapus')
        } else {
            toast.error('Gagal menghapus')
        }
    }

    const getTimeGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 11) return 'pagi'
        if (hour < 15) return 'siang'
        if (hour < 18) return 'sore'
        return 'malam'
    }

    const totalWords = journals.reduce((acc, j) => acc + j.content.split(' ').length, 0)

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        Selamat {getTimeGreeting()},{' '}
                        <span className={theme === 'kitty' ? 'text-pink-500' : 'gradient-text'}>
                            {session?.user?.name?.split(' ')[0]}
                            {theme === 'kitty' ? ' 🎀' : ' 👋'}
                        </span>
                    </h1>
                    <p className="text-[var(--text-secondary)] text-sm mt-1">{journals.length} entri · {totalWords.toLocaleString()} kata ditulis</p>
                </div>
                <Link href="/journal/new" className="btn-primary flex items-center gap-2 self-start sm:self-auto shadow-[0_4px_0_0_#ff3366] hover:scale-105 transition-transform">
                    <span className="text-xl">🎀</span> Entri Baru
                </Link>
            </div>

            {/* Search + Filter */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400">🔍</span>
                    <input
                        className="input !pl-10"
                        placeholder="Cari jurnal..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setShowFilters(f => !f)}
                    className={`btn-secondary flex items-center gap-2 px-4 ${showFilters ? 'border-primary-500/50 text-primary-400' : ''}`}
                >
                    <span className="text-pink-400">🎀</span>
                    <span className="hidden sm:inline">Filter</span>
                </button>
            </div>

            {/* Mood Filter */}
            {
                showFilters && (
                    <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
                        <button
                            onClick={() => setMoodFilter('')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${!moodFilter ? 'bg-primary-500/20 border-primary-500/50 text-primary-400' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-primary-500/30'}`}
                        >
                            Semua
                        </button>
                        {MOODS.map(mood => (
                            <button
                                key={mood.value}
                                onClick={() => setMoodFilter(mood.value === moodFilter ? '' : mood.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all flex items-center gap-1.5 ${moodFilter === mood.value ? `${mood.bg} ${mood.border} ${mood.color}` : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]/30'}`}
                            >
                                {mood.emoji} {mood.label}
                            </button>
                        ))}
                    </div>
                )
            }

            {/* Journal List */}
            {
                loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
                    </div>
                ) : journals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in relative">
                        {theme === 'kitty' && (
                            <div className="mb-6 floating">
                                <img
                                    src="/hello_kitty_mascot.png"
                                    alt="Hello Kitty Mascot"
                                    className="w-32 h-32 object-contain drop-shadow-lg"
                                />
                            </div>
                        )}
                        {theme !== 'kitty' && (
                            <div className="w-20 h-20 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-4">
                                <BookOpen className="w-9 h-9 text-primary-400/60" />
                            </div>
                        )}
                        <h3 className="text-lg font-semibold mb-2">{search || moodFilter ? 'Tidak ada hasil ditemukan' : 'Belum ada entri jurnal'}</h3>
                        <p className="text-[var(--text-secondary)] text-sm mb-6 max-w-xs">
                            {search || moodFilter ? 'Coba cari atau filter dengan kata lain' : 'Mulai menulis entri pertama Anda hari ini!'}
                        </p>
                        {!search && !moodFilter && (
                            <Link href="/journal/new" className="btn-primary flex items-center gap-2">
                                <PenLine className="w-4 h-4" /> Tulis Entri Pertama
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {journals.map(journal => {
                            const mood = getMoodInfo(journal.mood)
                            return (
                                <Link
                                    key={journal.id}
                                    href={`/journal/${journal.id}`}
                                    className="card card-hover p-5 block group animate-slide-up"
                                >
                                    {/* Mood + Date */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${mood.bg} ${mood.color} border ${mood.border}`}>
                                            {mood.emoji} {mood.label}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {journal.isPublic && <span className="text-xs text-green-400 border border-green-400/40 rounded-md px-1.5 py-0.5">Publik</span>}
                                            {journal.isPinLocked && <span className="text-xs">🔒</span>}
                                            <span className="text-xs text-[var(--text-secondary)]">{formatRelative(journal.createdAt)}</span>
                                        </div>
                                    </div>

                                    <h3 className="font-semibold text-base mb-1.5 group-hover:text-primary-400 transition-colors line-clamp-1">
                                        {journal.title}
                                    </h3>
                                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                                        {journal.isPinLocked ? '🔒 Entri ini dilindungi PIN' : truncate(journal.content, 150)}
                                    </p>

                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
                                        <span className="text-xs text-[var(--text-secondary)]">{formatDate(journal.createdAt)}</span>
                                        <button
                                            onClick={e => handleDelete(journal.id, e)}
                                            className="text-xs text-[var(--text-secondary)] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )
            }

            {
                theme === 'kitty' && (
                    <div className="fixed bottom-6 right-6 w-24 h-24 pointer-events-none z-10 animate-fade-in floating opacity-80">
                        <img
                            src="/hello_kitty_mascot.png"
                            alt="Hello Kitty Sticker"
                            className="w-full h-full object-contain drop-shadow-xl"
                        />
                    </div>
                )
            }
        </div >
    )
}
