import { ProSignupForm } from "@/components/auth/ProSignupForm"

export default function JoinProPage() {
    return (
        <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
            <div className="hidden bg-indigo-900 lg:block relative">
                <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-[1px] z-10" />
                <div className="h-full w-full flex flex-col items-center justify-center text-white p-12">
                    <h2 className="z-20 text-5xl font-bold mb-6">Become a Partner</h2>
                    <p className="z-20 text-xl text-indigo-200 text-center max-w-md">
                        Join thousands of professionals growing their business with GharGo.
                        Get verified leads and manage bookings effortlessly.
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-center py-12">
                <ProSignupForm />
            </div>
        </div>
    )
}
