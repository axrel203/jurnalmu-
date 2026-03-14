'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Edit2, Trash2, Globe, Lock, ChevronLeft, Share2, Loader2, Heart, RotateCcw } from 'lucide-react'
import { getMoodInfo, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useTheme } from '@/components/ThemeProvider'
import PatternLock from '@/components/PatternLock'

interface Journal {
    id: string; title: string; content: string; mood: string;
    isPublic: boolean; isPinLocked: boolean; tags: string; createdAt: string; updatedAt: string; coverImage?: string
}

export default function JournalDetailPage() {
    const { theme } = useTheme()
    const params = useParams()
    const router = useRouter()
    const [journal, setJournal] = useState<Journal | null>(null)
    const [loading, setLoading] = useState(true)
    const [pinInput, setPinInput] = useState('')
    const [pinVerified, setPinVerified] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [lockType, setLockType] = useState('PIN')
    const [patternResetTrigger, setPatternResetTrigger] = useState(0)

    useEffect(() => {
        fetch(`/api/journals/${params.id}`)
            .then(r => r.json())
            .then(d => { setJournal(d); setLoading(false) })
            .catch(() => { toast.error('Gagal memuat'); setLoading(false) })
    }, [params.id])

    const handleDelete = async () => {
        if (!confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) return
        setDeleting(true)
        const res = await fetch(`/api/journals/${params.id}`, { method: 'DELETE' })
        if (res.ok) {
            toast.success('Jurnal dihapus')
            router.push('/dashboard')
        } else {
            toast.error('Gagal menghapus')
            setDeleting(false)
        }
    }

    const handleVerifyPin = async (patternCode?: string) => {
        setVerifying(true)
        const body = lockType === 'PATTERN' 
            ? { pattern: patternCode } 
            : { pin: pinInput }
            
        const res = await fetch('/api/verify-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
        const data = await res.json()
        setVerifying(false)
        if (data.valid) {
            setPinVerified(true)
            toast.success('Kunci terbuka!')
        } else {
            toast.error(data.error || 'Kunci salah')
            setPinInput('')
            if (lockType === 'PATTERN') {
                setPatternResetTrigger(t => t + 1)
            }
        }
    }

    const copyShareLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/public/${params.id}`)
        toast.success('Tautan berbagi disalin!')
    }

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
        </div>
    )

    if (!journal) return (
        <div className="text-center py-20">
            <p className="text-[var(--text-secondary)]">Jurnal tidak ditemukan.</p>
            <Link href="/dashboard" className="text-primary-400 mt-4 inline-block">← Kembali ke Beranda</Link>
        </div>
    )

    const mood = getMoodInfo(journal.mood)

    // Lock wall
    if (journal.isPinLocked && !pinVerified) {
        return (
            <div className="max-w-sm mx-auto mt-20 animate-slide-up">
                <div className="card p-8 text-center">
                    <div className="text-4xl mb-4">🔒</div>
                    <h2 className="text-xl font-bold mb-1">Jurnal Terkunci</h2>
                    <p className="text-[var(--text-secondary)] text-sm mb-6">
                        Masukkan {lockType === 'PATTERN' ? 'Pola' : 'PIN'} untuk membuka entri ini
                    </p>
                    
                    {lockType === 'PATTERN' ? (
                        <div className="mt-4">
                            <PatternLock 
                                onComplete={handleVerifyPin} 
                                resetTrigger={patternResetTrigger}
                                size={280}
                            />
                            <button 
                                onClick={() => setPatternResetTrigger(t => t + 1)} 
                                className="mt-6 mx-auto btn-secondary flex items-center justify-center gap-2 text-sm w-full"
                            >
                                <RotateCcw className="w-4 h-4" /> Ulangi Gambar
                            </button>
                        </div>
                    ) : (
                        <div>
                            <input
                                type="password"
                                inputMode="numeric"
                                maxLength={6}
                                className="input text-center text-2xl tracking-widest mb-4"
                                placeholder="······"
                                value={pinInput}
                                onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                                onKeyDown={e => e.key === 'Enter' && handleVerifyPin()}
                            />
                            <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={() => handleVerifyPin()} disabled={verifying || !pinInput}>
                                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Buka Kunci
                            </button>
                        </div>
                    )}
                    <Link href="/dashboard" className="block mt-4 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">← Kembali</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            {/* Back */}
            <div className="flex items-center justify-between mb-6">
                <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Beranda
                </Link>
                <div className="flex items-center gap-2">
                    {journal.isPublic && (
                        <button onClick={copyShareLink} className="btn-secondary flex items-center gap-1.5 !py-1.5 !px-3 text-sm">
                            <span className="text-xs">🌍</span> Bagikan
                        </button>
                    )}
                    <Link href={`/journal/${journal.id}/edit`} className="btn-secondary flex items-center gap-1.5 !py-1.5 !px-3 text-sm">
                        <span className="text-xs">✏️</span> Edit
                    </Link>
                    <button onClick={handleDelete} className="btn-danger flex items-center gap-1.5 !py-1.5 !px-3 text-sm" disabled={deleting}>
                        {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="text-xs">🗑️</span>} Hapus
                    </button>
                </div>
            </div>

            {/* Journal Content */}
            <div className="card overflow-hidden">
                {/* Cover Image */}
                {journal.coverImage && (
                    <div className="w-full aspect-[21/9] overflow-hidden border-b border-[var(--border)]">
                        <img
                            src={journal.coverImage}
                            alt={journal.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="p-6 sm:p-8">
                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold ${mood.bg} ${mood.color} border ${mood.border}`}>
                            {mood.emoji}
                        </span>
                        {journal.isPublic && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-green-500/40 text-green-400 bg-green-400/10">
                                <span className="text-xs">🌍</span> Publik
                            </span>
                        )}
                        {journal.isPinLocked && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-amber-500/40 text-amber-400 bg-amber-400/10">
                                <span className="text-xs">🔒</span> Terkunci PIN
                            </span>
                        )}
                        <span className="ml-auto text-sm text-[var(--text-secondary)]">{formatDate(journal.createdAt)}</span>
                    </div>

                    <h1 className={`text-2xl sm:text-3xl font-bold mb-5 ${theme === 'kitty' ? 'text-pink-600' : ''}`}>
                        {journal.title}
                        {theme === 'kitty' && <span className="ml-2">💖</span>}
                    </h1>

                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-[var(--text-primary)]/90 leading-relaxed whitespace-pre-wrap text-base sm:text-lg">
                            {journal.content}
                        </p>
                    </div>

                    {journal.tags && (
                        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-[var(--border)]">
                            {journal.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                                <span key={tag} className="px-2.5 py-1 rounded-lg bg-primary-500/10 text-primary-400 text-xs font-medium">#{tag}</span>
                            ))}
                        </div>
                    )}

                    <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                        <span>Ditulis: {formatDate(journal.createdAt)}</span>
                        {journal.updatedAt !== journal.createdAt && <span>Diedit: {formatDate(journal.updatedAt)}</span>}
                        <span>{journal.content.split(/\s+/).filter(Boolean).length} kata</span>
                    </div>
                </div>
            </div>

            {theme === 'kitty' && (
                <div className="fixed bottom-6 right-6 w-24 h-24 pointer-events-none z-10 animate-fade-in floating opacity-80">
                    <img
                        src="/hello_kitty_mascot.png"
                        alt="Hello Kitty Mascot"
                        className="w-full h-full object-contain drop-shadow-xl"
                    />
                </div>
            )}
        </div>
    )
}
