import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { i18n } from './i18n-config'

function getLocale(request: NextRequest): string {
    // Simple locale detection
    const acceptLanguage = request.headers.get('accept-language')
    if (acceptLanguage?.includes('hi')) return 'hi'
    if (acceptLanguage?.includes('as')) return 'as'
    return 'en'
}

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

    // Helper to get locale for redirects
    const getRedirectUrl = (path: string) => {
        let locale = getLocale(request)
        // Check if path already has locale
        const segments = request.nextUrl.pathname.split('/')
        if (i18n.locales.includes(segments[1] as any)) {
            locale = segments[1]
        }
        return new URL(`/${locale}${path}`, request.url)
    }

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // RBAC Logic
    const pathname = request.nextUrl.pathname

    // 1. Protected Admin Routes
    if (pathname.includes('/admin') && user?.user_metadata?.role !== 'admin') {
        return NextResponse.redirect(getRedirectUrl('/'))
    }

    // 2. Protected Provider Routes
    if (pathname.includes('/provider') && user?.user_metadata?.role !== 'provider') {
        return NextResponse.redirect(getRedirectUrl('/'))
    }

    // 3. Protected Dashboard Routes (General Auth)
    if (pathname.includes('/dashboard') && !user) {
        return NextResponse.redirect(getRedirectUrl('/auth/login'))
    }

    // I18n Routing
    const pathnameIsMissingLocale = i18n.locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    )

    if (pathnameIsMissingLocale) {
        const locale = getLocale(request)
        return NextResponse.redirect(
            new URL(
                `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
                request.url
            )
        )
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
