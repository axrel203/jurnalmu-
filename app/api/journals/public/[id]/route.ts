import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const journal = await prisma.journal.findUnique({ where: { id: params.id } })
    if (!journal || !journal.isPublic) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const user = await prisma.user.findUnique({
        where: { id: journal.userId },
        select: { name: true },
    })

    return NextResponse.json({ ...journal, authorName: user?.name })
}
