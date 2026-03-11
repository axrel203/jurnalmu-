'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PenLine, Globe, Lock, Loader2, ChevronLeft } from 'lucide-react'
import { MOODS } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useTheme } from '@/components/ThemeProvider'

export default function NewJournalPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const { theme } = useTheme()
    const [form, setForm] = useState({
        title: '',
        content: '',
        mood: 'neutral',
        isPublic: false,
        isPinLocked: false,
        tags: '',
        coverImage: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title.trim() || !form.content.trim()) {
            toast.error('Judul dan isi jurnal wajib diisi')
            return
        }
        setLoading(true)
        const res = await fetch('/api/journals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        const data = await res.json()
        setLoading(false)
        if (res.ok) {
            toast.success('Jurnal disimpan! ✨')
            router.push(`/journal/${data.id}`)
        } else {
            toast.error(data.error || 'Gagal menyimpan')
        }
    }

    const wordCount = form.content.split(/\s+/).filter(Boolean).length

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/dashboard" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <h1 className={`text-xl font-bold ${theme === 'kitty' ? 'text-pink-600' : ''}`}>
                    Entri Jurnal Baru
                    {theme === 'kitty' && <span className="ml-2">🎀</span>}
                </h1>
                <span className="ml-auto text-sm text-[var(--text-secondary)]">{wordCount} kata</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div className="card p-5">
                    <input
                        className="w-full bg-transparent text-2xl font-bold placeholder:text-[var(--text-secondary)]/40 focus:outline-none"
                        placeholder="Tulis judul entri Anda..."
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        required
                    />
                </div>

                {/* Cover Image Upload */}
                <div className="card p-5 space-y-4">
                    <label className="label flex items-center gap-2">
                        <span className="text-pink-400">🖼️</span> Gambar Sampul (Opsional)
                    </label>
                    {!form.coverImage ? (
                        <label className="flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed border-pink-300 bg-pink-50/50 cursor-pointer hover:bg-pink-100/50 transition-colors">
                            <div className="flex flex-col items-center justify-center py-6">
                                <span className="text-3xl mb-2">📷</span>
                                <p className="text-sm font-medium text-pink-500">Pilih dari Galeri</p>
                                <p className="text-[10px] text-[var(--text-secondary)] mt-1">JPG, PNG, GIF (Maks. 4MB)</p>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    if (file.size > 4 * 1024 * 1024) {
                                        toast.error('Ukuran file maksimal 4MB')
                                        return
                                    }
                                    toast.loading('Mengupload gambar...', { id: 'upload' })
                                    const fd = new FormData()
                                    fd.append('file', file)
                                    const res = await fetch('/api/upload', { method: 'POST', body: fd })
                                    const data = await res.json()
                                    toast.dismiss('upload')
                                    if (res.ok) {
                                        setForm(f => ({ ...f, coverImage: data.url }))
                                        toast.success('Gambar berhasil diupload!')
                                    } else {
                                        toast.error(data.error || 'Gagal upload gambar')
                                    }
                                }}
                            />
                        </label>
                    ) : (
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)] group">
                            <img
                                src={form.coverImage}
                                alt="Cover preview"
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => setForm(f => ({ ...f, coverImage: '' }))}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>

                {/* Mood Selector (Custom) */}
                <div className="card p-5">
                    <p className="label mb-3">Emoji Perasaan Anda</p>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            className="text-4xl w-16 h-16 text-center bg-transparent border-2 border-[var(--border)] rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all"
                            placeholder="😊"
                            maxLength={2}
                            value={form.mood === 'neutral' ? '' : form.mood}
                            onChange={e => {
                                // Only allow emojis or text, keep it short
                                const val = e.target.value;
                                setForm(f => ({ ...f, mood: val || 'neutral' }))
                            }}
                        />
                        <span className="text-sm text-[var(--text-secondary)]">Ketik emoji dari keyboard Anda (contoh: 😻, 😭, 🚀)</span>
                    </div>
                </div>

                {/* Content */}
                <div className="card p-5">
                    <textarea
                        className="w-full bg-transparent min-h-[280px] text-base leading-relaxed placeholder:text-[var(--text-secondary)]/40 focus:outline-none resize-none"
                        placeholder="Apa yang ada di pikiran Anda hari ini? Menulislah dengan bebas..."
                        value={form.content}
                        onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                        required
                    />
                </div>

                {/* Tags */}
                <div className="card p-5">
                    <label className="label">Tag (opsional)</label>
                    <input
                        className="input"
                        placeholder="misal: kerja, keluarga, syukur"
                        value={form.tags}
                        onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    />
                </div>

                {/* Options */}
                <div className="card p-5 flex flex-wrap gap-4">

                    <label className="flex items-center gap-2.5 cursor-pointer group">
                        <div
                            onClick={() => setForm(f => ({ ...f, isPinLocked: !f.isPinLocked }))}
                            className={`w-11 h-6 rounded-full transition-all relative ${form.isPinLocked ? 'bg-amber-500' : 'bg-[var(--border)]'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.isPinLocked ? 'left-6' : 'left-1'}`} />
                        </div>
                        <span className="text-pink-400">🔒</span>
                        <span className="text-sm font-medium">Kunci PIN</span>
                    </label>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 justify-end">
                    <Link href="/dashboard" className="btn-secondary">Batal</Link>
                    <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-lg">💖</span>}
                        {loading ? 'Menyimpan...' : 'Simpan Entri'}
                    </button>
                </div>
            </form>

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
