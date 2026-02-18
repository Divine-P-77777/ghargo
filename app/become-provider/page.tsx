import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, TrendingUp, Calendar, Wallet, ArrowRight, ShieldCheck, Star } from "lucide-react"

export default function BecomeProviderPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-violet-50/50" />
                <div className="container relative mx-auto px-4 py-20 lg:py-32 grid lg:grid-cols-2 gap-12 items-center max-w-7xl">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                            <TrendingUp className="h-3 w-3" />
                            Best Platform for Professionals
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-[1.1]">
                            Grow Your Business with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">GharGo</span>
                        </h1>
                        <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                            Join thousands of skilled professionals finding new customers every day. Zero marketing fees. Direct payments. Total freedom.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link href="/auth/join-pro">
                                <Button size="lg" className="h-14 px-8 text-lg rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 w-full sm:w-auto">
                                    Register as Professional
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/auth/login">
                                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-xl border-slate-200 hover:bg-white hover:text-indigo-700 w-full sm:w-auto">
                                    Provider Login
                                </Button>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 pt-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                                ))}
                            </div>
                            <p>Trusted by 2,000+ local experts</p>
                        </div>
                    </div>

                    {/* Hero Image/Card Area */}
                    <div className="relative mx-auto lg:ml-auto w-full max-w-md lg:max-w-full">
                        <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-500">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white">
                                    <Wallet className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase">Recent Earnings</p>
                                    <p className="text-3xl font-bold text-slate-900">₹24,500</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <CheckCircle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">AC Repair</p>
                                            <p className="text-xs text-slate-500">Today, 2:00 PM</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-slate-900">+₹850</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <CheckCircle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">Plumbing Fix</p>
                                            <p className="text-xs text-slate-500">Yesterday</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-slate-900">+₹1,200</span>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex gap-1 text-amber-500">
                                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                                </div>
                                <p className="text-sm font-semibold text-slate-600">4.9/5 Rating</p>
                            </div>
                        </div>
                        {/* Decorative background blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-200/50 to-purple-200/50 rounded-full blur-3xl -z-10" />
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 lg:py-28">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Why Partner with Us?</h2>
                        <p className="text-lg text-slate-600">We handle the marketing, bookings, and payments so you can focus on what you do best—delivering great service.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <BenefitCard
                            icon={<Wallet className="h-8 w-8 text-indigo-600" />}
                            title="Zero Lead Fees"
                            description="Unlike other platforms, we don't charge you for leads. You pay a small commission only when you complete a job and get paid."
                        />
                        <BenefitCard
                            icon={<Calendar className="h-8 w-8 text-violet-600" />}
                            title="Flexible Schedule"
                            description="Be your own boss. Accept jobs that fit your schedule and location preferences. Work as much or as little as you want."
                        />
                        <BenefitCard
                            icon={<TrendingUp className="h-8 w-8 text-emerald-600" />}
                            title="Direct Payments"
                            description="Get paid directly to your bank account securely. Track your earnings daily and withdraw whenever you want."
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-white border-y border-slate-100">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                                    <ShieldCheck className="h-20 w-20 mb-6 opacity-80" />
                                    <h3 className="text-3xl font-bold mb-4">Verified & Trusted</h3>
                                    <p className="text-white/80 text-lg">Join a community built on trust. Verification ensures quality clients and premium rates.</p>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 space-y-12">
                            <div>
                                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">How to Get Started</h2>
                                <p className="text-lg text-slate-600">Start earning in 3 simple steps. Our team is here to guide you through the process.</p>
                            </div>

                            <div className="space-y-8">
                                <Step number="01" title="Sign Up Online" description="Fill out the registration form with your basic details and business information. It takes less than 5 minutes." />
                                <Step number="02" title="Get Verified" description="Upload your ID and relevant skill certificates. Our team will verify your profile within 24 hours." />
                                <Step number="03" title="Start Earning" description="Once approved, download the partner app, customize your profile, and start accepting bookings immediately." />
                            </div>

                            <Link href="/auth/join-pro" className="inline-block">
                                <Button size="lg" className="rounded-xl h-12 px-8 bg-slate-900 text-white hover:bg-slate-800">
                                    Start Your Application
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 lg:py-28">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <FAQ question="Is there a registration fee?" answer="No, joining GharGo is completely free. We only charge a small commission on completed bookings." />
                        <FAQ question="What documents do I need?" answer="You'll need a government-issued ID (Aadhaar/PAN) and any relevant skill certificates or licenses for your trade." />
                        <FAQ question="How often do I get paid?" answer="Earnings are credited to your wallet immediately after job completion. Direct bank transfers are processed weekly." />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-indigo-900 text-white text-center">
                <div className="container mx-auto px-4 max-w-4xl space-y-8">
                    <h2 className="text-4xl lg:text-5xl font-bold">Ready to grow your business?</h2>
                    <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
                        Join the fastest-growing home services platform in Guwahati today.
                    </p>
                    <Link href="/auth/join-pro" className="inline-block">
                        <Button size="lg" className="h-14 px-10 text-lg rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold shadow-2xl">
                            Join Now for Free
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-indigo-50 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{description}</p>
        </div>
    )
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
    return (
        <div className="flex gap-6">
            <div className="flex-shrink-0">
                <span className="text-3xl font-bold text-indigo-200">{number}</span>
            </div>
            <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">{title}</h4>
                <p className="text-slate-600">{description}</p>
            </div>
        </div>
    )
}

function FAQ({ question, answer }: { question: string, answer: string }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors">
            <h4 className="text-lg font-bold text-slate-900 mb-2">{question}</h4>
            <p className="text-slate-600">{answer}</p>
        </div>
    )
}
