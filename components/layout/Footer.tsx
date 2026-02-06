import Link from "next/link"

export function Footer() {
    return (
        <footer className="w-full border-t bg-background py-10 md:py-16">
            <div className="container px-4 md:px-8 max-w-screen-2xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-bold text-primary">GharGo</h3>
                        <p className="text-sm text-muted-foreground">
                            Trusted hyperlocal services in Guwahati.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h4 className="font-semibold">Company</h4>
                        <Link href="/about" className="text-sm text-muted-foreground hover:underline">About Us</Link>
                        <Link href="/careers" className="text-sm text-muted-foreground hover:underline">Careers</Link>
                        <Link href="/contact" className="text-sm text-muted-foreground hover:underline">Contact</Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h4 className="font-semibold">Services</h4>
                        <Link href="/services/cleaning" className="text-sm text-muted-foreground hover:underline">Cleaning</Link>
                        <Link href="/services/plumbing" className="text-sm text-muted-foreground hover:underline">Plumbing</Link>
                        <Link href="/services/electrician" className="text-sm text-muted-foreground hover:underline">Electrician</Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h4 className="font-semibold">Legal</h4>
                        <Link href="/terms" className="text-sm text-muted-foreground hover:underline">Terms</Link>
                        <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">Privacy</Link>
                    </div>
                </div>
                <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} GharGo Services. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
