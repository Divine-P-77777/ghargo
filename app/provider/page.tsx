'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/AuthProvider"
import { Calendar, CheckCircle, Clock, ChevronRight, MapPin } from "lucide-react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

interface Booking {
    id: string
    booking_date: string
    time_slot: string | null
    address: string | null
    status: string
    otp_verified: boolean
    provider_id: string
}

export default function ProviderDashboard() {
    const { user } = useAuth()
    const supabase = createClient()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [providerId, setProviderId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { if (user) init() }, [user])

    async function init() {
        const { data: p } = await supabase
            .from('providers')
            .select('id')
            .eq('email', user!.email!)
            .single()
        if (!p) return
        setProviderId(p.id)

        const { data } = await supabase
            .from('bookings')
            .select('id, booking_date, time_slot, address, status, otp_verified, provider_id')
            .eq('provider_id', p.id)
            .order('booking_date', { ascending: false })
        if (data) setBookings(data as Booking[])
        setLoading(false)
    }

    const today = new Date().toISOString().split('T')[0]
    const todayJobs = bookings.filter(b => b.booking_date === today)
    const pending = bookings.filter(b => b.status === 'pending')
    const completed = bookings.filter(b => b.status === 'completed')
    const current = bookings.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status))

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-indigo-600 animate-spin" /></div>

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Provider Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Welcome back — here's your day at a glance</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                    { label: "Today's Jobs", value: todayJobs.length, color: 'indigo', icon: Calendar },
                    { label: "Pending", value: pending.length, color: 'amber', icon: Clock },
                    { label: "Completed", value: completed.length, color: 'emerald', icon: CheckCircle },
                ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4`}>
                        <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center shrink-0`}>
                            <Icon className={`h-5 w-5 text-${color}-600`} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{value}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Today's jobs */}
            <div>
                <h2 className="text-base font-bold text-slate-800 mb-3">Today's Bookings</h2>
                {todayJobs.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                        <Calendar className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-slate-400 text-sm">No jobs scheduled for today</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {todayJobs.map(b => (
                            <Link key={b.id} href={`/provider/bookings/${b.id}`}
                                className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:border-indigo-200 hover:shadow-md transition-all group">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                                        <span className="text-xs font-medium text-slate-600">{b.time_slot || '—'}</span>
                                        <StatusPill status={b.status} />
                                    </div>
                                    {b.address && (
                                        <div className="flex items-start gap-1.5">
                                            <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                                            <span className="text-sm text-slate-700 truncate">{b.address}</span>
                                        </div>
                                    )}
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent active */}
            {current.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-bold text-slate-800">Active Bookings</h2>
                        <Link href="/provider/bookings" className="text-xs text-indigo-600 font-medium hover:underline">View all</Link>
                    </div>
                    <div className="space-y-3">
                        {current.slice(0, 4).map(b => (
                            <Link key={b.id} href={`/provider/bookings/${b.id}`}
                                className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:border-indigo-200 transition-all group">
                                <div className="text-center bg-indigo-50 rounded-xl px-3 py-2 shrink-0">
                                    <p className="text-xs font-bold text-indigo-400 uppercase">
                                        {new Date(b.booking_date).toLocaleDateString('en-IN', { month: 'short' })}
                                    </p>
                                    <p className="text-lg font-bold text-indigo-700">{new Date(b.booking_date).getDate()}</p>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <StatusPill status={b.status} />
                                        {b.otp_verified && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">OTP ✓</span>}
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">{b.time_slot}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 shrink-0" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function StatusPill({ status }: { status: string }) {
    const m: Record<string, string> = {
        pending: 'bg-amber-50 text-amber-700',
        confirmed: 'bg-blue-50 text-blue-700',
        in_progress: 'bg-indigo-100 text-indigo-700',
        completed: 'bg-emerald-50 text-emerald-700',
        cancelled: 'bg-red-50 text-red-600',
    }
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${m[status] || 'bg-slate-100 text-slate-600'}`}>{status.replace('_', ' ')}</span>
}
