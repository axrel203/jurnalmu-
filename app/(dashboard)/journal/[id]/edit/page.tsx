'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2, PenLine } from 'lucide-react'
import { MOODS } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function EditJournalPage() {
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        title: '', content: '', mood: 'neutral',
        isPublic: false, isPinLocked: false, tags: '',
    })

    useEffect(() => {
        fetch(`/api/journals/${params.id}`)
            .then(r => r.json())
            .then(d => {
                setForm({ title: d.title, content: d.content, mood: d.mood, isPublic: d.isPublic, isPinLocked: d.isPinLocked, tags: d.tags || '' })
                setLoading(false)
            })
    }, [params.id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const res = await fetch(`/api/journals/${params.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        setSaving(false)
        if (res.ok) {
            toast.success('Jurnal diperbarui!')
            router.push(`/journal/${params.id}`)
        } else {
            toast.error('Gagal memperbarui')
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
        </div>
    )

    const wordCount = form.content.split(/\s+/).filter(Boolean).length

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <Link href={`/journal/${params.id}`} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-bold">Edit Entri</h1>
                <span className="ml-auto text-sm text-[var(--text-secondary)]">{wordCount} kata</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="card p-5">
                    <input
                        className="w-full bg-transparent text-2xl font-bold placeholder:text-[var(--text-secondary)]/40 focus:outline-none"
                        placeholder="Judul..."
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        required
                    />
                </div>

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
                                const val = e.target.value;
                                setForm(f => ({ ...f, mood: val || 'neutral' }))
                            }}
                        />
                        <span className="text-sm text-[var(--text-secondary)]">Ketik emoji dari keyboard Anda</span>
                    </div>
                </div>

                <div className="card p-5">
                    <textarea
                        className="w-full bg-transparent min-h-[280px] text-base leading-relaxed placeholder:text-[var(--text-secondary)]/40 focus:outline-none resize-none"
                        placeholder="Tulis di sini..."
                        value={form.content}
                        onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                        required
                    />
                </div>

                <div className="card p-5">
                    <label className="label">Tag</label>
                    <input className="input" placeholder="kerja, refleksi..." value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                </div>

                <div className="card p-5 flex flex-wrap gap-6">
                    {[
                        { key: 'isPinLocked', label: 'Kunci PIN', color: 'bg-amber-500' },
                    ].map(({ key, label, color }) => (
                        <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                            <div
                                onClick={() => setForm(f => ({ ...f, [key]: !f[key as keyof typeof f] }))}
                                className={`w-11 h-6 rounded-full transition-all relative ${(form as any)[key] ? color : 'bg-[var(--border)]'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${(form as any)[key] ? 'left-6' : 'left-1'}`} />
                            </div>
                            <span className="text-sm font-medium">{label}</span>
                        </label>
                    ))}
                </div>

                <div className="flex items-center gap-3 justify-end">
                    <Link href={`/journal/${params.id}`} className="btn-secondary">Batal</Link>
                    <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenLine className="w-4 h-4" />}
                        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </div>
    )
}
