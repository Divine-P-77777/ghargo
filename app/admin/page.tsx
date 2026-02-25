'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Users, CalendarCheck, ShieldCheck, TrendingUp, ArrowRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardStats {
    totalUsers: number
    totalProviders: number
    pendingProviders: number
    totalBookings: number
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalProviders: 0,
        pendingProviders: 0,
        totalBookings: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            const supabase = createClient()

            const [usersRes, providersRes, pendingRes, bookingsRes] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'provider'),
                supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'provider').eq('is_verified', false),
                supabase.from('bookings').select('id', { count: 'exact', head: true }),
            ])

            setStats({
                totalUsers: usersRes.count ?? 0,
                totalProviders: providersRes.count ?? 0,
                pendingProviders: pendingRes.count ?? 0,
                totalBookings: bookingsRes.count ?? 0,
            })
            setLoading(false)
        }

        fetchStats()
    }, [])

    const statCards = [
        {
            label: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            color: "from-blue-500 to-blue-600",
            bgLight: "bg-blue-50",
            textColor: "text-blue-600",
        },
        {
            label: "Total Providers",
            value: stats.totalProviders,
            icon: ShieldCheck,
            color: "from-emerald-500 to-emerald-600",
            bgLight: "bg-emerald-50",
            textColor: "text-emerald-600",
        },
        {
            label: "Pending Verification",
            value: stats.pendingProviders,
            icon: Clock,
            color: "from-amber-500 to-orange-500",
            bgLight: "bg-amber-50",
            textColor: "text-amber-600",
            link: "/admin/providers",
        },
        {
            label: "Total Bookings",
            value: stats.totalBookings,
            icon: CalendarCheck,
            color: "from-violet-500 to-purple-600",
            bgLight: "bg-violet-50",
            textColor: "text-violet-600",
        },
    ]

    return (
        <div className="space-y-8 py-20">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">Overview of your platform metrics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="relative bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group"
                    >
                        {/* Gradient accent */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />

                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.label}</p>
                                {loading ? (
                                    <div className="mt-2 w-16 h-8 bg-slate-100 rounded-lg animate-pulse" />
                                ) : (
                                    <p className="mt-2 text-3xl font-bold text-slate-800">{card.value}</p>
                                )}
                            </div>
                            <div className={`p-2.5 rounded-xl ${card.bgLight}`}>
                                <card.icon className={`h-5 w-5 ${card.textColor}`} />
                            </div>
                        </div>

                        {card.link && (
                            <Link
                                href={card.link}
                                className={`mt-4 inline-flex items-center gap-1 text-xs font-medium ${card.textColor} hover:underline`}
                            >
                                View all <ArrowRight className="h-3 w-3" />
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h2 className="font-semibold text-lg text-slate-800 mb-4">Quick Actions</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link href="/admin/providers">
                        <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all cursor-pointer group">
                            <div className="p-2.5 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="font-medium text-sm text-slate-700">Verify Providers</p>
                                <p className="text-xs text-slate-400">Review pending applications</p>
                            </div>
                        </div>
                    </Link>
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all cursor-pointer group">
                        <div className="p-2.5 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="font-medium text-sm text-slate-700">View Analytics</p>
                            <p className="text-xs text-slate-400">Coming soon</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/50 transition-all cursor-pointer group">
                        <div className="p-2.5 rounded-xl bg-violet-50 group-hover:bg-violet-100 transition-colors">
                            <CalendarCheck className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                            <p className="font-medium text-sm text-slate-700">Manage Bookings</p>
                            <p className="text-xs text-slate-400">Coming soon</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
