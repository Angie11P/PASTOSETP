import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/src/lib/supabase';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Loader2,
  Phone,
  Mail,
  Bus,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Database } from '@/src/types/database';

type ConductorRow = Database['public']['Tables']['conductors']['Row'];
type BusRow = Database['public']['Tables']['buses']['Row'];

export default function ConductorsAdmin() {
  const [conductors, setConductors] = useState<(ConductorRow & { buses: BusRow | null })[]>([]);
  const [buses, setBuses] = useState<BusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConductor, setEditingConductor] = useState<ConductorRow | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: '', // 11 digits
    name: '',
    age: 18,
    phone: '',
    email: '',
    bus_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [conductorsRes, busesRes] = await Promise.all([
      supabase.from('conductors').select('*, buses(*)').order('created_at', { ascending: false }),
      supabase.from('buses').select('*').order('plate')
    ]);
    
    if (conductorsRes.error) console.error('Error fetching conductors:', conductorsRes.error);
    else setConductors(conductorsRes.data as any || []);

    if (busesRes.error) console.error('Error fetching buses:', busesRes.error);
    else setBuses(busesRes.data || []);

    setLoading(false);
  };

  const handleOpenModal = (conductor?: ConductorRow) => {
    if (conductor) {
      setEditingConductor(conductor);
      setFormData({
        id: conductor.id,
        name: conductor.name,
        age: conductor.age,
        phone: conductor.phone,
        email: conductor.email,
        bus_id: conductor.bus_id || '',
      });
    } else {
      setEditingConductor(null);
      setFormData({
        id: '',
        name: '',
        age: 18,
        phone: '',
        email: '',
        bus_id: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    // Validations
    if (formData.id.length !== 11 || !/^\d+$/.test(formData.id)) {
      alert('El ID debe tener exactamente 11 dígitos numéricos');
      setFormLoading(false);
      return;
    }
    if (formData.phone.length !== 10 || !/^\d+$/.test(formData.phone)) {
      alert('El teléfono debe tener exactamente 10 dígitos numéricos');
      setFormLoading(false);
      return;
    }
    if (formData.age < 18) {
      alert('El conductor debe ser mayor de 18 años');
      setFormLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        bus_id: formData.bus_id || null
      };

      if (editingConductor) {
        const { error } = await supabase
          .from('conductors')
          .update(payload)
          .eq('id', editingConductor.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('conductors')
          .insert([payload]);
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Error al guardar el conductor');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este conductor?')) return;
    
    const { error } = await supabase.from('conductors').delete().eq('id', id);
    if (error) alert('Error al eliminar: ' + error.message);
    else fetchData();
  };

  const filteredConductors = conductors.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Conductores</h1>
          <p className="text-gray-500">Administra el personal operativo del sistema.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#FF6B00] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#e66000] transition-all flex items-center gap-2 shadow-lg shadow-[#FF6B00]/20"
        >
          <Plus className="w-5 h-5" /> Nuevo Conductor
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, ID o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Conductor</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Bus Asignado</th>
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
              ) : filteredConductors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron conductores.
                  </td>
                </tr>
              ) : (
                filteredConductors.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-500">ID: {c.id} · {c.age} años</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Phone className="w-3.5 h-3.5" /> {c.phone}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Mail className="w-3.5 h-3.5" /> {c.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {c.buses ? (
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-lg w-fit">
                          <Bus className="w-4 h-4" /> {c.buses.plate}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(c)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id)}
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
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-[#0A1F44] p-6 text-white flex items-center justify-between">
                <h3 className="text-xl font-bold">{editingConductor ? 'Editar Conductor' : 'Nuevo Conductor'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Identificación (11 dígitos)</label>
                    <input
                      type="text"
                      required
                      maxLength={11}
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                      disabled={!!editingConductor}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Edad (mínimo 18)</label>
                    <input
                      type="number"
                      required
                      min={18}
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Teléfono (10 dígitos)</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Bus Asignado</label>
                    <select
                      value={formData.bus_id}
                      onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                    >
                      <option value="">Sin asignar</option>
                      {buses.map(bus => (
                        <option key={bus.id} value={bus.id}>{bus.plate} - {bus.manufacturer}</option>
                      ))}
                    </select>
                  </div>
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
                    {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Conductor'}
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
