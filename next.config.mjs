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
                        // Fuerza HTTPS por 2 años (solo en producción)
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        // Content Security Policy: Define de dónde puede cargar recursos tu sitio
                        key: 'Content-Security-Policy',
                        value: [
                            // Recursos por defecto solo desde tu dominio
                            "default-src 'self'",
                            // Scripts: tu dominio + Google Maps + inline necesario para Next.js
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://maps.gstatic.com",
                            // Estilos: tu dominio + Google Fonts + inline (Tailwind lo necesita)
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            // Imágenes: tu dominio + data URIs + HTTPS externo + Supabase
                            "img-src 'self' data: https: blob: https://*.supabase.co",
                            // Fuentes: tu dominio + Google Fonts
                            "font-src 'self' https://fonts.gstatic.com",
                            // Conexiones: tu dominio + Supabase + APIs externas
                            "connect-src 'self' https://*.supabase.co https://ipapi.co https://api.resend.com https://api.exchangerate-api.com",
                            // Iframes: Google Maps y Waze
                            "frame-src 'self' https://www.google.com https://maps.google.com https://embed.waze.com",
                            // Objetos/embeds: ninguno
                            "object-src 'none'",
                            // Base URI: solo tu dominio
                            "base-uri 'self'",
                            // Formularios: solo pueden enviarse a tu dominio
                            "form-action 'self'",
                            // Upgrade insecure requests (HTTP → HTTPS)
                            "upgrade-insecure-requests",
                        ].join('; '),
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
