import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

// GET single journal
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: 'Belum masuk' }, { status: 401 })

        const journal = await prisma.journal.findUnique({
            where: { id: params.id },
        })

        if (!journal) return NextResponse.json({ error: 'Jurnal tidak ditemukan' }, { status: 404 })
        if (journal.userId !== session.user.id) return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })

        return NextResponse.json(journal)
    } catch (error) {
        return NextResponse.json({ error: 'Gagal memuat' }, { status: 500 })
    }
}

// PUT update journal
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: 'Belum masuk' }, { status: 401 })

        const journal = await prisma.journal.findUnique({ where: { id: params.id } })
        if (!journal || journal.userId !== session.user.id) return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })

        const { title, content, mood, isPublic, isPinLocked, tags } = await req.json()

        const updated = await prisma.journal.update({
            where: { id: params.id },
            data: { title, content, mood, isPublic, isPinLocked, tags },
        })

        return NextResponse.json(updated)
    } catch (error) {
        return NextResponse.json({ error: 'Gagal memperbarui' }, { status: 500 })
    }
}

// DELETE journal
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: 'Belum masuk' }, { status: 401 })

        const journal = await prisma.journal.findUnique({ where: { id: params.id } })
        if (!journal || journal.userId !== session.user.id) return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })

        await prisma.journal.delete({ where: { id: params.id } })
        return NextResponse.json({ message: 'Jurnal berhasil dihapus' })
    } catch (error) {
        return NextResponse.json({ error: 'Gagal menghapus' }, { status: 500 })
    }
}
