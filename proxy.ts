import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { i18n } from './i18n-config'

function getLocale(request: NextRequest): string {
    // Simple locale detection
    const acceptLanguage = request.headers.get('accept-language')
    if (acceptLanguage?.includes('hi')) return 'hi'
    if (acceptLanguage?.includes('as')) return 'as'
    return 'en'
}

export async function proxy(request: NextRequest) {
    // 1. Handle Supabase Session (for Auth)
    // We need to await this because it might set cookies on the response
    const response = await updateSession(request)

    // 2. Handle I18n Routing
    const pathname = request.nextUrl.pathname

    // Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = i18n.locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    )

    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
        const locale = getLocale(request)

        // e.g. incoming request is /services
        // The new URL is now /en/services
        return NextResponse.redirect(
            new URL(
                `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
                request.url
            )
        )
    }

    return response
}

export const config = {
    // Matcher ignoring `_next` and other static files
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
