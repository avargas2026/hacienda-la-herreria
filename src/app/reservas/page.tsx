import BookingForm from '@/components/BookingForm';

export default function ReservasPage() {
    return (
        <div className="py-20 px-4 bg-stone-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <span className="text-emerald-600 font-medium tracking-wider uppercase text-sm mb-4 block">Reservas</span>
                    <h1 className="font-serif text-4xl md:text-5xl text-stone-800 mb-6">Planifica tu descanso</h1>
                    <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                        Selecciona tus fechas y comprueba la disponibilidad.
                        Todas las reservas se confirman directamente vía WhatsApp.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    <div>
                        <BookingForm />
                    </div>

                    <div className="space-y-8 mt-8 md:mt-0">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
                            <h3 className="font-serif text-xl text-stone-800 mb-4">Información Importante</h3>
                            <ul className="space-y-4 text-stone-600 text-sm">
                                <li className="flex items-start">
                                    <span className="text-emerald-500 mr-2">•</span>
                                    Check-in: 3:00 PM | Check-out: 12:00 PM
                                </li>
                                <li className="flex items-start">
                                    <span className="text-emerald-500 mr-2">•</span>
                                    Capacidad máxima: 10 personas
                                </li>
                                <li className="flex items-start">
                                    <span className="text-emerald-500 mr-2">•</span>
                                    Pet friendly (con previo aviso)
                                </li>
                                <li className="flex items-start">
                                    <span className="text-emerald-500 mr-2">•</span>
                                    No se permiten fiestas ruidosas
                                </li>
                            </ul>
                        </div>

                        <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100">
                            <h3 className="font-serif text-xl text-emerald-800 mb-2">¿Dudas?</h3>
                            <p className="text-emerald-700 text-sm mb-4">
                                Si tienes preguntas específicas o requerimientos especiales, escríbenos directamente.
                            </p>
                            <a
                                href="https://wa.me/573150322241"
                                target="_blank"
                                className="text-emerald-700 font-medium hover:underline"
                            >
                                Chat por WhatsApp &rarr;
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
