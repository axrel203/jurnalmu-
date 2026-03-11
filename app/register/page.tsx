'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showPw, setShowPw] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', password: '' })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (form.password.length < 6) {
            toast.error('Kata sandi minimal harus 6 karakter')
            return
        }
        setLoading(true)
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        const data = await res.json()
        setLoading(false)

        if (!res.ok) {
            toast.error(data.error || 'Pendaftaran gagal')
        } else {
            toast.success('Akun berhasil dibuat! Silakan masuk 🎉')
            router.push('/login')
        }
    }

    return (
        <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-slide-up">
                <div className="flex items-center justify-center gap-2.5 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-2xl">DayScript</span>
                </div>

                <div className="card p-8">
                    <h1 className="text-2xl font-bold text-center mb-1">Buat akun</h1>
                    <p className="text-[var(--text-secondary)] text-center text-sm mb-7">Mulai perjalanan jurnal Anda</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label">Nama Anda</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                <input
                                    className="input !pl-10"
                                    type="text"
                                    placeholder="(contoh:cantikku🤗)"
                                    required
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                <input
                                    className="input !pl-10"
                                    type="email"
                                    placeholder="anda@contoh.com"
                                    required
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">Kata Sandi</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                <input
                                    className="input !pl-10 !pr-10"
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="Minimal 6 karakter"
                                    required
                                    minLength={6}
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(s => !s)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                >
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sedang mendaftar...</> : 'Daftar Sekarang'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="text-primary-400 font-semibold hover:text-primary-300 transition-colors">Masuk</Link>
                    </p>
                </div>

                <p className="text-center mt-4">
                    <Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">← Kembali ke beranda</Link>
                </p>
            </div>
        </div>
    )
}
