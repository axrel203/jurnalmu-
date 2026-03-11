'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Loader2, Users, FileText, ChevronLeft, ChevronDown, ChevronRight, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

type JournalEntry = {
    id: string
    title: string
    mood: string
    createdAt: string
}

type UserData = {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
    _count: { journals: number }
    journals: JournalEntry[]
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
                    <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-pink-500" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{totalJournals}</p>
                        <p className="text-sm text-[var(--text-secondary)]">Total Jurnal</p>
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
                                    <div className="flex items-center gap-1 text-sm font-medium">
                                        <FileText className="w-3.5 h-3.5 text-pink-400" />
                                        {user._count.journals} jurnal
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)]">
                                        Bergabung {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: id })}
                                    </p>
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

                            {/* Expanded Journal List */}
                            {expandedUser === user.id && (
                                <div className="bg-[var(--card-hover)]/30 border-t border-[var(--border)] px-4 pb-3 pt-2">
                                    <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                                        {user._count.journals > 10
                                            ? `10 jurnal terbaru dari ${user._count.journals} jurnal`
                                            : `${user._count.journals} jurnal`}
                                    </p>
                                    {user.journals.length === 0 ? (
                                        <p className="text-sm text-[var(--text-secondary)] italic py-2">Pengguna belum menulis jurnal apapun.</p>
                                    ) : (
                                        <div className="space-y-1.5">
                                            {user.journals.map(j => (
                                                <div key={j.id} className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg hover:bg-[var(--card)] transition-colors">
                                                    <span className="text-xl leading-none">{j.mood && j.mood !== 'neutral' ? j.mood : '📝'}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{j.title}</p>
                                                    </div>
                                                    <p className="text-xs text-[var(--text-secondary)] flex-shrink-0">
                                                        {format(new Date(j.createdAt), 'dd MMM yy', { locale: id })}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
