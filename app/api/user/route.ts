import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Belum masuk' }, { status: 401 })

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, pin: true }
    })

    return NextResponse.json({
        ...user,
        hasPin: !!user?.pin
    })
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: 'Belum masuk' }, { status: 401 })

        const { name, pin, currentPassword, newPassword, type } = await req.json()

        if (type === 'password' && currentPassword && newPassword) {
            const user = await prisma.user.findUnique({ where: { id: session.user.id } })
            const valid = await bcrypt.compare(currentPassword, user!.password)
            if (!valid) return NextResponse.json({ error: 'Kata sandi saat ini salah' }, { status: 400 })

            await prisma.user.update({
                where: { id: session.user.id },
                data: { password: await bcrypt.hash(newPassword, 10) }
            })
            return NextResponse.json({ message: 'Kata sandi diperbarui' })
        }

        if (type === 'pin') {
            const hashedPin = pin ? await bcrypt.hash(pin, 10) : null
            await prisma.user.update({
                where: { id: session.user.id },
                data: { pin: hashedPin }
            })
            return NextResponse.json({ message: 'PIN diperbarui' })
        }

        if (type === 'profile' && name) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { name }
            })
            return NextResponse.json({ message: 'Profil diperbarui' })
        }

        return NextResponse.json({ error: 'Permintaan tidak valid' }, { status: 400 })
    } catch (error) {
        return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 })
    }
}
