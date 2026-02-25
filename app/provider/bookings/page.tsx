'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/AuthProvider"
import { Calendar, Clock, MapPin, ChevronRight, Loader2 } from "lucide-react"
import Link from "next/link"

interface Booking {
    id: string
    booking_date: string
    time_slot: string | null
    address: string | null
    status: string
    otp_verified: boolean
    notes: string | null
}

type Tab = 'current' | 'history'

export default function ProviderBookingsPage() {
    const { user } = useAuth()
    const supabase = createClient()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<Tab>('current')

    useEffect(() => { if (user) init() }, [user])

    async function init() {
        const { data: p } = await supabase
            .from('providers')
            .select('id')
            .eq('email', user!.email!)
            .single()
        if (!p) { setLoading(false); return }

        const { data } = await supabase
            .from('bookings')
            .select('id, booking_date, time_slot, address, status, otp_verified, notes')
            .eq('provider_id', p.id)
            .order('booking_date', { ascending: false })
        if (data) setBookings(data as Booking[])
        setLoading(false)
    }

    const current = bookings.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status))
    const history = bookings.filter(b => ['completed', 'cancelled'].includes(b.status))
    const shown = tab === 'current' ? current : history

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-indigo-600 animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
                <p className="text-slate-500 text-sm mt-1">All service requests assigned to you</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {([
                    { val: 'current', label: `Current (${current.length})` },
                    { val: 'history', label: `History (${history.length})` },
                ] as { val: Tab; label: string }[]).map(({ val, label }) => (
                    <button key={val} onClick={() => setTab(val)}
                        className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all border ${tab === val
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* List */}
            {shown.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <Calendar className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No {tab === 'current' ? 'active' : 'past'} bookings</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {shown.map(b => (
                        <Link key={b.id} href={`/provider/bookings/${b.id}`}
                            className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:border-indigo-200 hover:shadow-md transition-all group">
                            {/* Date badge */}
                            <div className="text-center bg-indigo-50 rounded-xl px-3 py-2 shrink-0 min-w-[52px]">
                                <p className="text-[10px] font-bold text-indigo-400 uppercase">
                                    {new Date(b.booking_date).toLocaleDateString('en-IN', { month: 'short' })}
                                </p>
                                <p className="text-lg font-bold text-indigo-700">{new Date(b.booking_date).getDate()}</p>
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <StatusPill status={b.status} />
                                    {b.otp_verified && (
                                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">OTP Verified ✓</span>
                                    )}
                                </div>
                                {b.time_slot && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Clock className="h-3 w-3" />
                                        {b.time_slot}
                                    </div>
                                )}
                                {b.address && (
                                    <div className="flex items-start gap-1.5 text-xs text-slate-500">
                                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                        <span className="truncate">{b.address}</span>
                                    </div>
                                )}
                            </div>

                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 shrink-0" />
                        </Link>
                    ))}
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
    return <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${m[status] || 'bg-slate-100 text-slate-600'}`}>{status.replace('_', ' ')}</span>
}
