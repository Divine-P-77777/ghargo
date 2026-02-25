import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
    return (
        <footer className="footer-gradient border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-16 pb-8 hidden md:block">
            <div className="container max-w-screen-2xl px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="font-bold text-2xl font-heading text-gradient">GharGo</span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Your trusted partner for all household services. We connect you with verified professionals to get things done safely and efficiently.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <SocialLink href="#" icon={<Facebook className="h-4 w-4" />} />
                            <SocialLink href="#" icon={<Twitter className="h-4 w-4" />} />
                            <SocialLink href="#" icon={<Instagram className="h-4 w-4" />} />
                            <SocialLink href="#" icon={<Linkedin className="h-4 w-4" />} />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-4">Quick Links</h3>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><Link href="/about" className="hover:text-indigo-600 transition-colors">About Us</Link></li>
                            <li><Link href="/services" className="hover:text-indigo-600 transition-colors">Our Services</Link></li>
                            <li><Link href="/become-provider" className="hover:text-indigo-600 transition-colors">Become a Professional</Link></li>
                            <li><Link href="/contact" className="hover:text-indigo-600 transition-colors">Contact Support</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-4">Top Services</h3>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><Link href="/services/cleaning" className="hover:text-indigo-600 transition-colors">Home Cleaning</Link></li>
                            <li><Link href="/services/ac-repair" className="hover:text-indigo-600 transition-colors">AC Repair</Link></li>
                            <li><Link href="/services/electrician" className="hover:text-indigo-600 transition-colors">Electrician</Link></li>
                            <li><Link href="/services/plumbing" className="hover:text-indigo-600 transition-colors">Plumbing</Link></li>
                            <li><Link href="/services/painting" className="hover:text-indigo-600 transition-colors">House Painting</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-4">Contact Us</h3>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-indigo-600 shrink-0" />
                                <span>123 G.S. Road, Christian Basti,<br />Guwahati, Assam 781005</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-indigo-600 shrink-0" />
                                <span>+91 12345 67890</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-indigo-600 shrink-0" />
                                <span>support@ghargo.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
                    <p>&copy; {new Date().getFullYear()} GharGo Services. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-indigo-600">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-indigo-600">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function SocialLink({ href, icon }: { href: string, icon: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-indigo-600 hover:text-white transition-all duration-300"
        >
            {icon}
        </Link>
    )
}
