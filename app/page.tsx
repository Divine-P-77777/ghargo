'use client'

import { Button } from "@/components/ui/button"

import { Zap, Droplets, Sparkles, Car, Hammer, Paintbrush, Shield, Clock, Heart } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { Hero } from "@/components/home/Hero"

export default function LandingPage() {
    const { dictionary: dict } = useLanguage()

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <Hero />

            {/* Services Grid */}
            <section className="py-16 md:py-24 bg-background">
                <div className="container px-4 md:px-8 max-w-screen-2xl">
                    <div className="flex flex-col items-center mb-12 space-y-4 text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Our Services</h2>
                        <p className="text-muted-foreground max-w-2xl">
                            Choose from a wide range of household services tailored to your needs.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        <ServiceCard icon={<Zap className="h-8 w-8" />} title="Electrician" href="/services?category=Electrician" />
                        <ServiceCard icon={<Droplets className="h-8 w-8" />} title="Plumbing" href="/services?category=Plumber" />
                        <ServiceCard icon={<Sparkles className="h-8 w-8" />} title="Cleaning" href="/services?category=Cleaner" />
                        <ServiceCard icon={<Car className="h-8 w-8" />} title="Car Wash" href="/services?category=Mechanic" />
                        <ServiceCard icon={<Hammer className="h-8 w-8" />} title="Repairs" href="/services?category=Carpenter" />
                        <ServiceCard icon={<Paintbrush className="h-8 w-8" />} title="Painting" href="/services?category=Painter" />
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 bg-background border-t border-b">
                <div className="container px-4 md:px-8 max-w-screen-2xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold text-primary">Why Choose GharGo?</h2>
                            <div className="space-y-4">
                                <FeatureItem
                                    icon={<Shield className="h-6 w-6 text-indigo-600" />}
                                    title="Verified Professionals"
                                    description="Every provider is verified for your safety."
                                />
                                <FeatureItem
                                    icon={<Heart className="h-6 w-6 text-red-500" />}
                                    title="Trust & Transparency"
                                    description="Upfront pricing and clear service scope."
                                />
                                <FeatureItem
                                    icon={<Clock className="h-6 w-6 text-green-600" />}
                                    title="Punctual Service"
                                    description="We value your time. Our experts arrive on schedule."
                                />
                            </div>
                            <div className="pt-4">
                                <Link href="/about">
                                    <Button variant="outline">Learn More About Us</Button>
                                </Link>
                            </div>
                        </div>
                        <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-white">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-600 opacity-90" />
                            <div className="absolute inset-0 flex items-center justify-center text-white p-8 text-center">
                                <div>
                                    <h3 className="text-2xl font-bold mb-4">Are you a Service Provider?</h3>
                                    <p className="mb-6 opacity-90">Join our growing network of trusted experts. Grow your business.</p>
                                    <Link href="/auth/join-pro">
                                        <Button variant="secondary" size="lg" className="font-semibold">Join as Professional</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 bg-background text-center">
                <div className="container px-4 max-w-3xl mx-auto space-y-6">
                    <h2 className="text-3xl font-bold">Ready to get things done?</h2>
                    <p className="text-muted-foreground text-lg">
                        Book a service today and experience the difference.
                    </p>
                    <div className="flex justify-center gap-4 pt-4">
                        <Link href="/services">
                            <Button size="lg" className="px-8 text-base">Book Now</Button>
                        </Link>
                        <Link href="/auth/signup">
                            <Button variant="outline" size="lg" className="px-8 text-base">Sign Up Free</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

function ServiceCard({ icon, title, href }: { icon: React.ReactNode, title: string, href: string }) {
    return (
        <Link href={href} className="group flex flex-col items-center p-6 bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="mb-4 p-4 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                {icon}
            </div>
            <h3 className="font-semibold text-foreground">{title}</h3>
        </Link>
    )
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
                <div className="p-2 rounded-lg bg-white shadow-sm ring-1 ring-gray-100">
                    {icon}
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-lg">{title}</h4>
                <p className="text-muted-foreground">{description}</p>
            </div>
        </div>
    )
}
