'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, User, Search, Menu, LogOut, Info, Phone, FileText, Shield, Download } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { User as UserType } from "@supabase/supabase-js"

export function MobileNav() {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = useState<UserType | null>(null)
    const [profile, setProfile] = useState<{ avatar_url: string | null, role: string | null } | null>(null)
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user)
            if (data.user) {
                supabase
                    .from('profiles')
                    .select('avatar_url, role')
                    .eq('id', data.user.id)
                    .single()
                    .then(({ data: p }) => setProfile(p))
            }
        })
    }, [supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
        setUser(null)
    }

    const isActive = (path: string) => pathname === path

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe md:hidden">
            <div className="flex justify-around items-center h-16">
                <NavItem href="/" icon={<Home className="h-6 w-6" />} label="Home" active={isActive('/')} />
                <NavItem href="/services" icon={<Search className="h-6 w-6" />} label="Services" active={isActive('/services')} />

                {/* PWA Download NavItem */}
                <button className="flex flex-col items-center justify-center w-full h-full transition-colors duration-200 text-slate-400 hover:text-indigo-600">
                    <div className="mb-1 scale-100">
                        <Download className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-medium">Download</span>
                </button>

                <NavItem href="/bookings" icon={<Calendar className="h-6 w-6" />} label="Bookings" active={isActive('/bookings')} />

                <Sheet>
                    <SheetTrigger asChild>
                        <button className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 text-slate-400 hover:text-slate-600`}>
                            <div className="mb-1 scale-100 transition-transform duration-200">
                                <Menu className="h-6 w-6" />
                            </div>
                            <span className="text-[10px] font-medium">Menu</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[80vw] sm:w-[350px] overflow-y-auto">
                        <SheetHeader className="mb-6 text-left">
                            <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">GharGo</SheetTitle>
                        </SheetHeader>

                        <div className="space-y-6">
                            {/* User Section */}
                            {user ? (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center overflow-hidden">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-5 w-5 text-indigo-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">{user.user_metadata?.full_name || 'User'}</p>
                                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                                    <p className="text-sm text-slate-500 mb-3">Sign in to manage your bookings</p>
                                    <Link href="/auth/login" className="block w-full">
                                        <Button className="w-full h-11">Sign In</Button>
                                    </Link>
                                </div>
                            )}

                            <div className="space-y-1">
                                <MenuLink
                                    href={profile?.role === 'provider' ? '/provider' : profile?.role === 'admin' ? '/admin' : '/dashboard'}
                                    icon={<User className="h-5 w-5" />}
                                    label="My Dashboard"
                                    active={isActive('/dashboard') || isActive('/provider') || isActive('/admin')}
                                />
                                <MenuLink
                                    href={profile?.role === 'provider' ? '/provider/bookings' : '/bookings'}
                                    icon={<Calendar className="h-5 w-5" />}
                                    label="My Bookings"
                                    active={isActive('/bookings') || isActive('/provider/bookings')}
                                />
                            </div>

                            <div className="border-t border-slate-100 my-4" />

                            <div className="space-y-1">
                                <MenuLink href="/about" icon={<Info className="h-5 w-5" />} label="About Us" active={isActive('/about')} />
                                <MenuLink href="/contact" icon={<Phone className="h-5 w-5" />} label="Contact Support" active={isActive('/contact')} />
                                <MenuLink href="/terms" icon={<FileText className="h-5 w-5" />} label="Terms of Service" active={isActive('/terms')} />
                                <MenuLink href="/privacy" icon={<Shield className="h-5 w-5" />} label="Privacy Policy" active={isActive('/privacy')} />
                            </div>

                            {user && (
                                <div className="pt-4">
                                    <Button variant="ghost" className="w-full h-12 justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl" onClick={handleLogout}>
                                        <LogOut className="mr-3 h-5 w-5" />
                                        Log Out
                                    </Button>
                                </div>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    )
}

function MenuLink({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) {
    return (
        <Link href={href} className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}>
            <span className={active ? 'text-white' : 'text-slate-400'}>{icon}</span>
            <span className="font-semibold text-sm">{label}</span>
        </Link>
    )
}

function NavItem({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) {
    return (
        <Link href={href} className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <div className={`mb-1 ${active ? 'scale-110' : 'scale-100'} transition-transform duration-200`}>
                {icon}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
        </Link>
    )
}
