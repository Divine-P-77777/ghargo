'use client'

import { useState, useRef } from "react"
import { login, signup, loginWithGoogle } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react"

function GoogleIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
        </svg>
    )
}

export function AuthPage({ mode = 'login' }: { mode?: 'login' | 'signup' }) {
    const [isSignUp, setIsSignUp] = useState(mode === 'signup')
    const [isAnimating, setIsAnimating] = useState(false)

    const toggleMode = () => {
        setIsAnimating(true)
        setTimeout(() => {
            setIsSignUp(!isSignUp)
            setTimeout(() => setIsAnimating(false), 50)
        }, 300)
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-4">
            {/* Floating decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-[900px] min-h-[580px] bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden border border-slate-100/80">
                {/* Main Container with two panels */}
                <div className="flex h-full min-h-[580px]">

                    {/* === Form Side === */}
                    <div className={`w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 transition-all duration-500 ease-out ${isSignUp ? 'lg:ml-auto' : ''} ${isAnimating ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>

                        {isSignUp ? (
                            /* ===== SIGNUP FORM ===== */
                            <div className="w-full max-w-sm space-y-6">
                                <div className="space-y-2 text-center">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium mb-2">
                                        <Sparkles className="h-3 w-3" /> Join the Community
                                    </div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                        Create Account
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        Start managing your home services today
                                    </p>
                                </div>

                                <form action={loginWithGoogle}>
                                    <Button variant="outline" className="w-full gap-3 h-11 rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all" type="submit">
                                        <GoogleIcon />
                                        <span className="font-medium">Continue with Google</span>
                                    </Button>
                                </form>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-3 text-slate-400 font-medium">or</span>
                                    </div>
                                </div>

                                <form action={signup} className="space-y-3">
                                    <div className="relative group">
                                        <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <Input name="fullName" type="text" placeholder="Full Name" required className="pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all" />
                                    </div>
                                    <div className="relative group">
                                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <Input name="email" type="email" placeholder="Email address" required className="pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all" />
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <Input name="password" type="password" placeholder="Password" required className="pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all" />
                                    </div>
                                    <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300">
                                        Create Account
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </form>

                                <p className="text-center text-sm text-slate-500">
                                    Already have an account?{" "}
                                    <button onClick={toggleMode} className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-4 decoration-indigo-300 hover:decoration-indigo-500 transition-colors">
                                        Sign in
                                    </button>
                                </p>
                            </div>
                        ) : (
                            /* ===== LOGIN FORM ===== */
                            <div className="w-full max-w-sm space-y-6">
                                <div className="space-y-2 text-center">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium mb-2">
                                        <Sparkles className="h-3 w-3" /> Welcome Back
                                    </div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                        Sign In
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        Manage your bookings and services
                                    </p>
                                </div>

                                <form action={loginWithGoogle}>
                                    <Button variant="outline" className="w-full gap-3 h-11 rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all" type="submit">
                                        <GoogleIcon />
                                        <span className="font-medium">Continue with Google</span>
                                    </Button>
                                </form>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-3 text-slate-400 font-medium">or</span>
                                    </div>
                                </div>

                                <form action={login} className="space-y-3">
                                    <div className="relative group">
                                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <Input name="email" type="email" placeholder="Email address" required className="pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all" />
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <Input name="password" type="password" placeholder="Password" required className="pl-10 h-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all" />
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="button" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                                            Forgot password?
                                        </button>
                                    </div>
                                    <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300">
                                        Sign In
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </form>

                                <p className="text-center text-sm text-slate-500">
                                    Don&apos;t have an account?{" "}
                                    <button onClick={toggleMode} className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-4 decoration-indigo-300 hover:decoration-indigo-500 transition-colors">
                                        Create one
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* === Sliding Overlay Panel (Desktop) === */}
                    <div
                        className={`hidden lg:flex absolute top-0 h-full w-1/2 transition-all duration-700 ease-in-out z-10 ${isSignUp ? 'left-0' : 'left-1/2'}`}
                    >
                        <div className="relative w-full h-full overflow-hidden">
                            {/* Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />

                            {/* Animated Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-10 left-10 w-32 h-32 border border-white/30 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
                                <div className="absolute bottom-20 right-10 w-24 h-24 border border-white/20 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/10 rounded-full animate-pulse" />
                            </div>

                            {/* Content */}
                            <div className={`relative z-10 flex flex-col items-center justify-center h-full text-white p-12 text-center transition-all duration-500 ease-out ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                                <div className="mb-8">
                                    <h2 className="text-4xl font-bold mb-2 font-heading">GharGo</h2>
                                    <div className="w-12 h-1 bg-white/50 rounded-full mx-auto" />
                                </div>

                                {isSignUp ? (
                                    <div className="space-y-6 max-w-xs">
                                        <h3 className="text-2xl font-semibold">Already a member?</h3>
                                        <p className="text-white/80 text-sm leading-relaxed">
                                            Sign in to access your bookings, manage services, and connect with trusted professionals.
                                        </p>
                                        <Button
                                            onClick={toggleMode}
                                            variant="outline"
                                            className="border-2 border-white/40 text-white bg-white/10 hover:bg-white hover:text-indigo-700 rounded-xl px-8 h-11 font-semibold backdrop-blur-sm transition-all duration-300"
                                        >
                                            Sign In
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6 max-w-xs">
                                        <h3 className="text-2xl font-semibold">New here?</h3>
                                        <p className="text-white/80 text-sm leading-relaxed">
                                            Join GharGo and discover the easiest way to find verified local experts for all your household needs.
                                        </p>
                                        <Button
                                            onClick={toggleMode}
                                            variant="outline"
                                            className="border-2 border-white/40 text-white bg-white/10 hover:bg-white hover:text-indigo-700 rounded-xl px-8 h-11 font-semibold backdrop-blur-sm transition-all duration-300"
                                        >
                                            Create Account
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
