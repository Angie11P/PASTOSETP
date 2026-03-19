import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/src/lib/supabase';
import toast from 'react-hot-toast';
import { 
  Map as MapIcon, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Loader2,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Database } from '@/src/types/database';

type RouteRow = Database['public']['Tables']['routes']['Row'];

export default function RoutesAdmin() {
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteRow | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    stops: Array(9).fill(''), // Exactly 9 stops
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .order('code');
    
    if (error) console.error('Error fetching routes:', error);
    else setRoutes(data || []);
    setLoading(false);
  };

  const handleOpenModal = async (route?: RouteRow) => {
    if (route) {
      setLoading(true); // Loading stops for edit
      const { data: stopsData, error } = await supabase
        .from('stops')
        .select('*')
        .eq('route_id', route.id)
        .order('order_index');

      setLoading(false);
      
      const stopsArray = Array(9).fill('');
      if (stopsData && !error) {
        stopsData.slice(0, 9).forEach((stop, idx) => {
          stopsArray[idx] = stop.name;
        });
      }

      setEditingRoute(route);
      setFormData({
        name: route.name,
        code: route.code,
        stops: stopsArray,
      });
    } else {
      setEditingRoute(null);
      setFormData({
        name: '',
        code: '',
        stops: Array(9).fill(''),
      });
    }
    setIsModalOpen(true);
  };

  const updateStopName = (index: number, value: string) => {
    const newStops = [...formData.stops];
    newStops[index] = value;
    setFormData({ ...formData, stops: newStops });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    // Validate 9 stops are full
    const emptyStops = formData.stops.some(s => !s.trim());
    if (emptyStops) {
      toast.error('Debes completar el nombre de las 9 paradas específicas.');
      setFormLoading(false);
      return;
    }

    try {
      let currentRouteId = editingRoute?.id;

      if (editingRoute) {
        // Update Route
        const { error: routeError } = await supabase
          .from('routes')
          .update({ name: formData.name, code: formData.code.toUpperCase() })
          .eq('id', currentRouteId);
        if (routeError) throw routeError;

        // Delete previous stops to insert them clean
        await supabase.from('stops').delete().eq('route_id', currentRouteId);
      } else {
        // Create new Route
        const { data: newRoute, error: routeError } = await supabase
          .from('routes')
          .insert([{ name: formData.name, code: formData.code.toUpperCase() }])
          .select()
          .single();
        
        if (routeError) throw routeError;
        currentRouteId = newRoute.id;
      }
      
      // Insert the 9 stops
      const stopsToInsert = formData.stops.map((stopName, index) => ({
        route_id: currentRouteId,
        name: stopName.trim(),
        order_index: index + 1
      }));

      const { error: stopsError } = await supabase.from('stops').insert(stopsToInsert);
      if (stopsError) throw stopsError;

      toast.success('Ruta guardada exitosamente');
      setIsModalOpen(false);
      fetchRoutes();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar la ruta y sus paradas');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta ruta? Se eliminarán también sus 9 paraderos permanentemente.')) return;
    
    // Con ON DELETE CASCADE en la BD, se borran automáticamente sus stops
    const { error } = await supabase.from('routes').delete().eq('id', id);
    if (error) toast.error('Error al eliminar: ' + error.message);
    else {
      toast.success('Ruta eliminada');
      fetchRoutes();
    }
  };

  const filteredRoutes = routes.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Rutas</h1>
          <p className="text-gray-500">Administra los trayectos y paraderos del sistema.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#FF6B00] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#e66000] transition-all flex items-center gap-2 shadow-lg shadow-[#FF6B00]/20"
        >
          <Plus className="w-5 h-5" /> Nueva Ruta
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código o nombre de ruta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && routes.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00] mx-auto" />
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            No se encontraron rutas.
          </div>
        ) : (
          filteredRoutes.map((route) => (
            <motion.div
              key={route.id}
              layout
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                  <MapIcon className="w-6 h-6" />
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleOpenModal(route)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(route.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{route.code}</h3>
              <p className="text-gray-500 text-sm">{route.name}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> 9 Paradas Fijas</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Route & Stops Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#0A1F44]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-[#0A1F44] p-6 text-white flex items-center justify-between shrink-0">
                <h3 className="text-xl font-bold">{editingRoute ? 'Editar Ruta y Recorrido' : 'Nueva Ruta y Recorrido'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow">
                <div className="p-8 space-y-8">
                  
                  {/* Info Basica */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Información de la Ruta</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Código de Ruta (Ej: C14, E1)</label>
                        <input
                          type="text"
                          required
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Nombre / Descripción</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recorrido (9 Stops) */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">Recorrido</h4>
                    <p className="text-sm text-gray-500 mb-6">Ingresa las 9 paradas específicas obligatorias para conformar esta ruta.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {formData.stops.map((stopName, index) => (
                        <div key={index} className="space-y-2 relative group">
                          <label className="text-xs font-bold text-[#FF6B00]">Parada {index + 1}</label>
                          <div className="relative">
                            <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#FF6B00] transition-colors" />
                            <input
                              type="text"
                              required
                              placeholder="Ej: Centro Histórico"
                              value={stopName}
                              onChange={(e) => updateStopName(index, e.target.value)}
                              className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit actions fixed at bottom */}
                <div className="p-6 bg-white border-t border-gray-100 flex gap-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-6 py-4 bg-[#FF6B00] text-white rounded-xl font-bold hover:bg-[#e66000] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Ruta y Recorrido'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
