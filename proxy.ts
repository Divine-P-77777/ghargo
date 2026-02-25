import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // RBAC Logic
    const pathname = request.nextUrl.pathname

    // 1. Protected Admin Routes — email whitelist
    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)

    if (pathname.includes('/admin')) {
        const userEmail = user?.email?.toLowerCase() ?? ''
        if (!userEmail || !adminEmails.includes(userEmail)) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // 2. Protected Provider Routes
    if (pathname.includes('/provider') && user?.user_metadata?.role !== 'provider') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // 3. Protected Dashboard Routes (General Auth)
    if (pathname.includes('/dashboard') && !user) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // 4. Block direct provider self-registration — admin-only
    if (pathname === '/auth/join-pro') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
