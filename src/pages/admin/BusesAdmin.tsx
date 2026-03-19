import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/src/lib/supabase';
import toast from 'react-hot-toast';
import { 
  Bus, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Database } from '@/src/types/database';

type RouteRow = Database['public']['Tables']['routes']['Row'];
type BusRow = Database['public']['Tables']['buses']['Row'] & { routes?: RouteRow | null };

export default function BusesAdmin() {
  const [buses, setBuses] = useState<BusRow[]>([]);
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<BusRow | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    plate: '',
    model: '',
    manufacturer: '',
    order_number: '',
    route_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [busesRes, routesRes] = await Promise.all([
      supabase.from('buses').select('*, routes(*)').order('created_at', { ascending: false }),
      supabase.from('routes').select('*').order('name')
    ]);
    
    if (busesRes.error) console.error('Error fetching buses:', busesRes.error);
    else setBuses(busesRes.data as any || []);

    if (routesRes.error) console.error('Error fetching routes:', routesRes.error);
    else setRoutes(routesRes.data || []);
    
    setLoading(false);
  };

  const handleOpenModal = (bus?: BusRow) => {
    if (bus) {
      setEditingBus(bus);
      setFormData({
        plate: bus.plate,
        model: bus.model,
        manufacturer: bus.manufacturer,
        order_number: bus.order_number,
        route_id: bus.route_id || '',
      });
    } else {
      setEditingBus(null);
      setFormData({
        plate: '',
        model: '',
        manufacturer: '',
        order_number: '',
        route_id: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    // Validation: Plate ABC123 format (3 letters, 3 numbers)
    const plateRegex = /^[A-Z]{3}\d{3}$/;
    if (!plateRegex.test(formData.plate.toUpperCase())) {
      toast.error('La placa debe tener el formato ABC123');
      setFormLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData, 
        plate: formData.plate.toUpperCase(),
        route_id: formData.route_id || null
      };

      if (editingBus) {
        const { error } = await supabase
          .from('buses')
          .update(payload)
          .eq('id', editingBus.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('buses')
          .insert([payload]);
        if (error) throw error;
      }
      
      toast.success('Bus guardado exitosamente');
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el bus');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este bus?')) return;
    
    const { error } = await supabase.from('buses').delete().eq('id', id);
    if (error) toast.error('Error al eliminar: ' + error.message);
    else {
      toast.success('Bus eliminado');
      fetchData();
    }
  };

  const filteredBuses = buses.filter(bus => 
    bus.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Buses</h1>
          <p className="text-gray-500">Administra la flota de vehículos del sistema.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#FF6B00] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#e66000] transition-all flex items-center gap-2 shadow-lg shadow-[#FF6B00]/20"
        >
          <Plus className="w-5 h-5" /> Nuevo Bus
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-grow">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por placa, modelo o fabricante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vehículo</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Detalles</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ruta Asignada</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">N° Orden</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00] mx-auto" />
                  </td>
                </tr>
              ) : filteredBuses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron buses.
                  </td>
                </tr>
              ) : (
                filteredBuses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                          <Bus className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{bus.plate}</p>
                          <p className="text-xs text-gray-500">{bus.manufacturer}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{bus.model}</p>
                    </td>
                    <td className="px-6 py-4">
                      {bus.routes ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {bus.routes.name} ({bus.routes.code})
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        #{bus.order_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(bus)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(bus.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
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
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-[#0A1F44] p-6 text-white flex items-center justify-between">
                <h3 className="text-xl font-bold">{editingBus ? 'Editar Bus' : 'Nuevo Bus'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Placa</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="ABC123"
                      value={formData.plate}
                      onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">N° de Orden</label>
                    <input
                      type="text"
                      required
                      value={formData.order_number}
                      onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Fabricante</label>
                  <input
                    type="text"
                    required
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Modelo / Línea</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Ruta Asignada</label>
                  <select
                    value={formData.route_id}
                    onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                  >
                    <option value="">Sin asignar</option>
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex gap-4">
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
                    {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Bus'}
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
