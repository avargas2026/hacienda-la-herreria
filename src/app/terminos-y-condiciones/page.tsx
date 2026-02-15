export default function TerminosPage() {
    return (
        <div className="bg-stone-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-stone-200">
                <h1 className="text-3xl md:text-4xl font-serif text-emerald-900 mb-8 border-b border-stone-100 pb-6 text-center">
                    TÉRMINOS Y CONDICIONES DE ALOJAMIENTO
                </h1>

                <p className="text-stone-600 mb-8 text-lg font-medium text-center">
                    La Herrería
                </p>

                <p className="text-stone-600 mb-8 text-sm italic border-l-4 border-emerald-500 pl-4 py-2 bg-stone-50">
                    Al realizar una reserva en este sitio web, el huésped declara haber leído, entendido y aceptado los presentes Términos y Condiciones.
                </p>

                <div className="space-y-8 text-stone-700">
                    <section>
                        <h2 className="text-xl font-bold text-stone-800 mb-4">1. Información General</h2>
                        <p className="mb-3 text-sm leading-relaxed">
                            La Herrería ofrece servicio de alojamiento turístico rural con:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>5 habitaciones disponibles.</li>
                            <li>Capacidad máxima de 4 personas por habitación.</li>
                            <li>Tarifas por noche según disponibilidad publicada en el sitio web.</li>
                        </ul>
                        <p className="mt-3 text-sm leading-relaxed bg-amber-50 p-3 rounded-lg border border-amber-100">
                            Las tarifas pueden mostrarse en pesos colombianos (<strong>COP</strong>) y en dólares estadounidenses (<strong>USD</strong>). El valor en USD es informativo y se calcula con base en la tasa de cambio vigente obtenida desde fuente externa confiable.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-stone-800 mb-4">2. Proceso de Reserva</h2>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>Las reservas realizadas a través del sitio web quedan inicialmente en estado <strong>“Pendiente”</strong>.</li>
                            <li>La reserva se considera oficialmente confirmada únicamente cuando el estado cambie a <strong>“Confirmado”</strong> y el huésped reciba notificación formal.</li>
                            <li>La confirmación está sujeta a verificación de disponibilidad y pago correspondiente.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-stone-800 mb-4">3. Política de Cancelación (Flexible)</h2>
                        <p className="mb-3 text-sm leading-relaxed">
                            La Herrería ofrece una política de cancelación flexible, diseñada para brindar mayor seguridad y tranquilidad a nuestros huéspedes. Los porcentajes de reembolso aplican sobre el valor total efectivamente pagado por la reserva.
                        </p>
                        <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                            <ul className="space-y-4 text-sm">
                                <li className="flex items-start">
                                    <span className="text-emerald-600 font-bold mr-2">✓</span>
                                    <span>Cancelación realizada con <strong>más de 5 días calendario</strong> de anticipación al check-in → <strong>Reembolso del 100%</strong> del valor pagado.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-amber-600 font-bold mr-2">!</span>
                                    <span>Cancelación realizada dentro de las <strong>últimas 48 horas</strong> previas al check-in → <strong>Reembolso del 70%</strong> del valor total pagado.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-orange-600 font-bold mr-2">!</span>
                                    <span>Cancelación realizada dentro de las <strong>últimas 24 horas</strong> previas al check-in → <strong>Reembolso del 50%</strong> del valor total pagado.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-red-600 font-bold mr-2">X</span>
                                    <span>En caso de no presentarse (no-show) sin notificación previa → <strong>No habrá reembolso</strong>.</span>
                                </li>
                            </ul>
                        </div>
                        <p className="mt-4 text-xs text-stone-500">
                            El cálculo del plazo se realiza tomando como referencia la hora oficial de check-in publicada en el sitio web. Los reembolsos se efectuarán utilizando el mismo medio de pago empleado en la reserva y estarán sujetos a los tiempos de procesamiento de la entidad financiera correspondiente.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-stone-800 mb-4">4. Horarios</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                                <span className="block font-bold text-emerald-800 mb-1">Check-in</span>
                                <span className="text-emerald-700">desde las 3:00 p.m.</span>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                                <span className="block font-bold text-emerald-800 mb-1">Check-out</span>
                                <span className="text-emerald-700">hasta las 11:00 a.m.</span>
                            </div>
                        </div>
                        <p className="mt-2 text-sm text-stone-500">Solicitudes de ingreso anticipado o salida tardía estarán sujetas a disponibilidad y aprobación previa.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-stone-800 mb-4">5. Uso de la Piscina</h2>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>El uso de la piscina es exclusivo para huéspedes registrados.</li>
                            <li>Los menores de edad deben estar supervisados permanentemente por un adulto responsable.</li>
                            <li>No se permite el ingreso de envases de vidrio al área de piscina.</li>
                            <li>La administración no se responsabiliza por accidentes derivados del uso indebido de las instalaciones.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-stone-800 mb-4">6. Uso de Áreas Comunes</h2>
                        <p className="mb-3 text-sm">Las áreas comunes incluyen jardines, zonas verdes y demás espacios compartidos. Los huéspedes se comprometen a:</p>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>Mantener el orden y la limpieza.</li>
                            <li>Respetar horarios de descanso (<strong>10:00 p.m. a 7:00 a.m.</strong>).</li>
                            <li>No realizar fiestas o eventos sin autorización previa.</li>
                            <li>Respetar a otros huéspedes y al personal.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-stone-800 mb-4">7. Responsabilidad por Daños</h2>
                        <p className="text-sm">
                            El huésped será responsable por cualquier daño ocasionado por uso inadecuado o negligente de las instalaciones y deberá asumir los costos de reparación o reposición.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-stone-800 mb-4">8. Persona Adicional (Modalidad Camping)</h2>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>Aplica tarifa adicional por persona.</li>
                            <li>Debe ser informada y autorizada previamente.</li>
                            <li>Está sujeta a disponibilidad.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-stone-800 mb-4">9. Protección de Datos</h2>
                        <p className="text-sm">
                            El tratamiento de datos personales se realiza conforme a la <strong>Ley 1581 de 2012 (Colombia)</strong> y el Reglamento General de Protección de Datos (<strong>GDPR</strong>), cuando aplique. La información detallada se encuentra en la Política de Privacidad del sitio web.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-stone-800 mb-4">10. Modificaciones</h2>
                        <p className="text-sm">
                            La Herrería se reserva el derecho de actualizar los presentes Términos y Condiciones en cualquier momento. La versión vigente será la publicada en el sitio web al momento de la reserva.
                        </p>
                    </section>

                    <div className="pt-8 border-t border-stone-200 text-sm text-stone-500 text-center">
                        <p>Última actualización: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
