/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                // Aplicar estos headers a todas las rutas
                source: '/:path*',
                headers: [
                    {
                        // Previene que tu sitio sea cargado en un iframe (protección contra clickjacking)
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        // Previene que el navegador "adivine" el tipo MIME de archivos
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        // Activa la protección XSS del navegador (legacy, pero útil)
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        // Controla qué información se envía en el header Referer
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        // Controla qué APIs del navegador puede usar tu sitio
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
                    },
                    {
                        // Content Security Policy: Define de dónde puede cargar recursos tu sitio
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://maps.gstatic.com",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "img-src 'self' data: https: blob: https://*.supabase.co",
                            "font-src 'self' https://fonts.gstatic.com",
                            "connect-src 'self' https://*.supabase.co https://ipapi.co https://api.resend.com https://api.exchangerate-api.com",
                            "frame-src 'self' https://www.google.com https://maps.google.com https://embed.waze.com",
                            "object-src 'none'",
                            "base-uri 'self'",
                            "form-action 'self'",
                            // Upgrade insecure requests desactivado para desarrollo local
                        ].join('; '),
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
