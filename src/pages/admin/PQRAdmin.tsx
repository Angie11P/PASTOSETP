import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { 
  MessageSquare, 
  Search, 
  X, 
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Mail,
  User,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Database } from '@/src/types/database';

type PQRRow = Database['public']['Tables']['pqrs']['Row'];

export default function PQRAdmin() {
  const [pqrs, setPqrs] = useState<PQRRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPqr, setSelectedPqr] = useState<PQRRow | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    fetchPQRs();
  }, []);

  const fetchPQRs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pqrs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching PQRs:', error);
    else setPqrs(data || []);
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: PQRRow['status']) => {
    setStatusLoading(true);
    const { error } = await supabase
      .from('pqrs')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (error) alert('Error al actualizar estado');
    else {
      setPqrs(pqrs.map(p => p.id === id ? { ...p, status: newStatus } : p));
      if (selectedPqr?.id === id) setSelectedPqr({ ...selectedPqr, status: newStatus });
    }
    setStatusLoading(false);
  };

  const getStatusBadge = (status: PQRRow['status']) => {
    switch (status) {
      case 'recibido':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100"><Clock className="w-3 h-3" /> Recibido</span>;
      case 'en_tramite':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100"><AlertCircle className="w-3 h-3" /> En Trámite</span>;
      case 'resuelto':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100"><CheckCircle2 className="w-3 h-3" /> Resuelto</span>;
    }
  };

  const filteredPQRs = pqrs.filter(p => 
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de PQR</h1>
        <p className="text-gray-500">Atiende las peticiones, quejas y reclamos de los ciudadanos.</p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-grow">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código, usuario o asunto..."
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
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Radicado</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Asunto</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00] mx-auto" />
                  </td>
                </tr>
              ) : filteredPQRs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron solicitudes PQR.
                  </td>
                </tr>
              ) : (
                filteredPQRs.map((pqr) => (
                  <tr key={pqr.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-[#0A1F44]">{pqr.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{pqr.user_name}</p>
                          <p className="text-xs text-gray-500">{pqr.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 line-clamp-1">{pqr.subject}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(pqr.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedPqr(pqr)}
                        className="p-2 text-gray-400 hover:text-[#FF6B00] hover:bg-orange-50 rounded-lg transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPqr && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPqr(null)}
              className="absolute inset-0 bg-[#0A1F44]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-[#0A1F44] p-6 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Detalle PQR: {selectedPqr.code}</h3>
                  <p className="text-white/60 text-sm">Recibido el {new Date(selectedPqr.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => setSelectedPqr(null)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Usuario</p>
                    <p className="font-bold text-gray-900">{selectedPqr.user_name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> {selectedPqr.user_email}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estado Actual</p>
                    <div>{getStatusBadge(selectedPqr.status)}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Asunto</p>
                  <p className="text-lg font-bold text-gray-900">{selectedPqr.subject}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descripción</p>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-gray-700 leading-relaxed">
                    {selectedPqr.description}
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <p className="text-sm font-bold text-gray-900">Cambiar Estado:</p>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'recibido', label: 'Recibido', color: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200' },
                      { id: 'en_tramite', label: 'En Trámite', color: 'hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200' },
                      { id: 'resuelto', label: 'Resuelto', color: 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200' },
                    ].map((status) => (
                      <button
                        key={status.id}
                        disabled={statusLoading || selectedPqr.status === status.id}
                        onClick={() => handleUpdateStatus(selectedPqr.id, status.id as any)}
                        className={`py-3 px-4 rounded-xl border border-gray-200 text-sm font-bold transition-all disabled:opacity-50 ${status.color} ${selectedPqr.status === status.id ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600'}`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => setSelectedPqr(null)}
                  className="w-full py-4 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
