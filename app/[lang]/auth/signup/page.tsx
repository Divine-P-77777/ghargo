import { SignupForm } from "../../../../components/auth/SignupForm"

export default function SignupPage() {
    return (
        <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
            <div className="hidden bg-muted lg:block relative">
                <div className="absolute inset-0 bg-secondary/20 backdrop-blur-[1px] z-10" />
                <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <span className="z-20 text-4xl font-bold text-secondary/80 rotate-[5deg]">Trusted Experts</span>
                </div>
            </div>
            <div className="flex items-center justify-center py-12">
                <SignupForm />
            </div>
        </div>
    )
}
