import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');
    const type = (searchParams.get('type') ?? 'recovery') as any;
    const next = searchParams.get('next') ?? '/actualizar-password';
    const errorParam = searchParams.get('error');

    if (errorParam) {
        console.error('❌ Auth Callback Error from Supabase:', errorParam);
        return NextResponse.redirect(`${origin}/recuperar-password?error=invalid_link`);
    }

    // Build a response object to allow setting cookies on
    const buildClientWithResponse = (response: NextResponse) => {
        return createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) { return request.cookies.get(name)?.value; },
                    set(name: string, value: string, options: CookieOptions) { response.cookies.set({ name, value, ...options }); },
                    remove(name: string, options: CookieOptions) { response.cookies.set({ name, value: '', ...options }); },
                },
            }
        );
    };

    // Path 1: token_hash (OTP flow — comes from our custom email via generateLink)
    if (tokenHash) {
        console.log('🔐 token_hash found. Verifying OTP...');
        const response = NextResponse.redirect(`${origin}${next}`);
        const supabase = buildClientWithResponse(response);

        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

        if (error) {
            console.error('❌ verifyOtp Error:', error.message);
            return NextResponse.redirect(`${origin}/recuperar-password?error=invalid_link`);
        }

        console.log('✅ OTP verified. Session cookie set. Redirecting to:', next);
        return response;
    }

    // Path 2: code (PKCE flow — comes from Supabase's standard redirect)
    if (code) {
        console.log('🔐 PKCE code found. Exchanging for session...');
        const response = NextResponse.redirect(`${origin}${next}`);
        const supabase = buildClientWithResponse(response);

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('❌ Code Exchange Error:', error.message);
            return NextResponse.redirect(`${origin}/recuperar-password?error=invalid_link`);
        }

        console.log('✅ Session established via PKCE. Redirecting to:', next);
        return response;
    }

    console.warn('⚠️ No code or token_hash found in callback URL');
    return NextResponse.redirect(`${origin}/recuperar-password?error=missing_code`);
}
