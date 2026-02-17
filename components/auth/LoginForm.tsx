'use client'

import Link from "next/link"
import { login, loginWithGoogle } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock } from "lucide-react"

export function LoginForm() {
    return (
        <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">Welcome Back</h1>
                <p className="text-balance text-muted-foreground">
                    Login to manage your bookings and services
                </p>
            </div>

            <div className="grid gap-4">
                <form action={loginWithGoogle}>
                    <Button variant="outline" className="w-full gap-2" type="submit">
                        <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                            <path
                                d="M12.0003 20.45c4.65 0 8.35-3.125 9.5-7.75h-9.5v-3.6h13.1c.15 1.05.25 2.175.25 3.35 0 6.6-4.525 11.55-11.35 11.55C6.7503 24 2.1253 19.375 2.1253 14.125S6.7503 4.25 12.0003 4.25c2.6 0 4.975.95 6.8 2.525l-2.825 2.825c-1.025-.975-2.525-1.75-3.975-1.75-3.5 0-6.425 2.875-6.425 6.375s2.925 6.375 6.425 6.375c2.725 0 5.15-1.55 6.075-4h-6v3.3h3.5c-.375 1.775-1.75 3.225-3.575 3.225z"
                                fill="currentColor"
                            />
                        </svg>
                        Sign in with Google
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with email
                        </span>
                    </div>
                </div>

                <form action={login} className="grid gap-4">
                    <div className="grid gap-2">
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Password"
                                required
                                className="pl-10"
                            />
                        </div>
                        <Link
                            href="/auth/forgot-password"
                            className="ml-auto inline-block text-sm underline opacity-80 hover:opacity-100"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                    <Button type="submit" variant="premium" className="w-full">
                        Login
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/signup" className="underline font-medium text-primary">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    )
}
