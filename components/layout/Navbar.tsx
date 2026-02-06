import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { User } from "lucide-react"

export async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <span className="font-bold text-xl sm:text-2xl text-primary font-heading">GharGo</span>
                </Link>
                <div className="hidden md:flex md:gap-x-6 text-sm font-medium">
                    <Link href="/services" className="transition-colors hover:text-primary">Services</Link>
                    <Link href="/become-provider" className="transition-colors hover:text-primary">Become a Provider</Link>
                    <Link href="/about" className="transition-colors hover:text-primary">About Us</Link>
                </div>
                <div className="flex items-center gap-x-4">
                    {user ? (
                        <div className="flex items-center gap-x-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm">Dashboard</Button>
                            </Link>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-x-2">
                            <Link href="/auth/login">
                                <Button variant="ghost" size="sm">Login</Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button size="sm" className="bg-primary hover:bg-primary/90">Sign Up</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
