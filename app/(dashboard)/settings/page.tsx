'use client'
import { useState, useEffect } from 'react'
import { User, Shield, Moon, Sun, Lock, Loader2, Save } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import toast from 'react-hot-toast'

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme()
    const [loading, setLoading] = useState(false)
    const [profile, setProfile] = useState({ name: '', email: '', hasPin: false })
    const [form, setForm] = useState({ name: '', pin: '', currentPassword: '', newPassword: '' })

    useEffect(() => {
        fetch('/api/user').then(r => r.json()).then(d => {
            setProfile(d)
            setForm(f => ({ ...f, name: d.name }))
        })
    }, [])

    const handleUpdate = async (type: 'profile' | 'pin' | 'password') => {
        setLoading(true)
        const body: any = {}
        if (type === 'profile') body.name = form.name
        if (type === 'pin') body.pin = form.pin
        if (type === 'password') {
            body.currentPassword = form.currentPassword
            body.newPassword = form.newPassword
        }

        const res = await fetch('/api/user', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
        const data = await res.json()
        setLoading(false)

        if (res.ok) {
            toast.success('Pengaturan diperbarui!')
            if (type === 'pin') setProfile(p => ({ ...p, hasPin: !!form.pin }))
            setForm(f => ({ ...f, pin: '', currentPassword: '', newPassword: '' }))
        } else {
            toast.error(data.error || 'Terjadi kesalahan')
        }
    }

    return (
        <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
            <h1 className="text-2xl font-bold mb-6">Pengaturan</h1>

            {/* Profile */}
            <div className="card p-6">
                <div className="flex items-center gap-2 mb-6 text-primary-400">
                    <User className="w-5 h-5" />
                    <h3 className="font-semibold">Profil Pengguna</h3>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="label">Nama Lengkap</label>
                        <div className="flex gap-2">
                            <input
                                className="input"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            />
                            <button onClick={() => handleUpdate('profile')} className="btn-primary !px-4" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="label">Email (Tidak bisa diubah)</label>
                        <input className="input opacity-60 cursor-not-allowed" value={profile.email} readOnly />
                    </div>
                </div>
            </div>

            {/* Appearance */}
            <div className="card p-6">
                <div className="flex items-center gap-2 mb-6 text-purple-400">
                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    <h3 className="font-semibold">Tampilan</h3>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-sm text-pink-600 uppercase tracking-wider">Mode Aktif</p>
                        <p className="text-lg font-bold text-pink-500 mt-1 flex items-center gap-2">
                            Hello Kitty 🎀 Spesial
                        </p>
                    </div>
                </div>
            </div>

            {/* Security - PIN */}
            <div className="card p-6">
                <div className="flex items-center gap-2 mb-6 text-amber-500">
                    <Shield className="w-5 h-5" />
                    <h3 className="font-semibold">Keamanan PIN</h3>
                </div>
                <div>
                    <label className="label">PIN Jurnal (4-6 digit angka)</label>
                    <div className="flex gap-2">
                        <input
                            type="password"
                            inputMode="numeric"
                            maxLength={6}
                            className="input tracking-widest"
                            placeholder={profile.hasPin ? 'Ganti PIN baru' : 'Setel PIN baru'}
                            value={form.pin}
                            onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '') }))}
                        />
                        <button onClick={() => handleUpdate('pin')} className="btn-primary !px-4" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan'}
                        </button>
                    </div>
                    {profile.hasPin && (
                        <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> PIN aktif. Gunakan untuk mengunci entri jurnal.
                        </p>
                    )}
                </div>
            </div>

            {/* Password change */}
            <div className="card p-6">
                <h3 className="font-semibold mb-6">Ubah Kata Sandi</h3>
                <div className="space-y-4">
                    <div>
                        <label className="label">Kata Sandi Saat Ini</label>
                        <input
                            type="password"
                            className="input"
                            value={form.currentPassword}
                            onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="label">Kata Sandi Baru</label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                className="input"
                                value={form.newPassword}
                                onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                            />
                            <button onClick={() => handleUpdate('password')} className="btn-primary !px-4" disabled={loading}>
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
