'use client'

import { useState } from "react"
import { useProfile, Profile } from "@/hooks/useProfile"
import { ProfileHeader } from "@/components/dashboard/ProfileHeader"
import { ProfileDetails } from "@/components/dashboard/ProfileDetails"
import { QuickLinks } from "@/components/dashboard/QuickLinks"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
    const { profile, loading, updateProfile, supabase, signOut } = useProfile()
    const [isEditing, setIsEditing] = useState(false)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
        )
    }

    if (!profile) return null

    async function handleSave(data: Partial<Profile>) {
        await updateProfile(data)
        setIsEditing(false)
    }

    async function handleAvatarUpdate(url: string) {
        await updateProfile({ avatar_url: url })
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">

                <ProfileHeader
                    profile={profile}
                    userEmail={profile.email}
                    isEditing={isEditing}
                    onToggleEdit={() => setIsEditing(!isEditing)}
                    supabase={supabase}
                    onAvatarUpdate={handleAvatarUpdate}
                />

                <div className="grid md:grid-cols-3 gap-6 md:gap-8 item-start">
                    <div className="md:col-span-2">
                        <ProfileDetails
                            profile={profile}
                            isEditing={isEditing}
                            onSave={handleSave}
                        />
                    </div>
                    <div className="md:col-span-1">
                        <QuickLinks
                            profile={profile}
                            signOut={signOut}
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}
