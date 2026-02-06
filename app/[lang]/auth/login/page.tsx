import { LoginForm } from "../../../../components/auth/LoginForm"
import Image from "next/image"

export default function LoginPage() {
    return (
        <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
            <div className="flex items-center justify-center py-12">
                <LoginForm />
            </div>
            <div className="hidden bg-muted lg:block relative">
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] z-10" />
                {/* Placeholder for a nice image */}
                <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <span className="z-20 text-4xl font-bold text-primary/80 rotate-[-5deg]">GharGo Services</span>
                </div>
            </div>
        </div>
    )
}
