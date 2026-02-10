import Link from 'next/link';

export default function Hero() {
    return (
        <div className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
            {/* Background Image Placeholder - Replace with actual image later */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=2076&auto=format&fit=crop')",
                    backgroundPosition: "center"
                }}
            >
                <div className="absolute inset-0 bg-black/40" /> {/* Overlay for text readability */}
            </div>

            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <h1 className="font-serif text-4xl md:text-6xl text-white mb-6 tracking-wide drop-shadow-md">
                    Un refugio natural para<br />desconectarse y reconectar
                </h1>
                <p className="text-xl md:text-2xl text-stone-100 mb-10 font-light max-w-2xl mx-auto drop-shadow-sm">
                    Descubre Hacienda La Herrería. Naturaleza, descanso y experiencias auténticas en Silvania.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/reservas"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Reservar Ahora
                    </Link>
                    <Link
                        href="/propiedad"
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/50 text-white px-8 py-3 rounded-full text-lg font-medium transition-all duration-300"
                    >
                        Conocer Más
                    </Link>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-white/70">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </div>
    );
}
