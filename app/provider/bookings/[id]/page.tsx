'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/AuthProvider"
import {
    Calendar, Clock, MapPin, User, ChevronLeft,
    CheckCircle, AlertCircle, Loader2, Navigation,
    Smartphone, CheckCircle2, X
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Booking {
    id: string
    booking_date: string
    time_slot: string
    address: string
    notes: string | null
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
    otp: string | null
    otp_verified: boolean
    profiles: {
        full_name: string
        email: string
    } | null
}

export default function BookingDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const supabase = createClient()

    const [booking, setBooking] = useState<Booking | null>(null)
    const [loading, setLoading] = useState(true)
    const [otpInput, setOtpInput] = useState('')
    const [verifying, setVerifying] = useState(false)
    const [otpError, setOtpError] = useState('')
    const [completing, setCompleting] = useState(false)

    useEffect(() => { if (user && id) fetchBooking() }, [user, id])

    async function fetchBooking() {
        setLoading(true)
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                profiles:user_id (
                    full_name,
                    email
                )
            `)
            .eq('id', id)
            .single()

        if (error || !data) {
            router.push('/provider/bookings')
            return
        }
        setBooking(data as any)
        setLoading(false)
    }

    async function handleVerifyOtp(e: React.FormEvent) {
        e.preventDefault()
        if (!booking || !otpInput) return
        setOtpError('')
        setVerifying(true)

        if (otpInput === booking.otp) {
            const { error } = await supabase
                .from('bookings')
                .update({
                    otp_verified: true,
                    status: 'in_progress'
                })
                .eq('id', booking.id)

            if (!error) {
                setBooking(prev => prev ? { ...prev, otp_verified: true, status: 'in_progress' } : null)
                setOtpInput('')
            } else {
                setOtpError('Update failed. Try again.')
            }
        } else {
            setOtpError('Invalid OTP. Please check with the customer.')
        }
        setVerifying(false)
    }

    async function handleMarkComplete() {
        if (!booking || !booking.otp_verified) return
        setCompleting(true)
        const { error } = await supabase
            .from('bookings')
            .update({ status: 'completed' })
            .eq('id', booking.id)

        if (!error) {
            setBooking(prev => prev ? { ...prev, status: 'completed' } : null)
        }
        setCompleting(false)
    }

    function openMaps() {
        if (!booking?.address) return
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.address)}`
        window.open(url, '_blank')
    }

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-indigo-600 animate-spin" /></div>
    if (!booking) return null

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
            <Link href="/provider/bookings" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                <ChevronLeft className="h-4 w-4" /> Back to Bookings
            </Link>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Status header */}
                <div className={`px-6 py-4 flex items-center justify-between ${booking.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                    booking.status === 'in_progress' ? 'bg-indigo-50 text-indigo-700' :
                        'bg-slate-50 text-slate-700'
                    }`}>
                    <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider">
                        <StatusIcon status={booking.status} />
                        {booking.status.replace('_', ' ')}
                    </div>
                    {booking.otp_verified && (
                        <div className="flex items-center gap-1.5 text-xs font-bold bg-white/50 px-3 py-1 rounded-full">
                            <CheckCircle2 className="h-3.5 w-3.5" /> OTP VERIFIED
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-8">
                    {/* User Info */}
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                            <User className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</p>
                            <h2 className="text-xl font-bold text-slate-900">{booking.profiles?.full_name || 'Guest'}</h2>
                            <p className="text-sm text-slate-500">{booking.profiles?.email}</p>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <Calendar className="h-3 w-3" /> Date
                            </p>
                            <p className="font-bold text-slate-800">
                                {new Date(booking.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <Clock className="h-3 w-3" /> Slot
                            </p>
                            <p className="font-bold text-slate-800">{booking.time_slot}</p>
                        </div>
                    </div>

                    {/* Location & Maps */}
                    <div className="space-y-3">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <MapPin className="h-3 w-3" /> Address
                        </p>
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 relative group">
                            <p className="text-sm text-slate-700 leading-relaxed pr-8">{booking.address}</p>
                            <Button
                                onClick={openMaps}
                                variant="outline"
                                size="sm"
                                className="mt-4 w-full bg-white hover:bg-slate-50 border-slate-200 text-indigo-600 gap-2 rounded-xl"
                            >
                                <Navigation className="h-4 w-4" /> Get Directions (Google Maps)
                            </Button>
                        </div>
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Instructions</p>
                            <p className="text-sm text-slate-600 italic bg-amber-50/50 p-4 rounded-2xl border border-amber-50">
                                "{booking.notes}"
                            </p>
                        </div>
                    )}

                    {/* OTP ACTION PANEL */}
                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                        <div className="pt-6 border-t border-slate-100">
                            {!booking.otp_verified ? (
                                <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Smartphone className="h-6 w-6" />
                                        <h3 className="font-bold">Start Job with OTP</h3>
                                    </div>
                                    <p className="text-indigo-100 text-sm mb-6">
                                        Ask the customer for the 6-digit verification code to begin the service.
                                    </p>
                                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                                        <div className="relative">
                                            <Input
                                                value={otpInput}
                                                onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="Enter 6-digit OTP"
                                                className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 text-center text-xl font-bold tracking-widest rounded-2xl focus:ring-white/30"
                                            />
                                            {verifying && <div className="absolute right-4 top-4 font-bold text-xs">VERIFYING...</div>}
                                        </div>
                                        {otpError && (
                                            <p className="text-xs text-red-100 bg-red-500/20 px-3 py-2 rounded-lg border border-red-500/30 flex items-center gap-2">
                                                <X className="h-3 w-3" /> {otpError}
                                            </p>
                                        )}
                                        <Button
                                            type="submit"
                                            disabled={otpInput.length !== 6 || verifying}
                                            className="w-full h-12 bg-white text-indigo-600 hover:bg-indigo-50 font-bold rounded-2xl"
                                        >
                                            Verify & Start Service
                                        </Button>
                                    </form>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        <p className="text-sm text-emerald-800 font-medium">Service is currently in progress.</p>
                                    </div>
                                    <Button
                                        onClick={handleMarkComplete}
                                        disabled={completing}
                                        className="w-full h-14 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl text-base shadow-xl"
                                    >
                                        {completing ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Mark as Successfully Completed'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatusIcon({ status }: { status: string }) {
    switch (status) {
        case 'completed': return <CheckCircle className="h-4 w-4" />
        case 'in_progress': return <Clock className="h-4 w-4 animate-pulse" />
        case 'cancelled': return <X className="h-4 w-4" />
        default: return <Clock className="h-4 w-4" />
    }
}
