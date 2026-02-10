import HeroSlider from '@/components/HeroSlider';
import Link from 'next/link';
import { ArrowRight, Leaf, Map, Sun } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <HeroSlider />

      {/* Introduction Section */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-emerald-600 font-medium tracking-wider uppercase text-sm mb-4 block">Bienvenido</span>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-8 leading-tight">
            Más que un destino,<br />una pausa necesaria.
          </h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-12">
            Ubicada en Silvania, Cundinamarca, Hacienda La Herrería es un espacio diseñado
            para el descanso y la contemplación. Una casa tradicional de adobe rodeada de
            jardines, agua y árboles centenarios te espera para desconectarte del ruido y
            reconectar con lo esencial.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Leaf className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-serif text-xl mb-2 text-stone-700">Naturaleza</h3>
              <p className="text-stone-500 text-sm">700m² de zonas verdes y jardines vivos.</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Sun className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-serif text-xl mb-2 text-stone-700">Descanso</h3>
              <p className="text-stone-500 text-sm">Espacios pensados para la paz mental.</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Map className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-serif text-xl mb-2 text-stone-700">Ubicación</h3>
              <p className="text-stone-500 text-sm">A solo 5 min de la vía principal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured CTA */}
      <section className="py-20 px-4 bg-stone-100 border-t border-stone-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="h-96 bg-stone-300 rounded-2xl overflow-hidden relative group">
            {/* Placeholder for Property Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop')" }}
            />
          </div>
          <div>
            <span className="text-emerald-600 font-medium tracking-wider uppercase text-sm mb-2 block">La Propiedad</span>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-6">Arquitectura con alma</h2>
            <p className="text-stone-600 text-lg leading-relaxed mb-8">
              Nuestra casa de adobe conserva la tradición y frescura de la arquitectura campesina,
              integrando comodidades modernas sin perder su esencia rural. Corredores empedrados y
              el sonido del agua crean una atmósfera única.
            </p>
            <Link
              href="/propiedad"
              className="inline-flex items-center text-emerald-700 font-medium hover:text-emerald-800 transition-colors group"
            >
              Explorar la propiedad
              <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
