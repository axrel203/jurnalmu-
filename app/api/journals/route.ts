import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: 'Belum masuk' }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const search = searchParams.get('search') || ''
        const mood = searchParams.get('mood') || ''
        const month = searchParams.get('month') || ''

        const journals = await prisma.journal.findMany({
            where: {
                userId: session.user.id,
                AND: [
                    search ? { OR: [{ title: { contains: search } }, { content: { contains: search } }] } : {},
                    mood ? { mood } : {},
                    month ? { createdAt: { gte: new Date(month), lt: new Date(new Date(month).setMonth(new Date(month).getMonth() + 1)) } } : {},
                ]
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(journals)
    } catch (error) {
        return NextResponse.json({ error: 'Gagal memuat jurnal' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: 'Belum masuk' }, { status: 401 })

        const { title, content, mood, isPublic, isPinLocked, tags, coverImage } = await req.json()

        if (!title || !content) {
            return NextResponse.json({ error: 'Judul dan isi wajib diisi' }, { status: 400 })
        }

        const journal = await prisma.journal.create({
            data: {
                title, content, mood, isPublic, isPinLocked, tags, coverImage,
                userId: session.user.id
            }
        })

        return NextResponse.json(journal)
    } catch (error) {
        return NextResponse.json({ error: 'Gagal menyimpan jurnal' }, { status: 500 })
    }
}
