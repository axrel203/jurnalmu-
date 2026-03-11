'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { BookOpen, LayoutDashboard, BarChart2, Settings, LogOut, PenLine, Menu, X, ShieldAlert } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { useState } from 'react'

const NAV = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Beranda' },
    { href: '/stats', icon: BarChart2, label: 'Statistik' },
    { href: '/settings', icon: Settings, label: 'Pengaturan' },
]

const KittyIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-pink-500">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
        <path d="M12 8c-1-2-4-2-4 0 0 2 4 5 4 5s4-3 4-5c0-2-3-2-4 0z" fill="white" />
    </svg>
)

export default function Navbar() {
    const { data: session } = useSession()
    const { theme, toggleTheme } = useTheme()
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--border)]">
            {theme === 'kitty' && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-300 via-red-400 to-pink-300" />
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center shadow-sm overflow-hidden border border-pink-200">
                        <img src="/hello_kitty_sticker_set_1772544993400.png" alt="Kitty Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-pink-600 hidden sm:block">
                        KittyScript
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {NAV.map(({ href, icon: Icon, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${pathname === href
                                ? 'bg-primary-500/15 text-primary-400'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)]'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Link>
                    ))}
                    {session?.user?.role === 'ADMIN' && (
                        <Link
                            href="/admin"
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${pathname === '/admin'
                                    ? 'bg-purple-500/15 text-purple-500'
                                    : 'text-purple-400/80 hover:text-purple-500 hover:bg-purple-500/10'
                                }`}
                        >
                            <ShieldAlert className="w-4 h-4" />
                            Admin
                        </Link>
                    )}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    <Link href="/journal/new" className="btn-primary !py-1.5 !px-3.5 text-sm hidden sm:flex items-center gap-1.5">
                        <PenLine className="w-3.5 h-3.5" /> Entri Baru
                    </Link>


                    {/* User + Logout */}
                    <div className="hidden md:flex items-center gap-2 pl-2 border-l border-[var(--border)]">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${theme === 'kitty' ? 'bg-pink-400' : 'bg-gradient-to-br from-primary-400 to-purple-500'
                            }`}>
                            {session?.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-400/10 transition-all"
                            title="Keluar"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setOpen(o => !o)}
                        className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--card-hover)] transition-all"
                    >
                        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {open && (
                <div className="md:hidden border-t border-[var(--border)] bg-[var(--card)] px-4 py-3 space-y-1 animate-fade-in shadow-xl">
                    {NAV.map(({ href, icon: Icon, label }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === href ? 'bg-primary-500/15 text-primary-400' : 'text-[var(--text-secondary)] hover:bg-[var(--card-hover)]'
                                }`}
                        >
                            <Icon className="w-4 h-4" /> {label}
                        </Link>
                    ))}
                    <Link href="/journal/new" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-400">
                        <PenLine className="w-4 h-4" /> Entri Baru
                    </Link>
                    {session?.user?.role === 'ADMIN' && (
                        <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-purple-400">
                            <ShieldAlert className="w-4 h-4" /> Admin Panel
                        </Link>
                    )}
                    <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 w-full text-left">
                        <LogOut className="w-4 h-4" /> Keluar
                    </button>
                </div>
            )}
        </header>
    )
}
