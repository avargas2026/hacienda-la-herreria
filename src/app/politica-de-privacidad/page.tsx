export default function PrivacyPolicyPage() {
    return (
        <div className="bg-stone-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-stone-200">
                <h1 className="text-3xl md:text-4xl font-serif text-emerald-900 mb-8 border-b border-stone-100 pb-6">
                    Política de Privacidad y Tratamiento de Datos Personales
                </h1>

                <p className="text-stone-600 mb-8 text-lg leading-relaxed">
                    Hacienda La Herrería, en cumplimiento de lo dispuesto en la <strong>Ley 1581 de 2012</strong>, el <strong>Decreto 1377 de 2013</strong> y el Reglamento General de Protección de Datos (<strong>GDPR</strong>) para usuarios de la Unión Europea, informa a sus usuarios, clientes y proveedores sobre su política de tratamiento de datos personales.
                </p>

                <div className="space-y-8 text-stone-700">
                    <section>
                        <h2 className="text-xl font-bold text-stone-800 mb-4">1. Responsable del Tratamiento</h2>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li><strong>Entidad:</strong> Hacienda La Herrería</li>
                            <li><strong>Domicilio:</strong> Fusagasuga, Cundinamarca, Colombia</li>
                            <li><strong>Correo Electrónico:</strong> <a href="mailto:info@laherreria.co" className="text-emerald-600 hover:underline">info@laherreria.co</a></li>
                            <li><strong>Teléfono:</strong> +57 315 032 2241</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-stone-800 mb-4">2. Finalidad de la Recolección de Datos</h2>
                        <p className="mb-3 text-sm leading-relaxed">
                            Los datos personales recolectados a través de nuestro sitio web (formularios de contacto, reservas, cookies) serán utilizados exclusivamente para:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>Gestionar y confirmar solicitudes de reserva y hospedaje.</li>
                            <li>Comunicación directa con el usuario vía WhatsApp, correo electrónico o teléfono para coordinación de servicios.</li>
                            <li>Envío de información relevante sobre su estadía (instrucciones de llegada, recomendaciones, normas de convivencia).</li>
                            <li>Cumplimiento de obligaciones legales y tributarias (facturación).</li>
                            <li>Mejora de la experiencia de usuario mediante análisis estadísticos anónimos (cookies).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-stone-800 mb-4">3. Derechos del Titular de los Datos</h2>
                        <p className="mb-3 text-sm leading-relaxed">
                            Como titular de sus datos personales, usted tiene derecho a:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li><strong>Acceso:</strong> Conocer qué datos personales suyos estamos tratando.</li>
                            <li><strong>Rectificación:</strong> Solicitar la corrección de datos inexactos o incompletos.</li>
                            <li><strong>Supresión (Derecho al Olvido):</strong> Solicitar la eliminación de sus datos cuando no sean necesarios para la prestación del servicio contratado o cumplimiento legal.</li>
                            <li><strong>Revocatoria:</strong> Revocar la autorización otorgada para el tratamiento de datos.</li>
                            <li><strong>Portabilidad:</strong> Solicitar la transferencia de sus datos a otro responsable (GDPR).</li>
                        </ul>
                        <p className="mt-4 text-sm bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                            Para ejercer cualquiera de estos derechos, puede enviar una solicitud escrita al correo electrónico <a href="mailto:info@laherreria.co" className="text-emerald-700 font-medium hover:underline">info@laherreria.co</a>. Su solicitud será atendida en un plazo máximo de 10 días hábiles.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-stone-800 mb-4">4. Uso de Cookies y Tecnologías de Rastreo</h2>
                        <p className="mb-3 text-sm leading-relaxed">
                            Nuestro sitio web utiliza cookies propias y de terceros para mejorar la navegación y obtener estadísticas de uso.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li><strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento técnico del sitio (ej. formularios de reserva).</li>
                            <li><strong>Cookies Analíticas:</strong> Nos permiten entender cómo interactúan los usuarios con el sitio (ej. páginas más visitadas).</li>
                        </ul>
                        <p className="mt-2 text-sm">
                            Usted puede configurar sus preferencias de cookies en cualquier momento a través de nuestro banner de configuración o desde las opciones de su navegador.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-stone-800 mb-4">5. Seguridad de la Información</h2>
                        <p className="text-sm leading-relaxed">
                            Hacienda La Herrería implementa medidas de seguridad técnicas y organizativas para proteger sus datos contra el acceso no autorizado, pérdida o alteración. No compartimos ni vendemos sus datos personales a terceros con fines comerciales.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-stone-800 mb-4">6. Transferencia Internacional de Datos</h2>
                        <p className="text-sm leading-relaxed">
                            Sus datos pueden ser almacenados en servidores de proveedores tecnológicos (como servicios de hosting o bases de datos en la nube) que pueden estar ubicados fuera de Colombia. Nos aseguramos de que dichos proveedores cumplan con estándares adecuados de protección de datos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-stone-800 mb-4">7. Cambios en la Política</h2>
                        <p className="text-sm leading-relaxed">
                            Nos reservamos el derecho de modificar esta política en cualquier momento para adaptarla a novedades legislativas o cambios en nuestras actividades. La fecha de la última actualización se indicará al final del documento.
                        </p>
                    </section>

                    <div className="pt-8 border-t border-stone-200 text-sm text-stone-500">
                        <p>Última actualización: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
