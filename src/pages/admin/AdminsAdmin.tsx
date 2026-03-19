import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/src/lib/supabase';
import toast from 'react-hot-toast';
import { 
  UserCog, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Loader2,
  Shield,
  ShieldAlert,
  Mail,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Database } from '@/src/types/database';

type AdminProfile = Database['public']['Tables']['admins_profile']['Row'];

export default function AdminsAdmin() {
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminProfile | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin' as 'superadmin' | 'admin',
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    // Note: In a real app, we'd join with auth.users to get emails.
    // Since we can't easily access auth.users from client-side without admin SDK,
    // we'll assume the admin_profile table stores the email or we just show IDs.
    // For this demo, we'll just fetch from admins_profile.
    const { data, error } = await supabase
      .from('admins_profile')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching admins:', error);
    else setAdmins(data || []);
    setLoading(false);
  };

  const handleOpenModal = (admin?: AdminProfile) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        email: '', // Password/Email change would be handled differently in real auth
        password: '',
        role: admin.role,
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        email: '',
        password: '',
        role: 'admin',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (editingAdmin) {
        const { error } = await supabase
          .from('admins_profile')
          .update({ role: formData.role })
          .eq('id', editingAdmin.id);
        if (error) throw error;
      } else {
        // In a real app, this would involve supabase.auth.admin.createUser
        // which requires a service role key. For this demo, we'll just
        // simulate the profile creation.
        toast.error('La creación de usuarios requiere configuración de Supabase Auth Admin. Por ahora, solo puedes editar roles de perfiles existentes.');
      }
      
      toast.success('Administrador guardado exitosamente');
      setIsModalOpen(false);
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el administrador');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este administrador?')) return;
    
    const { error } = await supabase.from('admins_profile').delete().eq('id', id);
    if (error) toast.error('Error al eliminar: ' + error.message);
    else {
      toast.success('Administrador eliminado');
      fetchAdmins();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Administradores</h1>
          <p className="text-gray-500">Controla el acceso al panel administrativo.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#FF6B00] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#e66000] transition-all flex items-center gap-2 shadow-lg shadow-[#FF6B00]/20"
        >
          <Plus className="w-5 h-5" /> Nuevo Admin
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Administrador</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha Registro</th>
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
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron perfiles de administrador.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2.5 rounded-xl text-gray-600">
                          <UserCog className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">ID: {admin.id.substring(0, 8)}...</p>
                          <p className="text-xs text-gray-500">Perfil de Sistema</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {admin.role === 'superadmin' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border border-purple-100">
                          <ShieldAlert className="w-3 h-3" /> Superadmin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                          <Shield className="w-3 h-3" /> Admin
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(admin.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(admin)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(admin.id)}
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
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-[#0A1F44] p-6 text-white flex items-center justify-between">
                <h3 className="text-xl font-bold">{editingAdmin ? 'Editar Rol' : 'Nuevo Admin'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {!editingAdmin && (
                  <>
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
                      <label className="text-sm font-semibold text-gray-700">Contraseña Temporal</label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Rol de Usuario</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                  >
                    <option value="admin">Administrador Estándar</option>
                    <option value="superadmin">Super Administrador</option>
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
                    {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Cambios'}
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
