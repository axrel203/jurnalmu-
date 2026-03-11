import { put } from '@vercel/blob'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Hanya file gambar yang diperbolehkan' }, { status: 400 })
        }

        // Validate file size (max 4MB)
        if (file.size > 4 * 1024 * 1024) {
            return NextResponse.json({ error: 'Ukuran file maksimal 4MB' }, { status: 400 })
        }

        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            return NextResponse.json({ error: 'Konfigurasi storage belum siap (Token tidak ditemukan). Pastikan sudah klik Connect di Vercel.' }, { status: 500 })
        }

        const blob = await put(`journals/${session.user.id}/${Date.now()}-${file.name}`, file, {
            access: 'public',
        })

        return NextResponse.json({ url: blob.url })
    } catch (error: any) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: `Gagal upload: ${error?.message || 'Terjadi kesalahan sistem'}` }, { status: 500 })
    }
}
