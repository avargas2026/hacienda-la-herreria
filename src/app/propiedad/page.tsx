import Link from 'next/link';

export default function PropiedadPage() {
    return (
        <div className="bg-stone-50 min-h-screen">
            {/* Header */}
            <div className="py-20 px-4 text-center">
                <span className="text-emerald-600 font-medium tracking-wider uppercase text-sm mb-4 block">La Propiedad</span>
                <h1 className="font-serif text-4xl md:text-5xl text-stone-800 mb-6">Un refugio con historia</h1>
                <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                    Arquitectura tradicional y naturaleza viva se encuentran en un espacio de 700m².
                </p>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 pb-20 space-y-12">
                <section>
                    <div className="h-80 bg-stone-300 rounded-2xl overflow-hidden mb-8 relative">
                        {/* Placeholder Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=2065&auto=format&fit=crop')" }}
                        />
                    </div>
                    <h2 className="font-serif text-2xl text-stone-800 mb-4">La Casa Principal</h2>
                    <p className="text-stone-600 leading-relaxed mb-4">
                        Construida con técnicas tradicionales en adobe, la casa principal conserva la frescura
                        y el carácter de las antiguas haciendas. Sus muros gruesos y techos altos garantizan
                        una temperatura agradable durante todo el día.
                    </p>
                    <p className="text-stone-600 leading-relaxed">
                        Rodeada de corredores empedrados, invita a sentarse a leer, conversar o simplemente
                        escuchar el sonido del agua que corre por los canales circundantes.
                    </p>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="font-serif text-2xl text-stone-800 mb-4">Ubicación y Entorno</h2>
                        <p className="text-stone-600 leading-relaxed">
                            Ubicada estratégicamente en una zona rural tranquila pero accesible. A solo 10 minutos
                            caminando del casco urbano de Silvania y 5 minutos en vehículo de la vía principal
                            Bogotá–Fusagasugá.
                        </p>
                        <p className="text-stone-600 leading-relaxed mt-4">
                            El predio está habitado por árboles centenarios, pavos reales y una variedad de aves
                            que hacen de cada mañana un espectáculo natural.
                        </p>
                    </div>
                    <div className="h-64 bg-stone-300 rounded-2xl overflow-hidden relative">
                        {/* Placeholder Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop')" }}
                        />
                    </div>
                </section>

                <section className="bg-white p-8 rounded-2xl border border-stone-100 text-center">
                    <h3 className="font-serif text-2xl text-stone-800 mb-4">Ven a conocerla</h3>
                    <p className="text-stone-600 mb-8 max-w-lg mx-auto">
                        La Herrería es más que una casa, es una experiencia de desconexión.
                    </p>
                    <Link
                        href="/reservas"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full text-lg font-medium transition-colors inline-block"
                    >
                        Reservar tu estadía
                    </Link>
                </section>
            </div>
        </div>
    );
}
