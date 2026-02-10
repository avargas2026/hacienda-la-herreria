import { ShieldCheck, Heart, VolumeX } from 'lucide-react';

export default function ExperienciaPage() {
    return (
        <div className="bg-stone-50 min-h-screen py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-emerald-600 font-medium tracking-wider uppercase text-sm mb-4 block">La Experiencia</span>
                    <h1 className="font-serif text-4xl md:text-5xl text-stone-800 mb-6">Un refugio de bienestar</h1>
                    <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                        Hemos diseñado cada aspecto de tu estadía para garantizar privacidad, seguridad y tranquilidad.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Rules & Mood */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
                        <h2 className="font-serif text-2xl text-stone-800 mb-6 flex items-center gap-3">
                            <Heart className="text-emerald-500" />
                            Filosofía de descanso
                        </h2>
                        <p className="text-stone-600 leading-relaxed mb-6">
                            La Herrería es un santuario. Valoramos el silencio y la desconexión digital.
                            Por esta razón, limitamos el uso de dispositivos ruidosos en las zonas comunes
                            y fomentamos actividades contemplativas.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            <div className="flex items-start gap-3 bg-stone-50 p-4 rounded-lg">
                                <VolumeX className="text-stone-400 mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-stone-800 text-sm">Cero Ruido</h4>
                                    <p className="text-xs text-stone-500 mt-1">Ambiente libre de parlantes y música alta.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 bg-stone-50 p-4 rounded-lg">
                                <ShieldCheck className="text-stone-400 mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-stone-800 text-sm">Privacidad Total</h4>
                                    <p className="text-xs text-stone-500 mt-1">Acceso exclusivo para huéspedes registrados.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Service & Staff */}
                    <section>
                        <h2 className="font-serif text-2xl text-stone-800 mb-6">Atención Personalizada</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="order-2 md:order-1">
                                <p className="text-stone-600 leading-relaxed mb-4">
                                    Nuestro anfitrión vive en un área independiente dentro de la propiedad, asegurando
                                    una presencia discreta pero disponible para cualquier necesidad que puedas tener.
                                </p>
                                <ul className="space-y-2 text-stone-600 text-sm">
                                    <li className="flex items-center gap-2">✔ Recepción y bienvenida personalizada</li>
                                    <li className="flex items-center gap-2">✔ Asistencia con fogatas y chimeneas</li>
                                    <li className="flex items-center gap-2">✔ Recomendaciones locales</li>
                                </ul>
                            </div>
                            <div className="h-64 bg-stone-300 rounded-2xl overflow-hidden relative order-1 md:order-2">
                                {/* Placeholder Image */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070&auto=format&fit=crop')" }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Restrictions */}
                    <section className="bg-stone-100 p-8 rounded-2xl border border-stone-200">
                        <h3 className="font-serif text-xl text-stone-800 mb-4">Notas para tu visita</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-600">
                            <li>• No acceso a zonas de cultivos frutales privados.</li>
                            <li>• No acceso a sótanos o áreas de servicio restringidas.</li>
                            <li>• Se requiere registro previo de todos los acompañantes.</li>
                            <li>• Mascotas bienvenidas bajo responsabilidad del dueño.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
