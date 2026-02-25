'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login error:', error)
        return redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
    }

    // Get user role for smart redirect
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .single()

    let role = profile?.role

    // If profile role is missing, check the providers table directly (case-insensitive)
    if (!role) {
        const { data: provider } = await supabase
            .from('providers')
            .select('id')
            .ilike('email', email)
            .single()

        if (provider) role = 'provider'
    }

    if (role === 'provider') {
        return redirect('/provider')
    }

    if (role === 'admin') {
        return redirect('/admin')
    }

    return redirect('/')
}

export async function signup(formData: FormData) {
    const origin = (await headers()).get('origin')
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const role = formData.get('role') as string || 'user'

    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
                full_name: fullName,
                role: role,
            }
        },
    })

    if (error) {
        return redirect('/auth/signup?error=Could not authenticate user')
    }

    return redirect('/auth/login?message=Check email to continue sign in process')
}

export async function loginWithGoogle() {
    const supabase = await createClient()

    // Ensure we use the correct site URL, falling back to localhost if not set
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${siteUrl}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    })

    if (error) {
        return redirect('/auth/login?error=Could not authenticate user')
    }

    if (data.url) {
        return redirect(data.url)
    }
}
