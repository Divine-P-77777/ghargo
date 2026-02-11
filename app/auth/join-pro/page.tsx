import { ProSignupForm } from "@/components/auth/ProSignupForm"
import Link from "next/link"

export default function JoinProPage() {
    return (
        <div className="w-full h-screen lg:grid lg:grid-cols-2">
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <ProSignupForm />
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
                            &ldquo;Join our community of experts. Grow your business with GharGo.&rdquo;
                        </p>
                    </blockquote>
                </div>
            </div>
        </div>
    )
}
