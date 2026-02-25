'use client'

import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Plus, Search, ChevronLeft, ChevronRight,
    Trash2, CheckCircle, Clock, X, Upload, User, Pencil
} from "lucide-react"

interface Provider {
    id: string
    full_name: string
    email: string | null
    phone: string | null
    service_type: string | null
    bio: string | null
    hourly_rate: number | null
    avatar_url: string | null
    is_approved: boolean
    created_at: string
    available_days: number[] | null
    available_time_slots: string[] | null
}

const PAGE_SIZE = 10

const SERVICE_TYPES = [
    "Electrician", "Plumber", "Cleaner", "Carpenter",
    "Painter", "Mechanic", "AC Repair", "Pest Control", "Other"
]

const emptyForm = {
    full_name: '', email: '', phone: '',
    service_type: 'Electrician', hourly_rate: '',
    doc_type: 'Aadhar', doc_number: '', address: ''
}

const DEFAULT_AVAILABLE_DAYS = [1, 2, 3, 4, 5, 6] // Mon–Sat
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const ALL_TIME_SLOTS = [
    "08:00 AM – 10:00 AM",
    "10:00 AM – 12:00 PM",
    "12:00 PM – 02:00 PM",
    "02:00 PM – 04:00 PM",
    "04:00 PM – 06:00 PM",
    "06:00 PM – 08:00 PM",
]

