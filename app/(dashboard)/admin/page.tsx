'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Loader2, Users, FileText, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

type UserData = {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
    _count: {
        journals: number
    }
}

export default function AdminDashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated' || (session && session.user?.role !== 'ADMIN')) {
            router.push('/dashboard')
            return
        }

        if (status === 'authenticated') {
            fetch('/api/admin/users')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setUsers(data)
                    }
                    setLoading(false)
                })
                .catch(err => {
                    console.error(err)
                    setLoading(false)
                })
        }
    }, [status, session, router])

    if (status === 'loading' || loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        )
    }

    if (!session || session.user?.role !== 'ADMIN') return null

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
                <Link href="/dashboard" className="p-2 -ml-2 rounded-xl hover:bg-[var(--card)] transition-colors text-[var(--text-secondary)]">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary-500" />
                        Admin Panel
                    </h1>
                    <p className="text-[var(--text-secondary)] text-sm">Kelola pengguna dan lihat statistik platform</p>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--card-hover)]">
                                <th className="p-4 font-semibold text-sm">Pengguna</th>
                                <th className="p-4 font-semibold text-sm">Role</th>
                                <th className="p-4 font-semibold text-sm">Tgl Bergabung</th>
                                <th className="p-4 font-semibold text-sm text-center">Jurnal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-[var(--card-hover)]/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-sm text-[var(--text-secondary)]">{user.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                                        {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: id })}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center items-center gap-1.5 font-medium">
                                            <FileText className="w-4 h-4 text-primary-400" />
                                            {user._count.journals}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-[var(--text-secondary)]">
                                        Belum ada pengguna terdaftar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
