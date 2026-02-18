'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, Search, User, Mail, Calendar, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Provider {
    id: string
    full_name: string
    email: string
    role: string
    is_verified: boolean
    created_at: string
    phone?: string
    avatar_url?: string
}

export default function ProvidersPage() {
    const [providers, setProviders] = useState<Provider[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all')
    const [search, setSearch] = useState('')
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        fetchProviders()
    }, [])

    async function fetchProviders() {
        setLoading(true)
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'provider')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setProviders(data as Provider[])
        }
        setLoading(false)
    }

    async function handleVerify(providerId: string, verified: boolean) {
        setActionLoading(providerId)
        const { error } = await supabase
            .from('profiles')
            .update({ is_verified: verified })
            .eq('id', providerId)

        if (!error) {
            setProviders(prev =>
                prev.map(p => p.id === providerId ? { ...p, is_verified: verified } : p)
            )
        }
        setActionLoading(null)
    }

    async function handleDelete(providerId: string) {
        if (!confirm('Are you sure you want to remove this provider? This action cannot be undone.')) return

        setActionLoading(providerId)
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', providerId)

        if (!error) {
            setProviders(prev => prev.filter(p => p.id !== providerId))
        } else {
            alert('Failed to delete provider: ' + error.message)
        }
        setActionLoading(null)
    }

    const filteredProviders = providers.filter(p => {
        const matchesFilter =
            filter === 'all' ? true :
                filter === 'pending' ? !p.is_verified :
                    p.is_verified

        const matchesSearch = search === '' ||
            p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            p.email?.toLowerCase().includes(search.toLowerCase())

        return matchesFilter && matchesSearch
    })

    const pendingCount = providers.filter(p => !p.is_verified).length
    const verifiedCount = providers.filter(p => p.is_verified).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Provider Verification</h1>
                <p className="text-sm text-slate-500 mt-1">Review and manage service provider applications</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'all'
                            ? 'bg-slate-800 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        All ({providers.length})
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'pending'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            Pending ({pendingCount})
                        </span>
                    </button>
                    <button
                        onClick={() => setFilter('verified')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'verified'
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Verified ({verifiedCount})
                        </span>
                    </button>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search providers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10 rounded-xl border-slate-200"
                    />
                </div>
            </div>

            {/* Provider List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-slate-100" />
                                <div className="flex-1 space-y-2">
                                    <div className="w-32 h-4 bg-slate-100 rounded" />
                                    <div className="w-48 h-3 bg-slate-50 rounded" />
                                </div>
                                <div className="w-20 h-8 bg-slate-100 rounded-lg" />
                            </div>
                        ))}
                    </div>
                ) : filteredProviders.length === 0 ? (
                    <div className="p-12 text-center">
                        <User className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No providers found</p>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting your filter or search</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {filteredProviders.map((provider) => (
                            <div
                                key={provider.id}
                                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 hover:bg-slate-50/50 transition-colors"
                            >
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                                    {provider.full_name?.charAt(0)?.toUpperCase() || 'P'}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-slate-800 truncate">{provider.full_name || 'Unnamed Provider'}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1 text-xs text-slate-400">
                                            <Mail className="h-3 w-3" />
                                            {provider.email}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-slate-400">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(provider.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="shrink-0">
                                    {provider.is_verified ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                                            <CheckCircle className="h-3.5 w-3.5" />
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                                            <Clock className="h-3.5 w-3.5" />
                                            Pending
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                {provider.is_verified ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleVerify(provider.id, false)}
                                        disabled={actionLoading === provider.id}
                                        className="border-amber-200 text-amber-600 hover:bg-amber-50 rounded-lg text-xs h-8 px-3"
                                    >
                                        <XCircle className="h-3.5 w-3.5 mr-1" />
                                        Revoke
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => handleVerify(provider.id, true)}
                                        disabled={actionLoading === provider.id}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs h-8 px-3"
                                    >
                                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                        Approve
                                    </Button>
                                )}

                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDelete(provider.id)}
                                    disabled={actionLoading === provider.id}
                                    className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs h-8 px-3"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
