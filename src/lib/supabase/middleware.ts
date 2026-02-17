import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // This will refresh the session if it's expired
    const { data: { user } } = await supabase.auth.getUser()

    const ADMIN_EMAIL = 'a.vargas@mrvargas.co'
    const isApiRoute = request.nextUrl.pathname.startsWith('/api')
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    const isSensitiveApi = request.nextUrl.pathname.startsWith('/api/admin') || request.nextUrl.pathname.startsWith('/api/bookings')

    // 1. Proactive protection for /admin (Visual Routes)
    if (isAdminRoute) {
        if (!user || user.email !== ADMIN_EMAIL) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // 2. Proactive protection for Sensitive API Endpoints
    if (isSensitiveApi) {
        if (!user || user.email !== ADMIN_EMAIL) {
            return NextResponse.json(
                { error: 'No autorizado. Se requiere autenticación de administrador.' },
                { status: 401 }
            )
        }
    }

    return response
}
