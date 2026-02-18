'use client'

import { useRef, useState } from "react"
import { Camera, Edit3, Shield, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Profile } from "@/hooks/useProfile"
import { SupabaseClient } from "@supabase/supabase-js"

interface ProfileHeaderProps {
    profile: Profile
    userEmail?: string
    isEditing: boolean
    onToggleEdit: () => void
    supabase: SupabaseClient
    onAvatarUpdate: (url: string) => void
}

export function ProfileHeader({
    profile,
    userEmail,
    isEditing,
    onToggleEdit,
    supabase,
    onAvatarUpdate
}: ProfileHeaderProps) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const displayName = profile.full_name || 'User'
    const initials = displayName.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase().slice(0, 2)
    const memberSince = profile.created_at
        ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

    async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
            alert('Please upload an image file smaller than 2MB.')
            return
        }

        setUploading(true)
        const fileExt = file.name.split('.').pop()
        const fileName = `${profile.id}/avatar-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, { upsert: true })

        if (!uploadError) {
            const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
            onAvatarUpdate(data.publicUrl)
        } else {
            alert(`Upload failed: ${uploadError.message}`)
        }
        setUploading(false)
    }

    return (
        <div className="relative bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            <div className="h-40 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            </div>

            <div className="px-6 md:px-8 pb-6 -mt-16 relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                    <div className="relative group shrink-0">
                        <div className="w-32 h-32 rounded-3xl border-[5px] border-white shadow-lg overflow-hidden bg-white">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500 text-3xl font-bold">
                                    {initials}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="absolute inset-0 rounded-3xl bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all duration-300 cursor-pointer"
                        >
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-1">
                                {uploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Camera className="h-6 w-6 text-white" />}
                            </div>
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </div>

                    <div className="flex-1 pt-2 sm:pb-2 min-w-0">
                        <h1 className="text-3xl font-bold text-slate-800 truncate">{displayName}</h1>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase">
                                <Shield className="h-3 w-3" /> {profile.role || 'user'}
                            </span>
                            <span className="text-sm text-slate-500">Member since {memberSince}</span>
                        </div>
                    </div>

                    <div className="sm:pb-2">
                        <Button onClick={onToggleEdit} variant="outline" size="sm" className="rounded-xl gap-2 border-slate-200">
                            {isEditing ? 'Cancel Edit' : <><Edit3 className="h-4 w-4" /> Edit Profile</>}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
