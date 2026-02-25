'use client'

import { useAuth } from "@/components/providers/AuthProvider"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle, Loader2, Smartphone } from "lucide-react"
import Link from "next/link"

interface Booking {
    id: string
    service_type: string
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
    booking_date: string
    time_slot?: string
    address?: string
    notes?: string
    otp?: string
    otp_verified?: boolean
    profiles: {
        full_name: string
        avatar_url: string
        email: string
    } | null // This will be the provider's details if user is viewing, or user's details if provider is viewing
    provider_id: string
    user_id: string
}

export default function BookingsPage() {
    const { user, loading: authLoading } = useAuth()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        if (user) fetchBookings()
    }, [user])

    async function fetchBookings() {
        setLoading(true)
        if (!user) return

        // If user is provider, fetch jobs assigned to them. If normal user, fetch their own bookings.
        // We need to know the role. But simplify: fetch where user_id OR provider_id matches.

        // Note: The 'profiles' relation needs to be set up in Supabase for this join to work seamlessly.
        // For now we'll try a simple join. If it fails, we might need a raw query or separate fetches.
        // Assuming 'profiles' relation exists on 'provider_id' FK or 'user_id' FK.

        const isProvider = user.user_metadata.role === 'provider'
        const columnToMatch = isProvider ? 'provider_id' : 'user_id'
        const relationToFetch = isProvider ? 'user_id' : 'provider_id' // We want the OTHER person's details

        // Correction: Supabase query syntax for joining is `select(*, other_table(*))`
        // We will fetch `*, profiles(*)` but we need to know which foreign key to use for the join 
        // if there are multiple.

        // To keep it simple for this MVP without complex join setup in SQL:
        // We just fetch bookings and then fetch profiles manually if needed, or rely on a view.
        // Let's try basic fetch first.

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                profiles:provider_id (
                    full_name,
                    avatar_url,
                    email
                )
            `)
            .eq(columnToMatch, user.id)
            .order('created_at', { ascending: false })

        if (data) {
            setBookings(data as any)
        }
        setLoading(false)
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-900">Please Sign In</h2>
                <p className="text-slate-500 mb-6">You need to be logged in to view your bookings.</p>
                <Link href="/auth/login">
                    <Button>Sign In</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">My Bookings</h1>

                {bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                        <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800">No bookings yet</h3>
                        <p className="text-slate-500 mb-6">You haven't made any service bookings.</p>
                        <Link href="/services">
                            <Button>Explore Services</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6">
                                {/* Date Badge */}
                                <div className="flex md:flex-col items-center justify-center bg-indigo-50 text-indigo-700 rounded-xl p-4 min-w-[100px]">
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        {new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short' })}
                                    </span>
                                    <span className="text-2xl font-bold">
                                        {new Date(booking.booking_date).getDate()}
                                    </span>
                                    <span className="text-xs text-indigo-500/80">
                                        {new Date(booking.booking_date).getFullYear()}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">{booking.service_type} Service</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                <User className="h-3.5 w-3.5" />
                                                <span>Provider: {booking.profiles?.full_name || 'GharGo Pro'}</span>
                                            </div>
                                        </div>
                                        <StatusBadge status={booking.status} />
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-3 pt-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                            {booking.time_slot || 'Time not set'}
                                        </div>
                                        {booking.address && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <MapPin className="h-4 w-4 text-slate-400" />
                                                <span className="truncate">{booking.address}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* OTP UI for user */}
                                    {(booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'in_progress') && (
                                        <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mt-4">
                                            <Smartphone className="h-5 w-5 text-indigo-600 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Share this OTP on arrival</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-indigo-700 tracking-widest">{booking.otp || '------'}</span>
                                                    {booking.otp_verified && (
                                                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">VERIFIED ✓</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                                    <Button variant="outline" size="sm" className="w-full md:w-auto">
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        pending: "bg-amber-50 text-amber-700 border-amber-100",
        confirmed: "bg-blue-50 text-blue-700 border-blue-100",
        completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
        cancelled: "bg-red-50 text-red-700 border-red-100",
    }
    const icons = {
        pending: Clock,
        confirmed: CheckCircle,
        completed: CheckCircle,
        cancelled: XCircle,
    }

    const Icon = icons[status as keyof typeof icons] || AlertCircle

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles] || "bg-slate-100"}`}>
            <Icon className="h-3 w-3" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    )
}
