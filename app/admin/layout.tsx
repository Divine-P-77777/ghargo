'use client'

import { useAuth } from "@/components/providers/AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Shield, ChevronLeft, UserPlus, CalendarCheck } from "lucide-react"

const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/manage", label: "Manage Providers", icon: UserPlus },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
    { href: "/admin/users", label: "Users", icon: Users },
]

// Allowed admin emails from env (NEXT_PUBLIC so the client bundle can read it)
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    const isAdmin = !!user && ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/')
        }
    }, [user, loading, isAdmin, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500">Loading...</p>
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        return null
    }

    return (
        <div className="flex min-h-[calc(100vh-64px)]">
            {/* Sidebar */}
            <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-600" />
                        <h2 className="font-bold text-lg text-slate-800">Admin Panel</h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Manage your platform</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {adminLinks.map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <link.icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : ''}`} />
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to App
                    </Link>
                </div>
            </aside>

            {/* Mobile top nav */}
            <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-2 flex gap-2">
                {adminLinks.map((link) => {
                    const isActive = pathname === link.href
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <link.icon className="h-3.5 w-3.5" />
                            {link.label}
                        </Link>
                    )
                })}
            </div>

            {/* Main content */}
            <main className="flex-1 bg-slate-50/50 md:p-8 p-4 pt-16 md:pt-8 overflow-auto">
                {children}
            </main>
        </div>
    )
}
