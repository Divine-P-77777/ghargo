'use client'

import Link from "next/link"
import { signup } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, User, Briefcase } from "lucide-react"

export function ProSignupForm() {
    return (
        <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Become a Pro</h1>
                <p className="text-balance text-muted-foreground">
                    Join as a service provider and grow your business
                </p>
            </div>

            <div className="grid gap-4">
                <form action={signup} className="grid gap-4">
                    <input type="hidden" name="role" value="provider" />

                    <div className="grid gap-2">
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder="Business / Full Name"
                                required
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="business@example.com"
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
                    </div>

                    <div className="bg-indigo-50 p-3 rounded-md text-xs text-indigo-700 flex gap-2">
                        <Briefcase className="h-4 w-4 shrink-0" />
                        <p>By registering, you agree to our Partner Terms & Conditions.</p>
                    </div>

                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                        Register as Professional
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                    Already a partner?{" "}
                    <Link href="/auth/login" className="underline font-medium text-indigo-600">
                        Login to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
