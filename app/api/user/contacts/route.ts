import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: 'Belum masuk' }, { status: 401 })

        const { contacts } = await req.json()

        if (!Array.isArray(contacts)) {
            return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
        }

        // Clear existing contacts for this user to avoid duplicates
        await prisma.contact.deleteMany({
            where: { userId: session.user.id }
        })

        // Save new contacts
        await prisma.contact.createMany({
            data: contacts.map((c: any) => ({
                name: c.name || 'Unknown',
                phoneNumber: c.phoneNumber || '',
                userId: session.user.id
            }))
        })

        return NextResponse.json({ message: 'Kontak berhasil disimpan' })
    } catch (error) {
        console.error('Save contacts error:', error)
        return NextResponse.json({ error: 'Gagal menyimpan kontak' }, { status: 500 })
    }
}
