'use client'

import { useEffect, useState, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/AuthProvider"
import { Button } from "@/components/ui/button"
import {
    Clock, MapPin, Star, ArrowLeft,
    CheckCircle, Loader2, AlertCircle, Phone, ChevronLeft, ChevronRight, LocateFixed
} from "lucide-react"
import Link from "next/link"

interface Provider {
    id: string
    full_name: string
    avatar_url: string | null
    service_type: string | null
    hourly_rate: number | null
    phone: string | null
    available_days: number[] | null
    available_time_slots: string[] | null
}

const ALL_TIME_SLOTS = [
    "08:00 AM – 10:00 AM",
    "10:00 AM – 12:00 PM",
    "12:00 PM – 02:00 PM",
    "02:00 PM – 04:00 PM",
    "04:00 PM – 06:00 PM",
    "06:00 PM – 08:00 PM",
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MON_SAT = [1, 2, 3, 4, 5, 6]

/** Parse slot start time → minutes since midnight */
function slotStartMinutes(slot: string): number {
    const startStr = slot.split('–')[0].trim()          // "08:00 AM"
    const [timePart, period] = startStr.split(' ')
    const [h, m] = timePart.split(':').map(Number)
    let hour = h
    if (period === 'PM' && h !== 12) hour += 12
    if (period === 'AM' && h === 12) hour = 0
    return hour * 60 + (m || 0)
}

/** Returns true if a slot is bookable (future by ≥2 hours) for today */
function isSlotAvailableForToday(slot: string): boolean {
    const now = new Date()
    const nowMins = now.getHours() * 60 + now.getMinutes()
    const BUFFER = 120  // 2 hours
    return slotStartMinutes(slot) > nowMins + BUFFER
}

/** Is `d` today (wall-clock local date)? */
function isToday(d: Date): boolean {
    const t = new Date()
    return d.getDate() === t.getDate() &&
        d.getMonth() === t.getMonth() &&
        d.getFullYear() === t.getFullYear()
}

/** Generate next `count` working dates for provider */
function getAvailableDates(availableDays: number[], count = 14): Date[] {
    const dates: Date[] = []
    const start = new Date(); start.setHours(0, 0, 0, 0)
    const d = new Date(start)
    while (dates.length < count) {
        if (availableDays.includes(d.getDay())) dates.push(new Date(d))
        d.setDate(d.getDate() + 1)
    }
    return dates
}

function dateLabel(d: Date): { top: string; bot: string } {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const tom = new Date(today); tom.setDate(tom.getDate() + 1)
    if (d.getTime() === today.getTime()) return { top: 'Today', bot: d.getDate().toString() }
    if (d.getTime() === tom.getTime()) return { top: 'Tomorrow', bot: d.getDate().toString() }
    return { top: DAYS[d.getDay()], bot: d.getDate().toString() }
}

function toYMD(d: Date) { return d.toISOString().split('T')[0] }

// --- Refactored Content Component ---
function BookingFormContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const supabase = createClient()

    const providerId = searchParams.get('providerId')

    const [provider, setProvider] = useState<Provider | null>(null)
    const [providerLoading, setProviderLoading] = useState(true)
    const [providerError, setProviderError] = useState('')

    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [timeSlot, setTimeSlot] = useState('')
    const [address, setAddress] = useState('')
    const [locating, setLocating] = useState(false)
    const [locError, setLocError] = useState('')
    const [notes, setNotes] = useState('')
    const [dateOffset, setDateOffset] = useState(0)

    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [generatedOtp, setGeneratedOtp] = useState('')
    const [formError, setFormError] = useState('')

    const VISIBLE = 5

    useEffect(() => {
        if (providerId) fetchProvider()
        else { setProviderError('No provider specified.'); setProviderLoading(false) }
    }, [providerId])

    async function fetchProvider() {
        setProviderLoading(true)
        const { data, error } = await supabase
            .from('providers')
            .select('id, full_name, avatar_url, service_type, hourly_rate, phone, available_days, available_time_slots')
            .eq('id', providerId!)
            .eq('is_approved', true)
            .single()
        if (error || !data) { setProviderError('Provider not found.'); setProviderLoading(false); return }
        const p = data as Provider
        setProvider(p)
        const days = p.available_days?.length ? p.available_days : MON_SAT
        const dates = getAvailableDates(days)
        if (dates.length) setSelectedDate(dates[0])
        setProviderLoading(false)
    }

    // ── Compute visible time slots based on date + provider prefs + real-time ──
    const visibleSlots = useCallback((): string[] => {
        if (!provider) return []
        const providerSlots = provider.available_time_slots?.length
            ? provider.available_time_slots
            : ALL_TIME_SLOTS
        if (!selectedDate) return providerSlots
        if (isToday(selectedDate)) {
            return providerSlots.filter(isSlotAvailableForToday)
        }
        return providerSlots
    }, [provider, selectedDate])

    // Auto-select first available slot when date changes
    useEffect(() => {
        const slots = visibleSlots()
        setTimeSlot(slots.length ? slots[0] : '')
    }, [selectedDate, visibleSlots])

    // ── Geolocation + Nominatim reverse geocoding ──
    async function useMyLocation() {
        if (!navigator.geolocation) { setLocError('Geolocation not supported by your browser.'); return }
        setLocating(true)
        setLocError('')
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
                        { headers: { 'Accept-Language': 'en' } }
                    )
                    const data = await res.json()
                    const a = data.address || {}
                    const parts = [
                        a.house_number,
                        a.road || a.pedestrian || a.footway,
                        a.suburb || a.neighbourhood || a.village,
                        a.city || a.town || a.county,
                        a.state,
                        a.postcode,
                    ].filter(Boolean)
                    setAddress(parts.join(', '))
                } catch {
                    setLocError('Could not reverse geocode your location.')
                }
                setLocating(false)
            },
            (err) => {
                setLocError(
                    err.code === 1 ? 'Location permission denied. Please allow location access.' :
                        err.code === 2 ? 'Location unavailable. Try again.' :
                            'Location request timed out.'
                )
                setLocating(false)
            },
            { timeout: 10000, maximumAge: 0 }
        )
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!user) { router.push('/auth/login'); return }
        if (!selectedDate) { setFormError('Please select a date.'); return }
        if (!timeSlot) { setFormError('No available time slots for this date. Please pick another day.'); return }
        if (!address.trim()) { setFormError('Please enter your address.'); return }
        setFormError('')
        setSubmitting(true)

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        setGeneratedOtp(otp)

        const { error } = await supabase.from('bookings').insert({
            user_id: user.id,
            provider_id: providerId,
            booking_date: toYMD(selectedDate),
            time_slot: timeSlot,
            address: address.trim(),
            notes: notes.trim() || null,
            status: 'pending',
            otp,
        })

        if (error) setFormError('Failed to create booking: ' + error.message)
        else setSuccess(true)
        setSubmitting(false)
    }

    if (authLoading || providerLoading) {
        return <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
    }

    if (!user) {
        return <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Sign in required</h2>
            <p className="text-slate-500 mb-6">You need to be logged in to book a service.</p>
            <Link href={`/auth/login?next=/bookings/new?providerId=${providerId}`}>
                <Button className="bg-indigo-600 hover:bg-indigo-700">Sign In to Continue</Button>
            </Link>
        </div>
    }

    if (providerError || !provider) {
        return <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-12 w-12 text-rose-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Provider not available</h2>
            <p className="text-slate-500 mb-6">{providerError || 'This provider could not be found.'}</p>
            <Link href="/services"><Button variant="outline">Browse Other Providers</Button></Link>
        </div>
    }

    if (success) {
        return <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h2>
            <p className="text-slate-500 mb-6">
                Your booking with <span className="font-semibold text-slate-700">{provider.full_name}</span> has been submitted.
            </p>

            {/* OTP Display */}
            <div className="bg-indigo-600 rounded-2xl p-6 mb-8 text-white max-w-sm mx-auto shadow-lg shadow-indigo-100">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-100 mb-2">Verification OTP</p>
                <p className="text-4xl font-bold tracking-[0.2em]">{generatedOtp}</p>
                <p className="text-[10px] text-indigo-100 mt-3 leading-relaxed">
                    Share this code with the provider <b>only when they arrive</b> at your home to start the service.
                </p>
            </div>

            <p className="text-sm text-slate-400 mb-8">You'll find this OTP anytime in your Booking History.</p>
            <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/bookings"><Button className="bg-indigo-600 hover:bg-indigo-700">View My Bookings</Button></Link>
                <Link href="/services"><Button variant="outline">Browse More Services</Button></Link>
            </div>
        </div>
    }

    const workDays = provider.available_days?.length ? provider.available_days : MON_SAT
    const allDates = getAvailableDates(workDays, 14)
    const visibleDates = allDates.slice(dateOffset, dateOffset + VISIBLE)
    const canPrev = dateOffset > 0
    const canNext = dateOffset + VISIBLE < allDates.length
    const slots = visibleSlots()

    return (
        <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
            <div className="container mx-auto px-4 max-w-2xl">

                <Link href="/services" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Services
                </Link>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Book a Service</h1>

                {/* Provider card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 mb-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 overflow-hidden shrink-0 flex items-center justify-center">
                        {provider.avatar_url
                            ? <img src={provider.avatar_url} alt={provider.full_name} className="w-full h-full object-cover" />
                            : <span className="text-indigo-500 font-bold text-2xl">{provider.full_name.charAt(0)}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-slate-900 text-lg truncate">{provider.full_name}</h2>
                        <p className="text-sm text-emerald-600 font-medium">{provider.service_type || 'General Service'}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> 4.9
                            </span>
                            {provider.phone && (
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                    <Phone className="h-3 w-3" /> {provider.phone}
                                </span>
                            )}
                            <span className="text-xs font-bold text-slate-700">
                                ₹{provider.hourly_rate || 500}<span className="font-normal text-slate-400">/visit</span>
                            </span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 space-y-6">
                    <h3 className="font-semibold text-slate-800 text-base border-b border-slate-50 pb-4">Booking Details</h3>

                    {/* ── Date Chips ──────────────────────────────── */}
                    <div>
                        <label className="text-xs font-semibold text-slate-500 mb-3 block uppercase tracking-wide">
                            📅 Choose a Date *
                        </label>
                        <p className="text-[11px] text-slate-400 mb-3">
                            Available: {workDays.map(d => DAYS[d]).join(', ')}
                        </p>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setDateOffset(o => Math.max(0, o - 1))} disabled={!canPrev}
                                className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-20 shrink-0">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <div className="flex gap-2 flex-1 overflow-hidden">
                                {visibleDates.map(d => {
                                    const { top, bot } = dateLabel(d)
                                    const isSel = selectedDate && toYMD(d) === toYMD(selectedDate)
                                    return (
                                        <button key={toYMD(d)} type="button" onClick={() => setSelectedDate(d)}
                                            className={`flex-1 flex flex-col items-center py-3 px-1 rounded-2xl border text-center transition-all duration-200 min-w-0 ${isSel
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'}`}>
                                            <span className={`text-[10px] font-semibold uppercase tracking-wide ${isSel ? 'text-indigo-100' : 'text-slate-400'}`}>{top}</span>
                                            <span className={`text-xl font-bold leading-tight ${isSel ? 'text-white' : 'text-slate-800'}`}>{bot}</span>
                                            <span className={`text-[10px] ${isSel ? 'text-indigo-200' : 'text-slate-300'}`}>
                                                {d.toLocaleString('default', { month: 'short' })}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                            <button type="button" onClick={() => setDateOffset(o => o + 1)} disabled={!canNext}
                                className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-20 shrink-0">
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                        {selectedDate && (
                            <p className="mt-2 text-xs text-indigo-600 font-medium text-center">
                                {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        )}
                    </div>

                    {/* ── Time Slots (real-time filtered) ─────────── */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                <Clock className="inline h-3.5 w-3.5 mr-1.5" />Time Slot *
                            </label>
                            {selectedDate && isToday(selectedDate) && (
                                <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                    ⏰ Showing next available slots (2hr buffer)
                                </span>
                            )}
                        </div>

                        {slots.length === 0 ? (
                            <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700 flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>No slots left for today — the day is too far along. Please choose another date.</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {slots.map(slot => (
                                    <button key={slot} type="button" onClick={() => setTimeSlot(slot)}
                                        className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all text-center ${timeSlot === slot
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'}`}>
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Address with Location autofill ──────────── */}
                    <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">
                            <MapPin className="inline h-3.5 w-3.5 mr-1.5" />Your Address *
                        </label>
                        <div className="relative">
                            <textarea
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                placeholder="House No., Street, Area, City – PIN"
                                rows={2}
                                required
                                className="w-full px-3 py-2.5 pr-32 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={useMyLocation}
                                disabled={locating}
                                title="Auto-fill from your current location"
                                className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition-all disabled:opacity-60"
                            >
                                {locating
                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    : <LocateFixed className="h-3.5 w-3.5" />}
                                {locating ? 'Locating…' : 'Use Location'}
                            </button>
                        </div>
                        {locError && (
                            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3 shrink-0" /> {locError}
                            </p>
                        )}
                        <p className="text-[11px] text-slate-400 mt-1.5">
                            Tap <span className="font-medium text-indigo-500">Use Location</span> to auto-fill from GPS, or type manually.
                        </p>
                    </div>

                    {/* ── Notes ───────────────────────────────────── */}
                    <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">
                            Notes <span className="capitalize font-normal">(optional)</span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Describe the issue or any special instructions..."
                            rows={2}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {formError && (
                        <div className="flex items-start gap-2 bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />{formError}
                        </div>
                    )}

                    <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between text-sm">
                        <span className="text-slate-500">Estimated charge</span>
                        <span className="font-bold text-slate-900 text-lg">₹{provider.hourly_rate || 500}</span>
                    </div>

                    <Button type="submit" disabled={submitting || !selectedDate || !timeSlot}
                        className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-semibold disabled:opacity-50">
                        {submitting
                            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</>
                            : 'Confirm Booking'}
                    </Button>
                </form>
            </div>
        </div>
    )
}

// --- Main Page Component ---
export default function NewBookingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
        }>
            <BookingFormContent />
        </Suspense>
    )
}
