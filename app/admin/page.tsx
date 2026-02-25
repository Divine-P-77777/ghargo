'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import {
    Users, CalendarCheck, ShieldCheck, TrendingUp,
    ArrowRight, Clock, UserPlus, CheckCircle, Activity
} from "lucide-react"

interface DashboardStats {
    totalUsers: number
    totalProviders: number
    approvedProviders: number
    pendingProviders: number
    totalBookings: number
    pendingBookings: number
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0, totalProviders: 0,
        approvedProviders: 0, pendingProviders: 0,
        totalBookings: 0, pendingBookings: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            const supabase = createClient()
            const [usersRes, providersRes, approvedRes, pendingRes, bookingsRes, pendingBookingsRes] =
                await Promise.all([
                    supabase.from('profiles').select('id', { count: 'exact', head: true }),
                    supabase.from('providers').select('id', { count: 'exact', head: true }),
                    supabase.from('providers').select('id', { count: 'exact', head: true }).eq('is_approved', true),
                    supabase.from('providers').select('id', { count: 'exact', head: true }).eq('is_approved', false),
                    supabase.from('bookings').select('id', { count: 'exact', head: true }),
                    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
                ])
            setStats({
                totalUsers: usersRes.count ?? 0,
                totalProviders: providersRes.count ?? 0,
                approvedProviders: approvedRes.count ?? 0,
                pendingProviders: pendingRes.count ?? 0,
                totalBookings: bookingsRes.count ?? 0,
                pendingBookings: pendingBookingsRes.count ?? 0,
            })
            setLoading(false)
        }
        fetchStats()
    }, [])

    const statCards = [
        {
            label: "Registered Users", value: stats.totalUsers,
            icon: Users, color: "from-blue-500 to-blue-600",
            bg: "bg-blue-50", text: "text-blue-600",
            link: "/admin/users",
        },
        {
            label: "Total Providers", value: stats.totalProviders,
            icon: ShieldCheck, color: "from-indigo-500 to-indigo-600",
            bg: "bg-indigo-50", text: "text-indigo-600",
            link: "/admin/manage",
        },
        {
            label: "Approved Providers", value: stats.approvedProviders,
            icon: CheckCircle, color: "from-emerald-500 to-emerald-600",
            bg: "bg-emerald-50", text: "text-emerald-600",
            link: "/admin/manage",
        },
        {
            label: "Pending Approval", value: stats.pendingProviders,
            icon: Clock, color: "from-amber-500 to-orange-500",
            bg: "bg-amber-50", text: "text-amber-600",
            link: "/admin/manage",
        },
        {
            label: "Total Bookings", value: stats.totalBookings,
            icon: CalendarCheck, color: "from-violet-500 to-purple-600",
            bg: "bg-violet-50", text: "text-violet-600",
            link: "/admin/bookings",
        },
        {
            label: "Pending Bookings", value: stats.pendingBookings,
            icon: Activity, color: "from-rose-500 to-pink-600",
            bg: "bg-rose-50", text: "text-rose-600",
            link: "/admin/bookings",
        },
    ]

    const quickActions = [
        {
            href: "/admin/manage", label: "Manage Providers",
            desc: "Add, approve, or remove providers",
            icon: UserPlus, hoverBg: "hover:bg-indigo-50/50", hoverBorder: "hover:border-indigo-200",
            iconBg: "bg-indigo-50 group-hover:bg-indigo-100", iconColor: "text-indigo-600",
        },
        {
            href: "/admin/bookings", label: "All Bookings",
            desc: "View and manage service bookings",
            icon: CalendarCheck, hoverBg: "hover:bg-violet-50/50", hoverBorder: "hover:border-violet-200",
            iconBg: "bg-violet-50 group-hover:bg-violet-100", iconColor: "text-violet-600",
        },
        {
            href: "/admin/users", label: "Users",
            desc: "Browse all registered users",
            icon: Users, hoverBg: "hover:bg-blue-50/50", hoverBorder: "hover:border-blue-200",
            iconBg: "bg-blue-50 group-hover:bg-blue-100", iconColor: "text-blue-600",
        },
        {
            href: "/admin/providers", label: "Legacy Verification",
            desc: "Old provider verification flow",
            icon: ShieldCheck, hoverBg: "hover:bg-emerald-50/50", hoverBorder: "hover:border-emerald-200",
            iconBg: "bg-emerald-50 group-hover:bg-emerald-100", iconColor: "text-emerald-600",
        },
        {
            href: "#", label: "Analytics",
            desc: "Platform insights (coming soon)",
            icon: TrendingUp, hoverBg: "hover:bg-slate-50", hoverBorder: "hover:border-slate-200",
            iconBg: "bg-slate-100 group-hover:bg-slate-200", iconColor: "text-slate-500",
        },
    ]

    return (
        <div className="space-y-6 py-16 md:py-6">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">Platform overview at a glance</p>
            </div>

            {/* Stats Grid — 2 cols on mobile, 3 on md, 3 on lg */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
                {statCards.map((card) => (
                    <Link href={card.link} key={card.label}>
                        <div className="relative bg-white rounded-xl sm:rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer">
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider leading-tight">{card.label}</p>
                                    {loading ? (
                                        <div className="mt-2 w-12 h-7 bg-slate-100 rounded-lg animate-pulse" />
                                    ) : (
                                        <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-slate-800">{card.value}</p>
                                    )}
                                </div>
                                <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${card.bg}`}>
                                    <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.text}`} />
                                </div>
                            </div>
                            <div className={`mt-2 sm:mt-3 inline-flex items-center gap-1 text-xs font-medium ${card.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                View <ArrowRight className="h-3 w-3" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm">
                <h2 className="font-semibold text-base sm:text-lg text-slate-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {quickActions.map((action) => (
                        <Link key={action.label} href={action.href}>
                            <div className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-slate-100 ${action.hoverBorder} ${action.hoverBg} transition-all cursor-pointer group`}>
                                <div className={`p-2 sm:p-2.5 rounded-xl ${action.iconBg} transition-colors shrink-0`}>
                                    <action.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${action.iconColor}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-xs sm:text-sm text-slate-700 truncate">{action.label}</p>
                                    <p className="text-[10px] sm:text-xs text-slate-400 truncate">{action.desc}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
