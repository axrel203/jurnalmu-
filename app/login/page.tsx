'use client'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showPw, setShowPw] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [form, setForm] = useState({ email: '', password: '' })

    // Load saved email on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('remembered_email')
        if (savedEmail) {
            setForm(f => ({ ...f, email: savedEmail }))
            setRememberMe(true)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rememberMe) {
            localStorage.setItem('remembered_email', form.email)
        } else {
            localStorage.removeItem('remembered_email')
        }
        setLoading(true)

        if (!navigator.geolocation) {
            setLoading(false)
            toast.error('Browser Anda tidak mendukung geolokasi')
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords

                const res = await signIn('credentials', {
                    email: form.email,
                    password: form.password,
                    lat: latitude.toString(),
                    lng: longitude.toString(),
                    redirect: false,
                })
                
                setLoading(false)
                
                if (res?.error) {
                    toast.error('Email atau password salah')
                } else {
                    toast.success('Selamat datang kembali! 🎉')
                    router.push('/dashboard')
                    router.refresh()
                }
            },
            (error) => {
                setLoading(false)
                toast.error('Akses lokasi diperlukan untuk login. Harap izinkan akses lokasi.')
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
    }

    return (
        <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2.5 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-2xl">DayScript</span>
                </div>

                <div className="card p-8">
                    <h1 className="text-2xl font-bold text-center mb-1">Selamat datang</h1>
                    <p className="text-[var(--text-secondary)] text-center text-sm mb-7">Masuk ke jurnal Anda</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                    placeholder="••••••••"
                                    required
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

                        {/* Remember Me */}
                        <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                            <div
                                onClick={() => setRememberMe(v => !v)}
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${rememberMe
                                    ? 'bg-primary-500 border-primary-500'
                                    : 'border-[var(--border)] group-hover:border-primary-400'
                                    }`}
                            >
                                {rememberMe && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                                Ingat email saya
                            </span>
                        </label>

                        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sedang masuk...</> : 'Masuk'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
                        Belum punya akun?{' '}
                        <Link href="/register" className="text-primary-400 font-semibold hover:text-primary-300 transition-colors">
                            Buat akun baru
                        </Link>
                    </p>
                </div>

                <p className="text-center mt-4">
                    <Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">← Kembali ke beranda</Link>
                </p>
            </div>
        </div>
    )
}
