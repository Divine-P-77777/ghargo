import Link from "next/link"
import { ShieldCheck, Mail } from "lucide-react"

export default function JoinProPage() {
    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 p-6">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto">
                    <ShieldCheck className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Provider Registration is Invite-Only</h1>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        GharGo provider accounts are managed exclusively by our admin team.
                        If you're interested in joining as a service provider, please reach out to us directly.
                    </p>
                </div>
                <a
                    href="mailto:dynamicphillic77777@gmail.com?subject=Provider Registration Request"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm"
                >
                    <Mail className="h-4 w-4" />
                    Contact Us to Apply
                </a>
                <Link href="/" className="block text-sm text-slate-400 hover:text-slate-600 transition-colors">
                    ← Back to Home
                </Link>
            </div>
        </div>
    )
}
