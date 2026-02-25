'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import {
    Search, Users, Mail, Calendar, Shield,
    Trash2, ChevronLeft, ChevronRight, User
} from "lucide-react"

interface UserProfile {
    id: string
    full_name: string | null
    email: string
    role: 'user' | 'provider' | 'admin'
    avatar_url: string | null
    created_at: string
}

const PAGE_SIZE = 10

const ROLE_STYLES = {
    admin: 'bg-violet-50 text-violet-700 border border-violet-200',
    provider: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    user: 'bg-slate-50 text-slate-600 border border-slate-200',
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'provider' | 'admin'>('all')
    const [page, setPage] = useState(1)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => { fetchUsers() }, [])
    useEffect(() => { setPage(1) }, [search, roleFilter])

    async function fetchUsers() {
        setLoading(true)
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
        if (data) setUsers(data as UserProfile[])
        setLoading(false)
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this user profile? This cannot be undone.')) return
        setActionLoading(id)
        await supabase.from('profiles').delete().eq('id', id)
        setUsers(prev => prev.filter(u => u.id !== id))
        setActionLoading(null)
    }

    const filtered = users.filter(u => {
        const matchRole = roleFilter === 'all' || u.role === roleFilter
        const q = search.toLowerCase()
        const matchSearch = !search ||
            u.full_name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q)
        return matchRole && matchSearch
    })

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const tabs = [
        { key: 'all', label: `All (${users.length})` },
        { key: 'user', label: `Users (${users.filter(u => u.role === 'user').length})` },
        { key: 'provider', label: `Providers (${users.filter(u => u.role === 'provider').length})` },
        { key: 'admin', label: `Admins (${users.filter(u => u.role === 'admin').length})` },
    ]

    return (
        <div className="space-y-5 py-16 md:py-6">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Users</h1>
                <p className="text-sm text-slate-500 mt-1">All registered accounts on the platform</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3">
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setRoleFilter(t.key as typeof roleFilter)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${roleFilter === t.key
                                ? 'bg-slate-800 text-white shadow-sm'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 h-10 rounded-xl border-slate-200 text-sm"
                    />
                </div>
            </div>

            {/* Table / Cards */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 animate-pulse">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="w-32 h-3.5 bg-slate-100 rounded" />
                                    <div className="w-48 h-3 bg-slate-50 rounded" />
                                </div>
                                <div className="w-16 h-6 bg-slate-100 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : paginated.length === 0 ? (
                    <div className="py-16 text-center">
                        <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium text-sm">No users found</p>
                        <p className="text-slate-300 text-xs mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile: card list */}
                        <div className="md:hidden divide-y divide-slate-50">
                            {paginated.map(u => (
                                <div key={u.id} className="flex items-center gap-3 p-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 overflow-hidden">
                                        {u.avatar_url ? (
                                            <img src={u.avatar_url} alt={u.full_name || ''} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-indigo-500 font-bold text-sm">
                                                {(u.full_name || u.email).charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-slate-800 truncate">{u.full_name || '—'}</p>
                                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                            <Mail className="h-3 w-3 shrink-0" />
                                            <span className="truncate">{u.email}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${ROLE_STYLES[u.role]}`}>
                                            {u.role}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            disabled={actionLoading === u.id}
                                            className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop: table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {['#', 'User', 'Email', 'Role', 'Joined', 'Del'].map(h => (
                                            <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${h === 'Del' ? 'text-right' : 'text-left'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginated.map((u, idx) => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 text-slate-400 text-xs tabular-nums">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center overflow-hidden shrink-0">
                                                        {u.avatar_url ? (
                                                            <img src={u.avatar_url} alt={u.full_name || ''} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-indigo-500 font-bold text-xs">
                                                                {(u.full_name || u.email).charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-slate-800 text-sm">{u.full_name || <span className="text-slate-400 italic">No name</span>}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                                                    <Mail className="h-3 w-3 text-slate-300" />{u.email}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${ROLE_STYLES[u.role]}`}>
                                                    {u.role === 'admin' && <Shield className="h-3 w-3" />}
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400 text-xs tabular-nums">
                                                {new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    disabled={actionLoading === u.id}
                                                    className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
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
        </div>
    )
}
