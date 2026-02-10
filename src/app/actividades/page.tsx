import { Mountain, Flame, Bike, Users } from 'lucide-react';

export default function ActividadesPage() {
    const activities = [
        {
            icon: <Mountain className="w-8 h-8 text-emerald-500" />,
            title: "Caminatas Ecológicas",
            description: "Recorre senderos naturales dentro y fuera de la hacienda. Descubre la flora local y respira aire puro."
        },
        {
            icon: <Bike className="w-8 h-8 text-emerald-500" />,
            title: "Ciclismo de Montaña",
            description: "Rutas desafiantes y paisajísticas para los amantes del MTB en los alrededores de Silvania."
        },
        {
            icon: <Flame className="w-8 h-8 text-emerald-500" />,
            title: "Zonas de BBQ",
            description: "Espacios dispuestos para compartir un asado en familia rodeados de naturaleza."
        },
        {
            icon: <Users className="w-8 h-8 text-emerald-500" />,
            title: "Eventos Privados",
            description: "El escenario perfecto para reuniones familiares, retiros pequeños o celebraciones íntimas."
        }
    ];

    return (
        <div className="bg-stone-50 min-h-screen py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-emerald-600 font-medium tracking-wider uppercase text-sm mb-4 block">Qué hacer</span>
                    <h1 className="font-serif text-4xl md:text-5xl text-stone-800 mb-6">Actividades y Entorno</h1>
                    <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                        Desde la contemplación tranquila hasta la aventura activa, La Herrería ofrece opciones para todos.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {activities.map((activity, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
                            <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                {activity.icon}
                            </div>
                            <h3 className="font-serif text-xl text-stone-800 mb-3">{activity.title}</h3>
                            <p className="text-stone-600 text-sm leading-relaxed">{activity.description}</p>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-20 bg-emerald-900 rounded-3xl p-12 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10">
                        <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">¿Listo para vivir la experiencia?</h2>
                        <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                            Reserva ahora y asegura tu espacio en este refugio natural.
                        </p>
                        <a
                            href="/reservas"
                            className="bg-white text-emerald-900 px-8 py-3 rounded-full text-lg font-medium hover:bg-emerald-50 transition-colors inline-block"
                        >
                            Consultar Disponibilidad
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
