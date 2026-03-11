'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, User, Calendar, Sparkles } from 'lucide-react'
import { getMoodInfo, formatDate } from '@/lib/utils'

interface PublicJournal {
    id: string; title: string; content: string; mood: string; createdAt: string;
    user: { name: string }
}

export default function PublicJournalView() {
    const params = useParams()
    const [journal, setJournal] = useState<PublicJournal | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`/api/journals/public/${params.id}`)
            .then(r => r.json())
            .then(d => { setJournal(d); setLoading(false) })
            .catch(() => setLoading(false))
    }, [params.id])

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (!journal || (journal as any).error) return (
        <div className="min-h-screen hero-gradient flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-[var(--text-secondary)] mb-8">Jurnal tidak ditemukan atau tidak bersifat publik.</p>
            <Link href="/" className="btn-primary">Kembali ke Beranda</Link>
        </div>
    )

    const mood = getMoodInfo(journal.mood)

    return (
        <div className="min-h-screen hero-gradient p-6 pb-20">
            <nav className="max-w-3xl mx-auto flex items-center justify-between mb-12">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg">
                        <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-xl">DayScript</span>
                </Link>
                <Link href="/register" className="text-sm font-medium text-primary-400 hover:text-primary-300">Buat Jurnal Anda Sendiri</Link>
            </nav>

            <article className="max-w-3xl mx-auto card p-8 sm:p-12 animate-fade-in shadow-2xl">
                <header className="mb-8 border-b border-[var(--border)] pb-8 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mb-6 shadow-sm border" style={{ backgroundColor: `var(--${mood.value}-bg)`, color: `var(--${mood.value}-text)` }}>
                        {mood.emoji}
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold mb-6 leading-tight">{journal.title}</h1>

                    <div className="flex items-center justify-center gap-6 text-sm text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            <span>{journal.user.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(journal.createdAt)}</span>
                        </div>
                    </div>
                </header>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed text-[var(--text-primary)] opacity-90">
                        {journal.content}
                    </p>
                </div>

                <footer className="mt-12 pt-8 border-t border-[var(--border)] text-center">
                    <p className="text-[var(--text-secondary)] mb-6 text-sm">Disukai cerita ini? Mulai perjalanan menulis Anda hari ini.</p>
                    <Link href="/register" className="btn-primary inline-flex items-center gap-2 !px-8 !py-4">
                        Mulai Menulis Gratis <Sparkles className="w-4 h-4" />
                    </Link>
                </footer>
            </article>

            <div className="text-center mt-12 text-sm text-[var(--text-secondary)]">
                Dibagikan melalui <strong>DayScript</strong> · Jurnal Digital Pribadi Anda
            </div>
        </div>
    )
}
