'use client'

import Link from "next/link"
import { CalendarCheck, Shield, LogOut, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Profile } from "@/hooks/useProfile"

export function QuickLinks({ profile, signOut }: { profile: Profile, signOut: () => Promise<void> }) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Quick Actions</h3>
                <div className="space-y-2">
                    <Link href="/services" className="group flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                <CalendarCheck className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-slate-700 group-hover:text-indigo-700">Browse Services</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                    </Link>

                    <Link href="/bookings" className="group flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-100 text-violet-600 rounded-lg group-hover:bg-violet-200 transition-colors">
                                <CalendarCheck className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-slate-700 group-hover:text-violet-700">My Bookings</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-violet-500" />
                    </Link>

                    {profile.role === 'admin' && (
                        <Link href="/admin" className="group flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-200 transition-colors">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-slate-700 group-hover:text-emerald-700">Admin Panel</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-500" />
                        </Link>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Account</h3>
                <Button
                    onClick={signOut}
                    variant="outline"
                    className="w-full justify-start rounded-xl border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 h-11"
                >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
