import Navbar from '@/components/Navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 pb-12">
                {children}
            </main>
            <footer className="py-6 text-center text-sm text-[var(--text-secondary)] border-t border-[var(--border)]">
                © 2026 DayScript · Developed by <span className="text-primary-400 font-semibold">Farrel</span>
            </footer>
        </div>
    )
}
