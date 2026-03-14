import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: 'Belum masuk' }, { status: 401 })

        const { pin, pattern } = await req.json()
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { pin: true, pattern: true, lockType: true }
        })

        if (user?.lockType === 'PATTERN') {
            if (!user?.pattern) return NextResponse.json({ valid: false, error: 'Pola belum diatur' })
            if (!pattern) return NextResponse.json({ valid: false, error: 'Pola diperlukan' })
            const valid = await bcrypt.compare(pattern, user.pattern)
            return NextResponse.json({ valid })
        } else {
            if (!user?.pin) return NextResponse.json({ valid: false, error: 'PIN belum diatur' })
            if (!pin) return NextResponse.json({ valid: false, error: 'PIN diperlukan' })
            const valid = await bcrypt.compare(pin, user.pin)
            return NextResponse.json({ valid })
        }
    } catch (error) {
        return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
    }
}
