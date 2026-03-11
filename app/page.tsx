'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { BookOpen, Sparkles, Shield, BarChart2, Moon, Search, ArrowRight, PenLine, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useTheme } from '@/components/ThemeProvider'

const FEATURES = [
  { icon: PenLine, title: 'Jurnal Harian', desc: 'Tangkap pikiran, perasaan, dan kenangan Anda setiap hari.' },
  { icon: Sparkles, title: 'Pelacakan Mood', desc: 'Pantau perjalanan emosional Anda dengan 8 kategori mood.' },
  { icon: BarChart2, title: 'Statistik Mood', desc: 'Grafik visual dari tren mood dan streak menulis Anda.' },
  { icon: Search, title: 'Pencarian Pintar', desc: 'Temukan entri jurnal apa pun secara instan dengan pencarian teks lengkap.' },
  { icon: Shield, title: 'Kunci PIN', desc: 'Lindungi entri pribadi Anda dengan kode PIN rahasia.' },
  { icon: Moon, title: 'Mode Gelap', desc: 'Tema gelap dan terang yang indah untuk waktu kapan pun.' },
]

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (status === 'authenticated') router.push('/dashboard')
  }, [status, router])

  return (
    <div className="min-h-screen hero-gradient">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all bg-pink-400 border border-pink-300 overflow-hidden">
            <img src="/hello_kitty_sticker_set_1772544993400.png" alt="Kitty Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-xl tracking-tight text-pink-600">
            KittyScript
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary !py-2 !px-4 text-sm">Masuk</Link>
          <Link href="/register" className="btn-primary !py-2 !px-4 text-sm">Daftar Sekarang</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 text-center max-w-5xl mx-auto animate-fade-in relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl opacity-10 blur-xl pointer-events-none">
          <div className="w-full h-40 bg-pink-400 rounded-full" />
        </div>

        <div className="mb-10 flex justify-center">
          <img
            src="/hello_kitty_banner.png"
            alt="Hello Kitty Welcome Banner"
            className="w-full max-w-2xl rounded-3xl shadow-2xl border-4 border-pink-200"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-medium mb-8 border text-pink-600 bg-pink-50 border-pink-200">
          <Sparkles className="w-4 h-4" />
          Pikiran Anda, tersimpan dengan indah
        </div>
        <h1 className="text-6xl md:text-7xl font-extrabold leading-tight mb-6">
          Jurnal Digital
          <span className="text-pink-500 block">
            Pribadi Anda
          </span>
        </h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Menulislah dengan bebas, lacak mood Anda, temukan pola, dan bangun catatan hidup Anda — semua dalam satu tempat yang indah.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/register" className="btn-primary text-base flex items-center gap-2 !px-7 !py-3.5">
            Mulai Menulis <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login" className="btn-secondary text-base !px-7 !py-3.5">Masuk</Link>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-16 flex-wrap">
          {[['Menulislah Setiap Hari', 'Bangun kebiasaan baik'], ['Lacak Mood', '8 kategori'], ['Tetap Pribadi', 'Terkunci PIN']].map(([t, s]) => (
            <div key={t} className="text-center">
              <div className="text-2xl font-bold gradient-text">{t}</div>
              <div className="text-sm text-[var(--text-secondary)] mt-0.5">{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-3">Semua yang Anda butuhkan</h2>
        <p className="text-center text-[var(--text-secondary)] mb-12">Fitur canggih yang dikemas dalam antarmuka yang indah</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card card-hover p-6 animate-slide-up">
              <div className="w-11 h-11 rounded-xl bg-pink-100 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-pink-500" />
              </div>
              <h3 className="font-semibold text-lg mb-1.5">{title}</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto card p-12">
          <h2 className="text-3xl font-bold mb-4">Siap untuk mulai menulis?</h2>
          <p className="text-[var(--text-secondary)] mb-8">Bergabunglah dan abadikan perjalanan Anda hari ini.</p>
          <Link href="/register" className="btn-primary text-base inline-flex items-center gap-2 !px-8 !py-4">
            Buat Akun Gratis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-[var(--text-secondary)] border-t border-[var(--border)] relative overflow-hidden">
        {theme === 'kitty' && (
          <div className="absolute -bottom-4 -left-4 w-24 h-24 opacity-20 pointer-events-none">
            <span className="text-6xl text-pink-500">🎀</span>
          </div>
        )}
        © 2026 DayScript. Developed by <span className="text-pink-600 font-semibold">Farrel</span>
      </footer>

      {theme === 'kitty' && (
        <div className="fixed bottom-10 left-10 w-40 h-40 pointer-events-none z-10 animate-fade-in floating">
          <img
            src="/hello_kitty_sticker_set_1772544993400.png"
            alt="Hello Kitty Sticker"
            className="w-full h-full object-contain drop-shadow-2xl opacity-90"
          />
        </div>
      )}
    </div>
  )
}
