import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-stone-900 text-stone-300 py-12 border-t border-stone-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h3 className="font-serif text-2xl text-stone-100 mb-4 tracking-wide">Hacienda La Herrería</h3>
                    <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
                        Un refugio natural para desconectarse y reconectar. Ubicado en Silvania, Cundinamarca,
                        donde la naturaleza y el descanso se encuentran.
                    </p>
                </div>

                <div>
                    <h4 className="text-stone-100 font-medium mb-4 uppercase tracking-wider text-sm">Navegación</h4>
                    <ul className="space-y-2 text-sm">
                        {['Inicio', 'La Propiedad', 'Espacios', 'Experiencia', 'Actividades', 'Reservas'].map((item) => (
                            <li key={item}>
                                <Link href={`/${item.toLowerCase().replace(' ', '')}`} className="hover:text-emerald-400 transition-colors">
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-stone-100 font-medium mb-4 uppercase tracking-wider text-sm">Contacto</h4>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-2">
                            <Mail size={16} className="text-emerald-500" />
                            <a href="mailto:info@laherreria.co" className="hover:text-white transition-colors">info@laherreria.co</a>
                        </li>
                        <li className="flex items-center gap-2">
                            <Phone size={16} className="text-emerald-500" />
                            <a href="https://wa.me/573150322241" className="hover:text-white transition-colors">+57 315 032 2241</a>
                        </li>
                        <li className="flex items-center gap-2">
                            <MapPin size={16} className="text-emerald-500" />
                            <span>Silvania, Cundinamarca</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-stone-800 text-xs text-center text-stone-500">
                <p>&copy; {new Date().getFullYear()} Hacienda La Herrería. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}
