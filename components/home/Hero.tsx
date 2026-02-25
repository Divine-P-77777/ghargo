'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Shield, Clock, ArrowRight, Star } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"

export function Hero() {
    const { dictionary: dict } = useLanguage()

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-whiten py-20">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-white" />

                {/* Floating Blobs */}
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-200/20 rounded-full blur-[100px] animate-blob" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-200/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
                <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-indigo-200/20 rounded-full blur-[100px] animate-blob animation-delay-4000" />

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div className="container relative z-10 px-4 md:px-6">
                <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-xs font-medium animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        #1 Home Service Platform
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 font-heading leading-snug animate-fade-in-up animation-delay-100">
                        {dict.landing?.hero_title || "Your Home,"} <br className="hidden md:inline" />
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent bg-300% animate-gradient">
                            Perfected by Experts.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg text-slate-600 md:w-3/4 animate-fade-in-up animation-delay-200 leading-relaxed">
                        {dict.landing?.hero_subtitle ||
                            "Connect with verified professionals for cleaning, repairs, and more. Experience the difference of premium service."}
                    </p>

                    {/* Interactive Search Bar */}
                    <div className="w-full max-w-lg mt-6 p-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-indigo-500/10 animate-fade-in-up animation-delay-300 ring-1 ring-slate-200/50">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                                <Input
                                    className="w-full pl-12 h-11 bg-transparent border-none focus-visible:ring-0 text-sm placeholder:text-slate-400"
                                    placeholder={dict.landing?.search_placeholder || "What service do you need?"}
                                />
                            </div>
                            <Button
                                size="lg"
                                className="h-11 px-7 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/25 transition-all"
                            >
                                {dict.landing?.find_expert || "Find Expert"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap justify-center gap-5 pt-6 animate-fade-in-up animation-delay-400">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-100 shadow-sm">
                            <div className="p-1.5 rounded-full bg-green-100/60 text-green-600">
                                <Shield className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium text-slate-600">Verified Experts</span>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-100 shadow-sm">
                            <div className="p-1.5 rounded-full bg-blue-100/60 text-blue-600">
                                <Clock className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium text-slate-600">On-Time Service</span>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-100 shadow-sm">
                            <div className="p-1.5 rounded-full bg-yellow-100/60 text-yellow-600">
                                <Star className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium text-slate-600">4.8/5 Rating</span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}