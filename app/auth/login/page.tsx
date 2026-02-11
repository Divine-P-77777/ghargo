import { LoginForm } from "@/components/auth/LoginForm"
import Image from "next/image"

export default function LoginPage() {
    return (
        <div className="w-full h-screen lg:grid lg:grid-cols-2">
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <LoginForm />
                </div>
            </div>
            <div className="hidden lg:flex relative h-full flex-col bg-muted text-white dark:border-r">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600" />
                <div className="relative z-20 flex items-center text-lg font-medium p-10">
                    <span className="font-heading text-2xl font-bold">GharGo</span>
                </div>
                <div className="relative z-20 mt-auto p-10">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Connecting you with trusted local experts for all your household needs. Simple, Fast, and Reliable.&rdquo;
                        </p>
                    </blockquote>
                </div>
            </div>
        </div>
    )
}
