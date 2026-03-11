import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json()

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Semua bidang wajib diisi' }, { status: 400 })
        }

        const exists = await prisma.user.findUnique({ where: { email } })
        if (exists) return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })

        const hashedPassword = await bcrypt.hash(password, 10)
        await prisma.user.create({
            data: { name, email, password: hashedPassword }
        })

        return NextResponse.json({ message: 'Akun berhasil dibuat' }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 })
    }
}
