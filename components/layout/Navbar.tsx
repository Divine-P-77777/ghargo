import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { User, Download } from "lucide-react"
import { LanguageSwitcher } from "@/components/ui/language-switcher"

export async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let profile = null
    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('avatar_url, role')
            .eq('id', user.id)
            .single()
        profile = data
    }

    const dashboardHref = profile?.role === 'provider' ? '/provider'
        : profile?.role === 'admin' ? '/admin'
            : '/dashboard'

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <span className="font-bold text-xl sm:text-2xl font-heading text-gradient">GharGo</span>
                </Link>
                <div className="hidden md:flex md:gap-x-6 text-sm font-medium">
                    <Link href="/services" className="transition-colors hover:text-primary">Services</Link>
                    <Link href="/become-provider" className="transition-colors hover:text-primary">Become a Provider</Link>
                    <Link href="/about" className="transition-colors hover:text-primary">About Us</Link>
                </div>
                <div className="flex items-center gap-x-2 md:gap-x-4">
                    {/* PWA Download Icon for Mobile/All */}
                    <Button variant="ghost" size="icon" className="md:hidden w-9 h-9 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                        <Download className="h-[1.2rem] w-[1.2rem]" />
                        <span className="sr-only">Download App</span>
                    </Button>

                    <LanguageSwitcher />

                    {user ? (
                        <Link href={dashboardHref} className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-5 w-5 text-primary" />
                                )}
                            </div>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-x-2">
                            <Link href="/auth/login" className="hidden sm:block">
                                <Button variant="ghost" size="sm">Login</Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-indigo-200">Sign Up</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
