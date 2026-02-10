export default function EspaciosPage() {
    const spaces = [
        {
            title: "Corredores Empedrados",
            description: "Espacios de transición que conectan la casa con la naturaleza, ideales para la lectura y el descanso.",
            image: "https://images.unsplash.com/photo-1596131499596-1c4f52e5057b?q=80&w=2070&auto=format&fit=crop"
        },
        {
            title: "Jardines y Zonas Verdes",
            description: "Más de 700m² de áreas verdes cuidadas, hogar de pavos reales y flora nativa.",
            image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=2032&auto=format&fit=crop"
        },
        {
            title: "Habitaciones Tradicionales",
            description: "Espacios sobrios y frescos, diseñados para garantizar un descanso profundo.",
            image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2032&auto=format&fit=crop"
        },
        {
            title: "Canales de Agua",
            description: "Delicadas corrientes que rodean la casa, proporcionando una banda sonora natural constante.",
            image: "https://images.unsplash.com/photo-1533630230537-8d0ce782e3c0?q=80&w=2070&auto=format&fit=crop"
        }
    ];

    return (
        <div className="bg-stone-50 min-h-screen py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-emerald-600 font-medium tracking-wider uppercase text-sm mb-4 block">Nuestros Espacios</span>
                    <h1 className="font-serif text-4xl md:text-5xl text-stone-800 mb-6">Un recorrido visual</h1>
                    <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                        Cada rincón de La Herrería está pensado para integrarse con el entorno y ofrecer calma.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {spaces.map((space, index) => (
                        <div key={index} className="group cursor-pointer">
                            <div className="h-80 bg-stone-300 rounded-2xl overflow-hidden mb-6 relative shadow-sm group-hover:shadow-md transition-shadow">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                    style={{ backgroundImage: `url('${space.image}')` }}
                                />
                            </div>
                            <h3 className="font-serif text-2xl text-stone-800 mb-2 group-hover:text-emerald-700 transition-colors">{space.title}</h3>
                            <p className="text-stone-600 leading-relaxed">{space.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
