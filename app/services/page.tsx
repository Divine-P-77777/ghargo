'use client'

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star, MapPin, Search, Filter, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Provider {
    id: string
    full_name: string
    avatar_url: string | null
    service_type: string | null
    hourly_rate: number | null
    bio: string | null
    is_approved: boolean
}

const CATEGORIES = ["All", "Electrician", "Plumber", "Cleaner", "Carpenter", "Painter", "Mechanic", "AC Repair", "Pest Control", "Other"]

// --- Refactored Content Component ---
function ServicesContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [providers, setProviders] = useState<Provider[]>([])
    const [loading, setLoading] = useState(true)

    // Read category from URL — default to "All"
    const categoryParam = searchParams.get('category') || 'All'
    const [category, setCategory] = useState(categoryParam)
    const [search, setSearch] = useState(searchParams.get('search') || '')

    const supabase = createClient()

    // Sync URL → state when navigating to this page
    useEffect(() => {
        setCategory(searchParams.get('category') || 'All')
        setSearch(searchParams.get('search') || '')
    }, [searchParams])

    useEffect(() => { fetchProviders() }, [])

    async function fetchProviders() {
        setLoading(true)
        const { data } = await supabase
            .from('providers')
            .select('*')
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
        if (data) setProviders(data as Provider[])
        setLoading(false)
    }

    function handleCategory(cat: string) {
        setCategory(cat)
        const params = new URLSearchParams(searchParams.toString())
        if (cat === 'All') {
            params.delete('category')
        } else {
            params.set('category', cat)
        }
        router.replace(`/services?${params.toString()}`, { scroll: false })
    }

    function handleSearch(val: string) {
        setSearch(val)
        const params = new URLSearchParams(searchParams.toString())
        if (!val) params.delete('search')
        else params.set('search', val)
        router.replace(`/services?${params.toString()}`, { scroll: false })
    }

    const filteredProviders = providers.filter(p => {
        const matchesCategory = category === "All" || p.service_type === category
        const matchesSearch = !search ||
            p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            p.service_type?.toLowerCase().includes(search.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return (
        <div className="min-h-screen py-20 bg-slate-50">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Find the Perfect Professional</h1>
                    <p className="text-lg text-slate-600">
                        Browse our verified experts for your home service needs.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${category === cat
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by name or service..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9 rounded-xl border-slate-200"
                        />
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white h-64 rounded-2xl border border-slate-100 animate-pulse" />
                        ))}
                    </div>
                ) : filteredProviders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Filter className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No providers found</h3>
                        <p className="text-slate-500">Try adjusting your filters or search terms.</p>
                        <button onClick={() => handleCategory('All')} className="mt-4 text-sm text-indigo-600 hover:underline">
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProviders.map(provider => (
                            <ProviderCard key={provider.id} provider={provider} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// --- Main Page Component ---
export default function ServicesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen py-20 bg-slate-50 flex items-center justify-center">
                <div className="animate-pulse text-slate-400">Loading services...</div>
            </div>
        }>
            <ServicesContent />
        </Suspense>
    )
}

function ProviderCard({ provider }: { provider: Provider }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                            {provider.avatar_url ? (
                                <img src={provider.avatar_url} alt={provider.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500 font-bold text-xl">
                                    {provider.full_name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                                {provider.full_name}
                            </h3>
                            <p className="text-sm font-medium text-emerald-600">
                                {provider.service_type || "General Provider"}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                <MapPin className="h-3 w-3" /> Guwahati
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-amber-700">4.9</span>
                    </div>
                </div>

                <p className="text-slate-600 text-sm line-clamp-2 mb-4 h-10">
                    {provider.bio || "Professional service provider available for bookings."}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="text-sm">
                        <span className="font-bold text-slate-900">₹{provider.hourly_rate || 500}</span>
                        <span className="text-slate-500">/visit</span>
                    </div>
                    <Link href={`/bookings/new?providerId=${provider.id}`}>
                        <Button size="sm" className="rounded-xl px-5 bg-indigo-600 hover:bg-indigo-700">
                            Book Now <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