export default function ManageProvidersPage() {
    const [providers, setProviders] = useState<Provider[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all')
    const [page, setPage] = useState(1)
    const [showModal, setShowModal] = useState(false)
    const [editingProvider, setEditingProvider] = useState<Provider | null>(null) // null = add mode
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    // Form state
    const [form, setForm] = useState(emptyForm)
    const [otherServiceType, setOtherServiceType] = useState('')
    const [availableDays, setAvailableDays] = useState<number[]>(DEFAULT_AVAILABLE_DAYS)
    const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(ALL_TIME_SLOTS)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [formLoading, setFormLoading] = useState(false)
    const [formError, setFormError] = useState('')
    const fileRef = useRef<HTMLInputElement>(null)

    // Camera modal state
    const [showCamera, setShowCamera] = useState(false)
    const [cameraError, setCameraError] = useState('')
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const supabase = createClient()

    const fetchProviders = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('providers')
            .select('*')
            .order('created_at', { ascending: false })
        if (!error && data) setProviders(data as Provider[])
        setLoading(false)
    }, [supabase])

    useEffect(() => { fetchProviders() }, [fetchProviders])

    // Reset page when filter/search changes
    useEffect(() => { setPage(1) }, [filter, search])

    async function handleToggleApproval(id: string, current: boolean) {
        setActionLoading(id)
        const { error } = await supabase
            .from('providers')
            .update({ is_approved: !current })
            .eq('id', id)
        if (!error) {
            setProviders(prev => prev.map(p => p.id === id ? { ...p, is_approved: !current } : p))
        }
        setActionLoading(null)
    }

    async function handleDelete(id: string) {
        if (!confirm('Remove this provider? This cannot be undone.')) return
        setActionLoading(id)
        const { error } = await supabase.from('providers').delete().eq('id', id)
        if (!error) setProviders(prev => prev.filter(p => p.id !== id))
        setActionLoading(null)
    }

    function openEdit(p: Provider) {
        setEditingProvider(p)
        setForm({
            full_name: p.full_name,
            email: p.email || '',
            phone: p.phone || '',
            service_type: SERVICE_TYPES.includes(p.service_type || '') ? (p.service_type || 'Other') : 'Other',
            hourly_rate: p.hourly_rate?.toString() || '',
            doc_type: 'Aadhar',
            doc_number: '',
            address: '',
        })
        setOtherServiceType(SERVICE_TYPES.includes(p.service_type || '') ? '' : (p.service_type || ''))
        setAvailableDays(p.available_days?.length ? p.available_days : DEFAULT_AVAILABLE_DAYS)
        setAvailableTimeSlots(p.available_time_slots?.length ? p.available_time_slots : ALL_TIME_SLOTS)
        setImagePreview(p.avatar_url || null)
        setImageFile(null)
        setFormError('')
        setShowModal(true)
    }

    async function handleAddProvider(e: React.FormEvent) {
        e.preventDefault()
        setFormLoading(true)
        setFormError('')

        if (!form.full_name.trim()) {
            setFormError('Full name is required.')
            setFormLoading(false)
            return
        }

        let avatar_url: string | null = editingProvider?.avatar_url ?? null

        if (imageFile) {
            const ext = imageFile.name.split('.').pop()
            const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
            const { error: uploadError } = await supabase.storage
                .from('providers')
                .upload(filename, imageFile, { cacheControl: '3600', upsert: false })

            if (uploadError) {
                setFormError('Image upload failed: ' + uploadError.message)
                setFormLoading(false)
                return
            }
            const { data: urlData } = supabase.storage.from('providers').getPublicUrl(filename)
            avatar_url = urlData.publicUrl
        }

        const payload = {
            full_name: form.full_name.trim(),
            email: form.email.trim() || null,
            phone: form.phone.trim() || null,
            service_type: form.service_type === 'Other'
                ? (otherServiceType.trim() || 'Other')
                : form.service_type,
            hourly_rate: form.hourly_rate ? parseInt(form.hourly_rate) : null,
            doc_type: form.doc_type || null,
            doc_number: form.doc_number.trim() || null,
            address: form.address.trim() || null,
            available_days: availableDays,
            available_time_slots: availableTimeSlots,
            avatar_url,
        }

        let error
        if (editingProvider) {
            // — EDIT MODE —
            ; ({ error } = await supabase.from('providers').update(payload).eq('id', editingProvider.id))
            if (!error) {
                setProviders(prev => prev.map(p => p.id === editingProvider.id ? { ...p, ...payload } : p))
            }
        } else {
            // — ADD MODE —
            ; ({ error } = await supabase.from('providers').insert({ ...payload, is_approved: false }))
        }

        if (error) {
            setFormError((editingProvider ? 'Failed to update' : 'Failed to add') + ' provider: ' + error.message)
        } else {
            setShowModal(false)
            setEditingProvider(null)
            resetForm()
            if (!editingProvider) fetchProviders()  // refresh list on add; edit updates inline
        }
        setFormLoading(false)
    }

    function resetForm() {
        setForm(emptyForm)
        setOtherServiceType('')
        setAvailableDays(DEFAULT_AVAILABLE_DAYS)
        setAvailableTimeSlots(ALL_TIME_SLOTS)
        setImageFile(null)
        setImagePreview(null)
        setFormError('')
        setEditingProvider(null)
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    // ── Camera via getUserMedia (desktop webcam + iOS + Android) ──
    async function openCamera() {
        setCameraError('')
        setShowCamera(true)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
            })
            streamRef.current = stream
            // Wait for the video element to mount before assigning
            requestAnimationFrame(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.play().catch(() => { })
                }
            })
        } catch {
            setCameraError('Camera access was denied or not available. Please allow camera permission and try again.')
        }
    }

    function capturePhoto() {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return
        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 480
        canvas.getContext('2d')?.drawImage(video, 0, 0)
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
                setImageFile(file)
                setImagePreview(URL.createObjectURL(blob))
            }
        }, 'image/jpeg', 0.92)
        closeCamera()
    }

    function closeCamera() {
        streamRef.current?.getTracks().forEach(t => t.stop())
        streamRef.current = null
        setShowCamera(false)
        setCameraError('')
    }

    // Compute filtered & paginated lists
    const filtered = providers.filter(p => {
        const matchFilter =
            filter === 'all' ? true :
                filter === 'approved' ? p.is_approved :
                    !p.is_approved
        const matchSearch = !search || p.full_name.toLowerCase().includes(search.toLowerCase())
        return matchFilter && matchSearch
    })

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    const approvedCount = providers.filter(p => p.is_approved).length
    const pendingCount = providers.filter(p => !p.is_approved).length

    type FilterVal = 'all' | 'approved' | 'pending'
    const tabs: { val: FilterVal; label: string; activeClass: string }[] = [
        { val: 'all', label: `All (${providers.length})`, activeClass: 'bg-slate-800 text-white' },
        { val: 'approved', label: `Approved (${approvedCount})`, activeClass: 'bg-emerald-500 text-white' },
        { val: 'pending', label: `Pending (${pendingCount})`, activeClass: 'bg-amber-500 text-white' },
    ]

    return (
        <div className="space-y-6 py-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manage Providers</h1>
                    <p className="text-sm text-slate-500 mt-1">Add and control service provider listings</p>
                </div>
                <Button
                    onClick={() => { setEditingProvider(null); setShowModal(true); resetForm() }}
                    className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2"
                >
                    <Plus className="h-4 w-4" /> Add Provider
                </Button>
            </div>

            {/* Tabs + Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                    {tabs.map(({ val, label, activeClass }) => (
                        <button
                            key={val}
                            onClick={() => setFilter(val)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === val
                                ? activeClass
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 h-10 rounded-xl border-slate-200"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-10">#</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Provider</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Service</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rate</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Added</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(8)].map((_, j) => (
                                            <td key={j} className="px-4 py-4">
                                                <div className="h-4 bg-slate-100 rounded animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-16 text-center">
                                        <User className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                                        <p className="text-slate-400 font-medium text-sm">No providers found</p>
                                        <p className="text-slate-300 text-xs mt-1">Try adjusting your search or filter</p>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((p, idx) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 text-slate-400 text-xs tabular-nums">
                                            {(page - 1) * PAGE_SIZE + idx + 1}
                                        </td>

                                        {/* Avatar + Name */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-indigo-50 flex items-center justify-center">
                                                    {p.avatar_url ? (
                                                        <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-indigo-500 font-bold text-sm">
                                                            {p.full_name.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-800 text-sm truncate max-w-[140px]">{p.full_name}</p>
                                                    {p.email && <p className="text-xs text-slate-400 truncate max-w-[140px]">{p.email}</p>}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-slate-600">{p.service_type || '—'}</td>
                                        <td className="px-4 py-3 text-slate-600 tabular-nums">{p.phone || '—'}</td>
                                        <td className="px-4 py-3 text-slate-600">{p.hourly_rate ? `₹${p.hourly_rate}` : '—'}</td>

                                        {/* Status Toggle */}
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleToggleApproval(p.id, p.is_approved)}
                                                disabled={actionLoading === p.id}
                                                title={p.is_approved ? 'Click to revoke' : 'Click to approve'}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer disabled:opacity-50 ${p.is_approved
                                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                                    }`}
                                            >
                                                {actionLoading === p.id ? (
                                                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                                ) : p.is_approved ? (
                                                    <CheckCircle className="h-3 w-3" />
                                                ) : (
                                                    <Clock className="h-3 w-3" />
                                                )}
                                                {p.is_approved ? 'Approved' : 'Pending'}
                                            </button>
                                        </td>

                                        <td className="px-4 py-3 text-slate-400 text-xs tabular-nums">
                                            {new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>

                                        {/* Actions: Edit + Delete */}
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openEdit(p)}
                                                    disabled={actionLoading === p.id}
                                                    title="Edit provider"
                                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors disabled:opacity-50"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    disabled={actionLoading === p.id}
                                                    title="Delete provider"
                                                    className="p-1.5 rounded-lg border border-red-200 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && filtered.length > PAGE_SIZE && (
                    <div className="px-5 py-4 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} providers
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-xs font-medium text-slate-600 px-2">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Add / Edit Provider Modal ── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl z-10">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    {editingProvider ? 'Edit Provider' : 'Add New Provider'}
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {editingProvider ? `Editing: ${editingProvider.full_name}` : "They'll be added as Pending by default"}
                                </p>
                            </div>
                            <button
                                onClick={() => { setShowModal(false); setEditingProvider(null) }}
                                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleAddProvider} className="p-6 space-y-5">
                            {/* Image Upload — File or Camera */}
                            <div className="flex flex-col items-center gap-3">
                                {/* Preview circle */}
                                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center bg-slate-50">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-300">
                                            <Upload className="h-6 w-6 mb-1" />
                                            <span className="text-xs font-medium">Photo</span>
                                        </div>
                                    )}
                                </div>

                                {/* Two upload buttons */}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileRef.current?.click()}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-indigo-300 transition-all"
                                    >
                                        <Upload className="h-3.5 w-3.5" />
                                        Upload File
                                    </button>
                                    <button
                                        type="button"
                                        onClick={openCamera}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-indigo-300 transition-all"
                                    >
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Take Photo
                                    </button>
                                </div>

                                {/* Hidden file picker */}
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                                {/* Invisible canvas for snapshot */}
                                <canvas ref={canvasRef} className="hidden" />

                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={() => { setImageFile(null); setImagePreview(null) }}
                                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                                    >
                                        Remove photo
                                    </button>
                                )}
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Full Name *</label>
                                    <Input
                                        value={form.full_name}
                                        onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                        placeholder="e.g. Rakesh Kumar"
                                        className="rounded-xl border-slate-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Email</label>
                                    <Input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        placeholder="rakesh@example.com"
                                        className="rounded-xl border-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Phone</label>
                                    <Input
                                        value={form.phone}
                                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        placeholder="+91 98765 43210"
                                        className="rounded-xl border-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Service Type</label>
                                    <select
                                        value={form.service_type}
                                        onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}
                                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    {/* Show custom input when 'Other' is selected */}
                                    {form.service_type === 'Other' && (
                                        <Input
                                            value={otherServiceType}
                                            onChange={e => setOtherServiceType(e.target.value)}
                                            placeholder="e.g. Roof Repair, Carpentry..."
                                            className="rounded-xl border-slate-200 mt-2"
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Rate per Visit (₹)</label>
                                    <Input
                                        type="number"
                                        value={form.hourly_rate}
                                        onChange={e => setForm(f => ({ ...f, hourly_rate: e.target.value }))}
                                        placeholder="500"
                                        className="rounded-xl border-slate-200"
                                        min={0}
                                    />
                                </div>

                                {/* Document */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Document Type</label>
                                    <select
                                        value={form.doc_type}
                                        onChange={e => setForm(f => ({ ...f, doc_type: e.target.value }))}
                                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="Aadhar">Aadhar Card</option>
                                        <option value="PAN">PAN Card</option>
                                        <option value="Voter ID">Voter ID</option>
                                        <option value="Driving License">Driving License</option>
                                        <option value="Passport">Passport</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Document Number</label>
                                    <Input
                                        value={form.doc_number}
                                        onChange={e => setForm(f => ({ ...f, doc_number: e.target.value.toUpperCase() }))}
                                        placeholder={form.doc_type === 'PAN' ? 'ABCDE1234F' : form.doc_type === 'Aadhar' ? 'XXXX XXXX XXXX' : 'Document number'}
                                        className="rounded-xl border-slate-200 font-mono tracking-wide"
                                    />
                                </div>

                                {/* Address */}
                                <div className="col-span-2">
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Address</label>
                                    <textarea
                                        value={form.address}
                                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                        placeholder="Street / Area, City, State – PIN"
                                        rows={2}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Available Days */}
                                <div className="col-span-2">
                                    <label className="text-xs font-semibold text-slate-500 mb-2 block">Available Days</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {DAY_NAMES.map((name, idx) => {
                                            const checked = availableDays.includes(idx)
                                            return (
                                                <button
                                                    key={name}
                                                    type="button"
                                                    onClick={() => setAvailableDays(d =>
                                                        checked ? d.filter(x => x !== idx) : [...d, idx].sort()
                                                    )}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${checked
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                                                        }`}
                                                >
                                                    {name}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1.5">These days will appear as selectable slots on the booking page.</p>
                                </div>

                                {/* Available Time Slots */}
                                <div className="col-span-2">
                                    <label className="text-xs font-semibold text-slate-500 mb-2 block">Available Time Slots</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {ALL_TIME_SLOTS.map(slot => {
                                            const checked = availableTimeSlots.includes(slot)
                                            return (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    onClick={() => setAvailableTimeSlots(s =>
                                                        checked ? s.filter(x => x !== slot) : [...s, slot]
                                                    )}
                                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border text-left transition-all ${checked
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                                                        }`}
                                                >
                                                    {slot}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1.5">Deselect slots the provider never offers.</p>
                                </div>

                            </div>

                            {formError && (
                                <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                                    <X className="h-4 w-4 mt-0.5 shrink-0" />
                                    {formError}
                                </div>
                            )}

                            <div className="flex gap-3 pt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => { setShowModal(false); setEditingProvider(null) }}
                                    className="flex-1 rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                                >
                                    {formLoading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        editingProvider ? 'Save Changes' : 'Add Provider'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Camera Modal ── */}
            {showCamera && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-800">Take Photo</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Works on desktop, iPhone &amp; Android</p>
                            </div>
                            <button
                                onClick={closeCamera}
                                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Camera view */}
                        <div className="relative bg-black">
                            {cameraError ? (
                                <div className="flex flex-col items-center justify-center p-10 text-center gap-3">
                                    <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                    <p className="text-sm text-slate-500">{cameraError}</p>
                                    <button
                                        onClick={closeCamera}
                                        className="text-xs text-indigo-600 hover:underline"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full aspect-video object-cover"
                                />
                            )}
                        </div>

                        {/* Capture button */}
                        {!cameraError && (
                            <div className="p-5 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeCamera}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={capturePhoto}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <circle cx="12" cy="12" r="3" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    </svg>
                                    Capture
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
