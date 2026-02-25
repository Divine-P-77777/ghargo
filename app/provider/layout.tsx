'use client'

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/AuthProvider"
import Link from "next/link"
import { LayoutDashboard, CalendarCheck, User, LogOut, Loader2, Menu, X } from "lucide-react"

interface ProviderRecord {
    id: string
    full_name: string
    avatar_url: string | null
    service_type: string | null
    is_approved: boolean
}

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    const [provider, setProvider] = useState<ProviderRecord | null>(null)
    const [checking, setChecking] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        if (authLoading) return
        if (!user) { router.replace('/auth/login?next=/provider'); return }
        checkProvider()
    }, [user, authLoading])

    async function checkProvider() {
        console.log("DEBUG: checkProvider started for user:", user?.email)

        // 1. First, try to find the professional listing by email (CASE-INSENSITIVE)
        // This is the most reliable way to identify a provider
        const { data: providerData, error: providerError } = await supabase
            .from('providers')
            .select('id, full_name, avatar_url, service_type, is_approved')
            .ilike('email', user!.email!) // Use ILIKE for case-insensitive matching
            .single()

        console.log("DEBUG: ProviderData (ilike):", providerData, "Error:", providerError)

        // 2. If they are in the providers table, they are definitely allowed in
        if (providerData) {
            console.log("DEBUG: Provider found in professional listings. Granting access.")
            setProvider(providerData as ProviderRecord)
            setChecking(false)

            // Proactive sync: If they are in providers but not marked as 'provider' in profiles, 
            // ensure the profile reflects the provider role.
            await supabase
                .from('profiles')
                .update({ role: 'provider' })
                .eq('id', user!.id)
                .neq('role', 'provider') // Only update if not already set

            return
        }

        // 3. Fallback: Check profile role if listing is missing (e.g. they registered first)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user!.id)
            .single()

        console.log("DEBUG: Profile data fallback:", profile, "Error:", profileError)

        if (profile?.role === 'provider') {
            console.log("DEBUG: Listing missing but profile role is 'provider'. Granting access with fallback.")
            setProvider({
                id: '',
                full_name: user?.user_metadata?.full_name || 'Provider',
                avatar_url: null,
                service_type: 'Pending Setup',
                is_approved: false
            })
            setChecking(false)
            return
        }

        // 4. If neither check passes, they are not a provider
        console.log("DEBUG: No provider evidence found. Redirecting to home.")
        router.replace('/')
    }

    const navLinks = [
        { href: '/provider', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/provider/bookings', label: 'My Bookings', icon: CalendarCheck },
        { href: '/provider/profile', label: 'My Profile', icon: User },
    ]

    async function handleSignOut() {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (authLoading || checking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
        )
    }

    if (!provider) return null

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 shadow-sm z-30 flex flex-col transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-screen lg:sticky`}>

                {/* Brand */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 overflow-hidden flex items-center justify-center shrink-0">
                            {provider.avatar_url
                                ? <img src={provider.avatar_url} alt={provider.full_name} className="w-full h-full object-cover" />
                                : <span className="text-indigo-600 font-bold">{provider.full_name.charAt(0)}</span>}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate">{provider.full_name}</p>
                            <p className="text-xs text-emerald-600 font-medium">{provider.service_type || 'Provider'}</p>
                        </div>
                    </div>
                    {!provider.is_approved && (
                        <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                            ⚠️ Account pending approval
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    {navLinks.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href
                        return (
                            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                                <Icon className="h-4 w-4 shrink-0" />
                                {label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Sign out */}
                <div className="p-4 border-t border-slate-100">
                    <button onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all w-full">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 min-w-0">
                {/* Mobile topbar */}
                <div className="lg:hidden sticky top-0 z-10 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100">
                        <Menu className="h-5 w-5 text-slate-600" />
                    </button>
                    <span className="font-bold text-slate-800">Provider Portal</span>
                </div>

                <main className="p-6 lg:p-8 max-w-5xl">
                    {children}
                </main>
            </div>
        </div>
    )
}
