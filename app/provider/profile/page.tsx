'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/AuthProvider"
import { User, Phone, Mail, Award, Calendar, Clock, MapPin, Loader2, CheckCircle } from "lucide-react"

interface ProviderInfo {
    full_name: string
    service_type: string
    email: string
    phone: string | null
    hourly_rate: number | null
    is_approved: boolean
    available_days: number[] | null
    available_time_slots: string[] | null
    avatar_url: string | null
    bio: string | null
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ProviderProfilePage() {
    const { user } = useAuth()
    const supabase = createClient()
    const [profile, setProfile] = useState<ProviderInfo | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { if (user) fetchProfile() }, [user])

    async function fetchProfile() {
        const { data } = await supabase
            .from('providers')
            .select('*')
            .eq('email', user!.email!)
            .single()

        if (data) setProfile(data as ProviderInfo)
        setLoading(false)
    }

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-indigo-600 animate-spin" /></div>
    if (!profile) return null

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Cover / Header */}
                <div className="h-32 bg-indigo-600 relative">
                    <div className="absolute -bottom-12 left-8 p-1.5 bg-white rounded-3xl shadow-lg">
                        <div className="w-24 h-24 rounded-2xl bg-indigo-50 overflow-hidden flex items-center justify-center border border-slate-100">
                            {profile.avatar_url
                                ? <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                                : <User className="h-10 w-10 text-indigo-300" />}
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold text-slate-900">{profile.full_name}</h1>
                                {profile.is_approved && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                            </div>
                            <p className="text-emerald-600 font-semibold">{profile.service_type}</p>
                        </div>
                        <div className="flex gap-2">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${profile.is_approved
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                {profile.is_approved ? 'Approved Professional' : 'Verification Pending'}
                            </span>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                        {/* Contact & Rate */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">General Info</h3>
                            <div className="space-y-3">
                                <p className="flex items-center gap-3 text-sm text-slate-600">
                                    <Mail className="h-4 w-4 text-slate-400" /> {profile.email}
                                </p>
                                <p className="flex items-center gap-3 text-sm text-slate-600">
                                    <Phone className="h-4 w-4 text-slate-400" /> {profile.phone || 'Not provided'}
                                </p>
                                <p className="flex items-center gap-3 text-sm text-slate-600">
                                    <Award className="h-4 w-4 text-slate-400" /> ₹{profile.hourly_rate || 500} / visit
                                </p>
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Schedule</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                                    <div className="flex gap-1.5 flex-wrap">
                                        {profile.available_days?.map(d => (
                                            <span key={d} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                                                {DAY_NAMES[d]}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
                                    <div className="flex flex-col gap-1">
                                        {profile.available_time_slots?.map(s => (
                                            <span key={s} className="text-[11px] font-medium text-slate-500">• {s}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {profile.bio && (
                        <div className="space-y-3 pt-4">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">About / Bio</h3>
                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                {profile.bio}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
