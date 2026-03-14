'use client'
import { useState, useEffect } from 'react'
import { User, Shield, Moon, Sun, Lock, Loader2, Save, RotateCcw } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import toast from 'react-hot-toast'
import PatternLock from '@/components/PatternLock'

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme()
    const [loading, setLoading] = useState(false)
    const [profile, setProfile] = useState({ name: '', email: '', hasPin: false, hasPattern: false, lockType: 'PIN' })
    const [form, setForm] = useState({ name: '', pin: '', currentPassword: '', newPassword: '' })
    const [patternResetTrigger, setPatternResetTrigger] = useState(0)

    useEffect(() => {
        fetch('/api/user').then(r => r.json()).then(d => {
            setProfile(d)
            setForm(f => ({ ...f, name: d.name }))
        })
    }, [])

    const handleUpdate = async (type: 'profile' | 'pin' | 'password' | 'pattern' | 'lockType', extraData?: any) => {
        setLoading(true)
        const body: any = { type }
        if (type === 'profile') body.name = form.name
        if (type === 'pin') body.pin = form.pin
        if (type === 'pattern') body.pattern = extraData
        if (type === 'lockType') body.lockType = extraData
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
            if (type === 'pattern') setProfile(p => ({ ...p, hasPattern: !!extraData }))
            if (type === 'lockType') setProfile(p => ({ ...p, lockType: extraData }))
            setForm(f => ({ ...f, pin: '', currentPassword: '', newPassword: '' }))
            if (type === 'pattern' && !extraData) setPatternResetTrigger(t => t + 1)
        } else {
            toast.error(data.error || 'Terjadi kesalahan')
        }
    }

    const handlePatternComplete = (patternCode: string) => {
        if (patternCode.length < 4) {
            toast.error('Pola minimal 4 titik')
            setPatternResetTrigger(t => t + 1)
            return
        }
        handleUpdate('pattern', patternCode)
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

            {/* Security */}
            <div className="card p-6">
                <div className="flex items-center gap-2 mb-6 text-amber-500">
                    <Shield className="w-5 h-5" />
                    <h3 className="font-semibold">Keamanan Jurnal Pribadi</h3>
                </div>
                
                <div className="mb-6">
                    <label className="label">Tipe Kunci Utama</label>
                    <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="lockType" 
                                value="PIN" 
                                checked={profile.lockType === 'PIN'}
                                onChange={() => handleUpdate('lockType', 'PIN')}
                                className="w-4 h-4 text-primary-500 focus:ring-primary-500 border-[var(--border)]"
                            />
                            <span>PIN Angka</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="lockType" 
                                value="PATTERN" 
                                checked={profile.lockType === 'PATTERN'}
                                onChange={() => handleUpdate('lockType', 'PATTERN')}
                                className="w-4 h-4 text-primary-500 focus:ring-primary-500 border-[var(--border)]"
                            />
                            <span>Pola (Pattern Grid)</span>
                        </label>
                    </div>
                </div>

                {profile.lockType === 'PIN' ? (
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
                                <Lock className="w-3 h-3" /> PIN aktif mengatur privasi jurnal Anda.
                            </p>
                        )}
                    </div>
                ) : (
                    <div>
                        <label className="label mb-4 text-center">Gambar Pola Baru</label>
                        <PatternLock 
                            onComplete={handlePatternComplete} 
                            resetTrigger={patternResetTrigger}
                            size={260} 
                        />
                        <div className="flex justify-center mt-6 gap-3">
                            <button 
                                onClick={() => setPatternResetTrigger(t => t + 1)} 
                                className="btn-secondary flex items-center gap-2 text-sm"
                            >
                                <RotateCcw className="w-4 h-4" /> Ulangi Gambar
                            </button>
                            <button 
                                onClick={() => handleUpdate('pattern', '')} 
                                className="px-4 py-2 rounded-xl text-sm font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                            >
                                Hapus Pola
                            </button>
                        </div>
                        {profile.hasPattern && (
                            <p className="text-xs text-green-400 mt-4 flex items-center justify-center gap-1">
                                <Lock className="w-3 h-3" /> Pola aktif mengatur privasi jurnal Anda.
                            </p>
                        )}
                    </div>
                )}
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
