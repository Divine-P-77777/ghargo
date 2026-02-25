'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import {
    Search, CalendarCheck, Clock, CheckCircle,
    XCircle, AlertCircle, User, MapPin, ChevronLeft, ChevronRight
} from "lucide-react"

interface Booking {
    id: string
    booking_date: string
    time_slot: string
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    address: string
    notes: string | null
    created_at: string
    user: { full_name: string; email: string } | null
    provider: { full_name: string } | null
    service: { title: string } | null
}

const PAGE_SIZE = 10

const STATUS_STYLES = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock },
    confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', icon: CheckCircle },
    completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
}

const ALL_STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [page, setPage] = useState(1)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => { fetchBookings() }, [])
    useEffect(() => { setPage(1) }, [search, statusFilter])

    async function fetchBookings() {
        setLoading(true)
        const { data } = await supabase
            .from('bookings')
            .select(`
                id, booking_date, time_slot, status, address, notes, created_at,
                user:profiles!bookings_user_id_fkey(full_name, email),
                provider:profiles!bookings_provider_id_fkey(full_name),
                service:services!bookings_service_id_fkey(title)
            `)
            .order('created_at', { ascending: false })

        if (data) setBookings(data as unknown as Booking[])
        setLoading(false)
    }

    async function updateStatus(id: string, status: string) {
        setActionLoading(id)
        await supabase.from('bookings').update({ status }).eq('id', id)
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: status as Booking['status'] } : b))
        setActionLoading(null)
    }

    const filtered = bookings.filter(b => {
        const matchStatus = statusFilter === 'all' || b.status === statusFilter
        const q = search.toLowerCase()
        const matchSearch = !search ||
            b.user?.full_name?.toLowerCase().includes(q) ||
            b.user?.email?.toLowerCase().includes(q) ||
            b.service?.title?.toLowerCase().includes(q) ||
            b.address?.toLowerCase().includes(q)
        return matchStatus && matchSearch
    })

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const counts = ALL_STATUSES.map(s => ({
        key: s,
        label: s === 'all' ? `All (${bookings.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${bookings.filter(b => b.status === s).length})`,
    }))

    return (
        <div className="space-y-5 py-16 md:py-6">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Bookings</h1>
                <p className="text-sm text-slate-500 mt-1">View and manage all service bookings</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3">
                {/* Status tabs — scrollable on mobile */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {counts.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${statusFilter === key
                                ? key === 'all' ? 'bg-slate-800 text-white'
                                    : key === 'pending' ? 'bg-amber-500 text-white'
                                        : key === 'confirmed' ? 'bg-blue-500 text-white'
                                            : key === 'completed' ? 'bg-emerald-500 text-white'
                                                : 'bg-red-500 text-white'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by customer, service, or address..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 h-10 rounded-xl border-slate-200 text-sm"
                    />
                </div>
            </div>

            {/* Cards (mobile) + Table (desktop) */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : paginated.length === 0 ? (
                    <div className="py-16 text-center">
                        <CalendarCheck className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium text-sm">No bookings found</p>
                        <p className="text-slate-300 text-xs mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile: Card view */}
                        <div className="md:hidden divide-y divide-slate-50">
                            {paginated.map(b => {
                                const s = STATUS_STYLES[b.status]
                                const SIcon = s.icon
                                return (
                                    <div key={b.id} className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-sm text-slate-800">{b.user?.full_name || 'Unknown User'}</p>
                                                <p className="text-xs text-slate-400">{b.user?.email}</p>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${s.bg} ${s.text}`}>
                                                <SIcon className="h-3 w-3" />
                                                {b.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <CalendarCheck className="h-3 w-3" />
                                                {new Date(b.booking_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · {b.time_slot}
                                            </span>
                                            {b.service && <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-medium">{b.service.title}</span>}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                            <MapPin className="h-3 w-3 shrink-0" />
                                            <span className="truncate">{b.address}</span>
                                        </div>
                                        {/* Status change */}
                                        <select
                                            value={b.status}
                                            disabled={actionLoading === b.id}
                                            onChange={e => updateStatus(b.id, e.target.value)}
                                            className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Desktop: Table view */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {['#', 'Customer', 'Service', 'Date & Time', 'Address', 'Provider', 'Status', 'Change Status'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginated.map((b, idx) => {
                                        const s = STATUS_STYLES[b.status]
                                        const SIcon = s.icon
                                        return (
                                            <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-3 text-slate-400 text-xs tabular-nums">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-800 text-sm">{b.user?.full_name || '—'}</p>
                                                    <p className="text-xs text-slate-400">{b.user?.email}</p>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 text-sm">{b.service?.title || '—'}</td>
                                                <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">
                                                    {new Date(b.booking_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    <br />{b.time_slot}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 text-xs max-w-[160px] truncate">{b.address}</td>
                                                <td className="px-4 py-3 text-slate-600 text-sm">{b.provider?.full_name || <span className="text-slate-300 italic">Unassigned</span>}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
                                                        <SIcon className="h-3 w-3" />
                                                        {b.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={b.status}
                                                        disabled={actionLoading === b.id}
                                                        onChange={e => updateStatus(b.id, e.target.value)}
                                                        className="h-8 px-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 w-32"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Pagination */}
                {!loading && filtered.length > PAGE_SIZE && (
                    <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-xs font-medium text-slate-600">{page}/{totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Supabase RLS note */}
            {!loading && bookings.length === 0 && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700">
                        No bookings found. If bookings exist in your database, you may need to add an admin RLS policy on the <code className="font-mono bg-amber-100 px-1 rounded">bookings</code> table to allow authenticated admins to read all rows.
                    </p>
                </div>
            )}
        </div>
    )
}
