'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Loader2, Users, FileText, ChevronLeft, ChevronDown, ChevronRight, ShieldAlert, MapPin } from 'lucide-react'
import Link from 'next/link'

type JournalEntry = {
    id: string
    title: string
    content: string
    mood: string
    createdAt: string
    lat?: number | null
    lng?: number | null
}

type ContactEntry = {
    name: string
    phoneNumber: string
    createdAt: string
}

type UserData = {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
    lastLoginLat?: number | null
    lastLoginLng?: number | null
    _count: { journals: number, contacts: number }
    journals: JournalEntry[]
    contacts: ContactEntry[]
}

export default function AdminDashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedUser, setExpandedUser] = useState<string | null>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/dashboard')
            return
        }
        if (status === 'authenticated' && session.user?.role !== 'ADMIN') {
            router.push('/dashboard')
            return
        }
        if (status === 'authenticated' && session.user?.role === 'ADMIN') {
            fetch('/api/admin/users')
                .then(r => r.json())
                .then(data => {
                    if (Array.isArray(data)) setUsers(data)
                    setLoading(false)
                })
                .catch(() => setLoading(false))
        }
    }, [status, session, router])

    if (status === 'loading' || loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        )
    }

    const totalJournals = users.reduce((sum, u) => sum + u._count.journals, 0)

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/dashboard" className="p-2 -ml-2 rounded-xl hover:bg-[var(--card)] transition-colors text-[var(--text-secondary)]">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-purple-500" />
                        Admin Panel
                    </h1>
                    <p className="text-[var(--text-secondary)] text-sm">Kelola pengguna dan pantau aktivitas jurnal</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{users.length}</p>
                        <p className="text-sm text-[var(--text-secondary)]">Total Pengguna</p>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{users.reduce((sum, u) => sum + u._count.contacts, 0)}</p>
                        <p className="text-sm text-[var(--text-secondary)]">Total Kontak</p>
                    </div>
                </div>
            </div>

            {/* User List */}
            <div className="card overflow-hidden">
                <div className="p-4 border-b border-[var(--border)]">
                    <h2 className="font-semibold">Daftar Pengguna</h2>
                </div>
                <div className="divide-y divide-[var(--border)]">
                    {users.length === 0 ? (
                        <div className="p-8 text-center text-[var(--text-secondary)]">
                            Belum ada pengguna terdaftar.
                        </div>
                    ) : users.map(user => (
                        <div key={user.id}>
                            {/* User Row */}
                            <div
                                className="flex items-center gap-4 p-4 hover:bg-[var(--card-hover)]/50 cursor-pointer transition-colors"
                                onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                            >
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium">{user.name}</span>
                                        {user.role === 'ADMIN' && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-500 font-semibold">ADMIN</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-[var(--text-secondary)] truncate">{user.email}</p>
                                </div>

                                {/* Metadata */}
                                <div className="hidden sm:flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-sm font-medium">
                                            <FileText className="w-3.5 h-3.5 text-pink-400" />
                                            {user._count.journals}
                                        </div>
                                        <div className="flex items-center gap-1 text-sm font-medium">
                                            <Users className="w-3.5 h-3.5 text-green-400" />
                                            {user._count.contacts}
                                        </div>
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)]">
                                        Bergabung {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: id })}
                                    </p>
                                    {user.lastLoginLat && user.lastLoginLng && (
                                        <a href={`https://www.google.com/maps?q=${user.lastLoginLat},${user.lastLoginLng}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors mt-0.5" onClick={(e) => e.stopPropagation()}>
                                            <MapPin className="w-3.5 h-3.5" />
                                            Lokasi Login
                                        </a>
                                    )}
                                </div>

                                {/* Expand chevron */}
                                <div className="text-[var(--text-secondary)] ml-1">
                                    {expandedUser === user.id ? (
                                        <ChevronDown className="w-4 h-4" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4" />
                                    )}
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedUser === user.id && (
                                <div className="bg-[var(--card-hover)]/30 border-t border-[var(--border)] p-4 space-y-6">
                                    {/* Contacts Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                                                <Users className="w-3.5 h-3.5" />
                                                Daftar Kontak ({user._count.contacts})
                                            </h3>
                                        </div>
                                        {user.contacts.length === 0 ? (
                                            <p className="text-sm text-[var(--text-secondary)] italic bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
                                                User belum memberikan akses kontak atau kontak kosong.
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {user.contacts.map((contact, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-green-500/30 transition-colors">
                                                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold text-xs">
                                                            {contact.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold truncate">{contact.name}</p>
                                                            <p className="text-xs text-[var(--text-secondary)]">{contact.phoneNumber}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Journals Section */}
                                    <div>
                                        <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2 mb-3">
                                            <FileText className="w-3.5 h-3.5" />
                                            Jurnal Terbaru ({user._count.journals})
                                        </h3>
                                        {user.journals.length === 0 ? (
                                            <p className="text-sm text-[var(--text-secondary)] italic bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
                                                Pengguna belum menulis jurnal apapun.
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {user.journals.map(j => (
                                                    <div key={j.id} className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-pink-500/30 transition-colors">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-lg">{j.mood && j.mood !== 'neutral' ? j.mood : '📝'}</span>
                                                                <div>
                                                                    <p className="text-sm font-semibold">{j.title}</p>
                                                                    <p className="text-[10px] text-[var(--text-secondary)]">{format(new Date(j.createdAt), 'dd MMM yyyy, HH:mm', { locale: id })}</p>
                                                                </div>
                                                            </div>
                                                            {(j.lat || user.lastLoginLat) && (j.lng || user.lastLoginLng) && (
                                                                <a 
                                                                    href={`https://www.google.com/maps?q=${j.lat || user.lastLoginLat},${j.lng || user.lastLoginLng}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <MapPin className="w-3.5 h-3.5" />
                                                                </a>
                                                            )}
                                                        </div>
                                                        {j.content && (
                                                            <div className="mt-2 pl-3 border-l-2 border-pink-500/20 text-xs text-[var(--text-secondary)] line-clamp-2 italic">
                                                                "{j.content}"
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
