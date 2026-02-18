'use client'

import { useAuth } from "@/components/providers/AuthProvider"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export interface Profile {
    id: string
    full_name: string
    email: string
    phone: string
    address: string
    avatar_url: string
    role: string
    is_verified?: boolean
    created_at: string
}

export function useProfile() {
    const { user, loading: authLoading, signOut } = useAuth()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) fetchProfile()
    }, [user])

    async function fetchProfile() {
        if (!user) return

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (data) {
            setProfile(data as Profile)
        } else if (error && error.code === 'PGRST116') {
            const newProfile: Partial<Profile> = {
                id: user.id,
                full_name: user.user_metadata?.full_name || '',
                email: user.email || '',
                phone: '',
                address: '',
                avatar_url: user.user_metadata?.avatar_url || '',
                role: user.user_metadata?.role || 'user',
            }
            await supabase.from('profiles').insert(newProfile)
            setProfile(newProfile as Profile)
        } else {
            setError(error?.message || 'Failed to load profile')
        }
        setLoading(false)
    }

    async function updateProfile(updates: Partial<Profile>) {
        if (!user) return { error: 'No user' }

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)

        if (!error) {
            setProfile(prev => prev ? { ...prev, ...updates } : null)
        }
        return { error }
    }

    return {
        user,
        profile,
        loading: authLoading || loading,
        error,
        updateProfile,
        signOut,
        supabase // expossed for storage ops
    }
}
