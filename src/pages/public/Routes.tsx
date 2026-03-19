import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/src/lib/supabase';
import { suggestRoutes } from '@/src/services/geminiService';
import { Map as MapIcon, Search, Loader2, Bus, ArrowRight, Sparkles, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Database } from '@/src/types/database';

type RouteRow = Database['public']['Tables']['routes']['Row'];
type StopRow = Database['public']['Tables']['stops']['Row'];

export default function Routes() {
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<RouteRow | null>(null);
  const [stops, setStops] = useState<StopRow[]>([]);
  const [stopsLoading, setStopsLoading] = useState(false);

  // Journey search state
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [journeyResults, setJourneyResults] = useState<RouteRow[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchRoutes = async () => {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('code');
      if (error) console.error(error);
      else setRoutes(data || []);
      setLoading(false);
    };
    fetchRoutes();
  }, []);

  const handleViewStops = async (route: RouteRow) => {
    setSelectedRoute(route);
    setStopsLoading(true);
    const { data, error } = await supabase
      .from('stops')
      .select('*')
      .eq('route_id', route.id)
      .order('order_index');
    if (error) console.error(error);
    else setStops(data || []);
    setStopsLoading(false);
  };

  const handleSearchJourney = async (e: FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;

    setLoading(true);
    setAiLoading(true);
    setAiSuggestions([]);

    // Direct matches
    const { data: stopsData, error } = await supabase
      .from('stops')
      .select('route_id, name')
      .or(`name.ilike.%${origin}%,name.ilike.%${destination}%`);

    if (!error && stopsData) {
      const routeMap = new Map<string, Set<string>>();
      stopsData.forEach(s => {
        if (!routeMap.has(s.route_id)) routeMap.set(s.route_id, new Set());
        routeMap.get(s.route_id)?.add(s.name.toLowerCase());
      });

      const matchingRouteIds = Array.from(routeMap.entries())
        .filter(([_, names]) => {
          const hasOrigin = Array.from(names).some(n => n.includes(origin.toLowerCase()));
          const hasDest = Array.from(names).some(n => n.includes(destination.toLowerCase()));
          return hasOrigin && hasDest;
        })
        .map(([id]) => id);

      setJourneyResults(routes.filter(r => matchingRouteIds.includes(r.id)));
    }

    // AI Suggestions
    const suggestions = await suggestRoutes(origin, destination, routes);
    setAiSuggestions(suggestions);

    setAiLoading(false);
    setLoading(false);
  };

  const filteredRoutes = routes.filter(r =>
    r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Visual */}
        <div className="mb-16 text-center pt-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex bg-[#FF6B00]/10 text-[#FF6B00] px-4 py-2 rounded-full font-bold text-sm tracking-widest uppercase mb-4 shadow-sm"
          >
            Red de Movilidad
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl md:text-5xl font-black text-[#0A1F44] mb-4 tracking-tight"
          >
            Nuestras Rutas
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 max-w-2xl mx-auto text-lg"
          >
            Explora de manera inteligente nuestro mapa de paraderos y encuentra la conexión perfecta hacia tu destino.
          </motion.p>
        </div>

        {/* Buscador de Trayectos Dinámico */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 lg:p-12 mb-16 shadow-[0_20px_50px_-12px_rgba(10,31,68,0.1)] border border-gray-100 relative overflow-hidden"
        >
          {/* Decorative Pattern bg */}
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #0A1F44 25%, transparent 25%, transparent 75%, #0A1F44 75%, #0A1F44), repeating-linear-gradient(45deg, #0A1F44 25%, transparent 25%, transparent 75%, #0A1F44 75%, #0A1F44)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }}></div>

          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-[#0A1F44]">
              <div className="bg-[#0A1F44] p-2 rounded-xl text-white shadow-md shadow-[#0A1F44]/20"><Navigation className="w-6 h-6" /></div>
              Arma tu Viaje
            </h2>

            <form onSubmit={handleSearchJourney} className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 relative group">
                <label className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-[#FF6B00] transition-colors">Punto A (Origen)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Barrio San Juan"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-transparent border-2 border-gray-200 rounded-2xl px-6 py-4 text-gray-800 focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/10 transition-all font-medium text-lg placeholder:text-gray-300 relative z-0"
                />
              </div>

              <div className="md:col-span-4 relative group">
                <label className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-[#FF6B00] transition-colors">Punto B (Destino)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Terminal de Transportes"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-transparent border-2 border-gray-200 rounded-2xl px-6 py-4 text-gray-800 focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/10 transition-all font-medium text-lg placeholder:text-gray-300"
                />
              </div>

              <div className="md:col-span-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FF6B00] text-white font-black py-4 rounded-2xl hover:bg-[#e66000] transition-all shadow-lg shadow-[#FF6B00]/30 flex items-center justify-center gap-3 border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-[#FF6B00]/20 active:scale-95 disabled:opacity-70 text-lg group"
                >
                  {aiLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>Buscar Mejor Ruta <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </div>
            </form>

            {/* Resultados */}
            <AnimatePresence>
              {(journeyResults.length > 0 || aiSuggestions.length > 0 || aiLoading) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-10 overflow-hidden text-[#0A1F44]"
                >
                  {journeyResults.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-black text-emerald-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        Rutas Directas Encontradas
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {journeyResults.map(r => (
                          <button
                            key={r.id}
                            onClick={() => handleViewStops(r)}
                            className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all hover:scale-105"
                          >
                            🚍 Ruta {r.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(aiLoading || aiSuggestions.length > 0) && (
                    <div className="bg-gradient-to-br from-[#0A1F44] to-[#152e5a] rounded-2xl p-6 text-white shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-[#FF6B00] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

                      <div className="relative z-10">
                        <h3 className="text-sm font-black text-[#FF6B00] uppercase tracking-wider mb-5 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" /> Análisis Inteligente
                        </h3>

                        {aiLoading ? (
                          <div className="flex items-center gap-4 text-white/80 font-medium py-4">
                            <Loader2 className="w-6 h-6 animate-spin text-[#FF6B00]" /> Analizando posibles transbordos y alternativas...
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {aiSuggestions.map((s, i) => (
                              <div key={i} className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:border-[#FF6B00]/50 transition-colors">
                                <div className="inline-block bg-[#FF6B00] text-white px-3 py-1 rounded-lg text-sm font-black shadow-md mb-3">
                                  Sugerencia: {s.route}
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{s.explanation}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Listado y Visualización */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Menú lateral (Rutas) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col max-h-[800px]">
            <h3 className="text-xl font-black text-[#0A1F44] mb-6">Directorio de Rutas</h3>
            <div className="relative mb-6">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar ruta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all font-medium text-gray-700"
              />
            </div>

            <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar pr-2">
              {loading ? (
                <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" /></div>
              ) : filteredRoutes.map(route => {
                const isSelected = selectedRoute?.id === route.id;
                return (
                  <button
                    key={route.id}
                    onClick={() => handleViewStops(route)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${isSelected
                      ? 'bg-[#0A1F44] border-[#0A1F44] text-white shadow-lg'
                      : 'bg-white border-gray-100 hover:border-[#FF6B00] hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 shrink-0 rounded-xl flex items-center justify-center font-black text-xl shadow-inner ${isSelected
                        ? 'bg-[#FF6B00] text-white'
                        : 'bg-gray-50 text-[#0A1F44] group-hover:bg-[#FF6B00]/10 group-hover:text-[#FF6B00]'
                        }`}>
                        {route.code}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold uppercase tracking-widest mb-1 ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>Ruta</span>
                        <span className={`font-bold leading-tight ${isSelected ? 'text-white' : 'text-gray-800'}`}>{route.name}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visualizador (Linea de Vida) */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {selectedRoute ? (
                <motion.div
                  key={selectedRoute.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white rounded-3xl p-8 lg:p-12 border border-gray-100 shadow-xl min-h-[600px] h-full relative overflow-hidden"
                >
                  {/* Decorative faint code in background */}
                  <div className="absolute right-0 bottom-0 text-[200px] font-black leading-none text-gray-50 select-none pointer-events-none -mr-10 -mb-10">
                    {selectedRoute.code}
                  </div>

                  <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-6 mb-12 border-b-2 border-dashed border-gray-100 pb-10">
                      <div className="bg-[#FF6B00] text-white w-20 h-20 rounded-3xl flex items-center justify-center font-black text-4xl shadow-[0_10px_30px_-10px_#FF6B00]">
                        {selectedRoute.code}
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <h2 className="text-3xl font-black text-[#0A1F44] mb-2">{selectedRoute.name}</h2>
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Activa
                          </span>
                          <span className="text-gray-400 text-sm font-medium">9 Paradas Oficiales</span>
                        </div>
                      </div>
                    </div>

                    {stopsLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-12 h-12 animate-spin text-[#FF6B00]" />
                      </div>
                    ) : (
                      <div className="relative py-8 px-4 md:px-12 bg-gray-50/50 rounded-3xl border border-gray-100 shadow-inner">
                        {/* Línea Central Transit-style */}
                        <div className="absolute left-[35px] md:left-[67px] top-16 bottom-16 w-2 bg-[#0A1F44]/10 rounded-full"></div>
                        <div className="absolute left-[35px] md:left-[67px] top-16 bottom-16 w-2 bg-[#FF6B00] rounded-full animate-pulse origin-top hidden md:block opacity-50"></div>

                        <div className="space-y-0">
                          {stops.map((stop, i) => {
                            const isFirst = i === 0;
                            const isLast = i === stops.length - 1;
                            
                            return (
                              <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={stop.id}
                                className="relative flex items-center py-4 group"
                              >
                                {/* Contenedor del ícono temporal / línea */}
                                <div className="w-16 md:w-24 shrink-0 flex flex-col items-center justify-center relative z-10 transition-transform group-hover:scale-110">
                                  {isFirst ? (
                                    <div className="w-8 h-8 rounded-full bg-white border-[6px] border-emerald-500 shadow-md flex items-center justify-center z-10">
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    </div>
                                  ) : isLast ? (
                                    <div className="w-8 h-8 rounded-full bg-white border-[6px] border-[#0A1F44] shadow-md flex items-center justify-center z-10">
                                      <div className="w-2 h-2 bg-[#0A1F44] rounded-full"></div>
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-white border-4 border-[#FF6B00] shadow-sm z-10"></div>
                                  )}
                                </div>

                                {/* Tarjeta de Parada */}
                                <div className={`flex-grow transition-all duration-300 ${isFirst || isLast ? 'bg-white p-5 rounded-2xl shadow-md border border-gray-100' : 'bg-transparent p-4 hover:bg-white hover:rounded-2xl hover:shadow-sm'}`}>
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      {isFirst && <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase mb-1 block">Punto de Partida</span>}
                                      {isLast && <span className="text-[10px] font-black tracking-widest text-[#0A1F44] uppercase mb-1 block">Destino Final</span>}
                                      {!isFirst && !isLast && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Parada {i + 1}</span>}
                                      
                                      <h4 className={`font-bold tracking-tight ${isFirst || isLast ? 'text-2xl text-[#0A1F44]' : 'text-lg text-gray-700 group-hover:text-[#FF6B00]'} transition-colors`}>
                                        {stop.name}
                                      </h4>
                                    </div>
                                    <div className="text-right shrink-0">
                                      {i > 0 && (
                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                                          + {i * 4} min
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white/50 backdrop-blur-md rounded-3xl p-12 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center h-full min-h-[600px]">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="bg-white p-8 rounded-full shadow-xl mb-8 border border-gray-50"
                  >
                    <Bus className="w-16 h-16 text-[#0A1F44]" />
                  </motion.div>
                  <h3 className="text-3xl font-black text-[#0A1F44] mb-4">Ninguna ruta seleccionada</h3>
                  <p className="text-gray-500 max-w-sm text-lg leading-relaxed">
                    Selecciona una ruta en el panel izquierdo para visualizar su recorrido detallado en paraderos.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
