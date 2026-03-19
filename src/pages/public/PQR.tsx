import { useState, FormEvent } from 'react';
import { supabase } from '@/src/lib/supabase';
import { refinePQRDescription } from '@/src/services/geminiService';
import toast from 'react-hot-toast';
import { 
  MessageSquare, Send, Search, Loader2, CheckCircle2, 
  Clock, AlertCircle, FileText, Sparkles, User, Mail, HelpCircle, FileSignature
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Database } from '@/src/types/database';

type PQRRow = Database['public']['Tables']['pqrs']['Row'];

export default function PQR() {
  const [activeTab, setActiveTab] = useState<'create' | 'track'>('create');
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState('');
  const [trackedPqr, setTrackedPqr] = useState<PQRRow | null>(null);

  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    subject: '',
    description: '',
  });

  const handleRefine = async () => {
    if (!formData.description || !formData.subject) {
      toast.error('Por favor completa el asunto y la descripción para usar la Inteligencia Artificial.');
      return;
    }
    setRefining(true);
    const refined = await refinePQRDescription(formData.subject, formData.description);
    setFormData({ ...formData, description: refined });
    setRefining(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Radicado simple seguro (idealmente lo hace el backend, pero como es supabase DB directa...)
    const code = 'PQR-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      const { error } = await supabase
        .from('pqrs')
        .insert([{ ...formData, code, status: 'recibido' }]);
      
      if (error) throw error;
      
      setSuccess(code);
      setFormData({ user_name: '', user_email: '', subject: '', description: '' });
    } catch (error: any) {
      toast.error('Error en la radicación: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: FormEvent) => {
    e.preventDefault();
    if (!trackingCode) return;
    
    setLoading(true);
    setTrackedPqr(null);
    
    const { data, error } = await supabase
      .from('pqrs')
      .select('*')
      .eq('code', trackingCode.toUpperCase())
      .single();
    
    if (error) {
      toast.error('Código inválido o solicitud no encontrada. Asegúrate de incluir el prefijo PQR-');
    } else {
      setTrackedPqr(data);
    }
    setLoading(false);
  };

  const getStatusInfo = (status: PQRRow['status']) => {
    switch (status) {
      case 'recibido':
        return { label: 'Recibido', icon: Clock, color: 'text-indigo-600', border: 'border-indigo-600', bg: 'bg-indigo-50', desc: 'Tu solicitud ha sido radicada correctamente y está a la espera de ser asignada a un gestor de servicio.' };
      case 'en_tramite':
        return { label: 'En Trámite', icon: AlertCircle, color: 'text-[#FF6B00]', border: 'border-[#FF6B00]', bg: 'bg-orange-50', desc: 'Estamos analizando activamente tu caso para darte una pronta respuesta regulatoria.' };
      case 'resuelto':
        return { label: 'Finalizado', icon: CheckCircle2, color: 'text-emerald-600', border: 'border-emerald-600', bg: 'bg-emerald-50', desc: 'Tu solicitud ha sido atendida y la respuesta formal ha sido procesada.' };
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Cabecera */}
        <div className="mb-14 text-center">
           <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex bg-white text-[#0A1F44] px-4 py-2 rounded-full font-bold text-sm tracking-widest uppercase mb-6 shadow-sm border border-gray-100"
          >
            Servicio al Ciudadano
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl md:text-5xl font-black text-[#0A1F44] mb-4 tracking-tight"
          >
            Peticiones, Quejas y Reclamos
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            El Sistema Estratégico de Transporte valora tu opinión. Utiliza el 
            formato a continuación para radicar tus requerimientos rápida y formalmente.
          </motion.p>
        </div>

        {/* Componente Modular Central */}
        <div className="bg-white rounded-[2.5rem] p-6 md:p-12 shadow-2xl border border-gray-100">
          
          {/* Navegación por Tabs tipo Segmented Control Profundo */}
          <div className="flex p-1.5 bg-gray-100/80 rounded-2xl mb-12 max-w-lg mx-auto relative shadow-inner">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-4 flex justify-center items-center gap-2 rounded-xl font-bold text-sm transition-all z-10 ${
                activeTab === 'create' ? 'text-[#0A1F44]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FileSignature className="w-4 h-4" /> Radicar Solicitud
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`flex-1 py-4 flex justify-center items-center gap-2 rounded-xl font-bold text-sm transition-all z-10 ${
                activeTab === 'track' ? 'text-[#0A1F44]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Search className="w-4 h-4" /> Consultar Estado
            </button>

            {/* Microanimación del Tab Activo */}
            <motion.div
              layoutId="active-tab-indicator"
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm border border-gray-200"
              initial={false}
              animate={{
                left: activeTab === 'create' ? '6px' : 'calc(50% + 1px)'
              }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
            />
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'create' ? (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {success ? (
                  <div className="text-center py-16 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="bg-emerald-500 text-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-12 h-12" />
                    </motion.div>
                    <h2 className="text-3xl font-black text-[#0A1F44] mb-4">Radicado Formalmente</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                      La solicitud ha sido registrada en el sistema del SETP. Utiliza el siguiente código único para rastrear el progreso de tu requerimiento en cualquier momento.
                    </p>
                    <div className="bg-white px-8 py-6 rounded-2xl border-2 border-dashed border-[#FF6B00] inline-block mb-10 shadow-sm relative overflow-hidden group">
                      <div className="absolute inset-0 bg-[#FF6B00]/5 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                      <span className="text-5xl font-black text-[#0A1F44] tracking-widest relative z-10">{success}</span>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 tracking-widest">Código de Trámite</p>
                    </div>
                    <div>
                      <button 
                        onClick={() => setSuccess(null)}
                        className="inline-flex items-center gap-2 text-[#0A1F44] font-bold hover:text-[#FF6B00] transition-colors"
                      >
                         Radicar otra solicitud
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Name Input */}
                      <div className="relative group">
                        <label className="absolute -top-3 left-4 bg-white px-2 text-xs font-black text-gray-400 uppercase tracking-widest z-10 group-focus-within:text-[#FF6B00] transition-colors">Nombre Completo</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#FF6B00] transition-colors" />
                          <input
                            type="text"
                            required
                            value={formData.user_name}
                            onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/10 transition-all font-medium text-gray-800"
                            placeholder="Ej: María Martínez"
                          />
                        </div>
                      </div>

                      {/* Email Input */}
                      <div className="relative group">
                        <label className="absolute -top-3 left-4 bg-white px-2 text-xs font-black text-gray-400 uppercase tracking-widest z-10 group-focus-within:text-[#FF6B00] transition-colors">Correo Electrónico</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#FF6B00] transition-colors" />
                          <input
                            type="email"
                            required
                            value={formData.user_email}
                            onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/10 transition-all font-medium text-gray-800"
                            placeholder="ciudadano@ejemplo.com"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Subject Input */}
                    <div className="relative group">
                      <label className="absolute -top-3 left-4 bg-white px-2 text-xs font-black text-gray-400 uppercase tracking-widest z-10 group-focus-within:text-[#FF6B00] transition-colors">Asunto Principal</label>
                      <div className="relative">
                        <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#FF6B00] transition-colors" />
                        <input
                          type="text"
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/10 transition-all font-medium text-gray-800"
                          placeholder="Ej: Inconformidad con retrasos Ruta C14"
                        />
                      </div>
                    </div>

                    {/* Textarea */}
                    <div className="relative group pt-4">
                      <div className="flex items-center justify-between mb-4 px-2">
                        <label className="text-sm font-black text-[#0A1F44] uppercase tracking-widest">Descripción Detallada</label>
                        <button
                          type="button"
                          onClick={handleRefine}
                          disabled={refining}
                          className="text-xs font-bold bg-[#0A1F44] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#152e5a] transition-all disabled:opacity-50 active:scale-95 shadow-md shadow-[#0A1F44]/20"
                        >
                          {refining ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                          )}
                          Estructurar con IA
                        </button>
                      </div>
                      <textarea
                        required
                        rows={6}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-6 bg-gray-50/50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/10 transition-all font-medium text-gray-800 resize-none"
                        placeholder="Redacta clara y respetuosamente tu requerimiento. Entre más detalles proporciones, más ágil será la respuesta..."
                      ></textarea>
                      <p className="text-xs text-gray-400 font-medium mt-3 px-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Las peticiones abusivas o sin fundamento podrán ser desestimadas o archivadas según Ley vigente.
                      </p>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                       <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#FF6B00] text-white py-5 rounded-2xl font-black text-xl hover:bg-[#e66000] hover:-translate-y-1 transition-all shadow-[0_15px_40px_-10px_#FF6B00] flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0"
                      >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Send className="w-6 h-6" /> Efectuar Radicación Oficial</>}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="track"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                <div className="bg-[#0A1F44] rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
                   {/* Background element */}
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>

                  <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4 relative z-10">
                    <div className="relative flex-grow group">
                      <Search className="w-6 h-6 text-gray-400 absolute left-6 top-1/2 -translate-y-1/2 group-focus-within:text-[#FF6B00] transition-colors" />
                      <input
                        type="text"
                        placeholder="Nº Radicado (Ej: PQR-ABC123)"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                        className="w-full pl-16 pr-6 py-5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#FF6B00]/30 transition-all text-xl font-bold uppercase tracking-widest placeholder:text-gray-300 placeholder:lowercase placeholder:font-medium placeholder:tracking-normal"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#FF6B00] text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-[#e66000] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100 active:scale-95 shadow-lg shadow-[#FF6B00]/20 shrink-0"
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Consultar'}
                    </button>
                  </form>
                </div>

                {trackedPqr && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 border-b-2 border-dashed border-gray-100 pb-12">
                      <div className="flex items-center gap-6">
                        <div className={`p-5 rounded-3xl ${getStatusInfo(trackedPqr.status).bg} ${getStatusInfo(trackedPqr.status).color} shadow-sm border ${getStatusInfo(trackedPqr.status).border}`}>
                          {(() => {
                            const Icon = getStatusInfo(trackedPqr.status).icon;
                            return <Icon className="w-10 h-10" />;
                          })()}
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Estado Inmediato</p>
                          <h3 className={`text-4xl font-black tracking-tight ${getStatusInfo(trackedPqr.status).color}`}>
                            {getStatusInfo(trackedPqr.status).label}
                          </h3>
                        </div>
                      </div>
                      <div className="text-left lg:text-right bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Referencia</p>
                        <p className="text-3xl font-black text-[#0A1F44] tracking-widest">{trackedPqr.code}</p>
                      </div>
                    </div>

                    <div className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                            <User className="w-4 h-4 text-[#FF6B00]"/> Remitente
                          </h4>
                          <p className="text-xl font-bold text-[#0A1F44]">{trackedPqr.user_name}</p>
                          <p className="text-gray-500 font-medium">{trackedPqr.user_email}</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-[#FF6B00]"/> Fecha y Hora Radicación
                          </h4>
                          <p className="text-xl font-bold text-[#0A1F44]">
                            {new Date(trackedPqr.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric'})}
                          </p>
                          <p className="text-gray-500 font-medium">
                            {new Date(trackedPqr.created_at).toLocaleTimeString('es-CO')}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                        <div className="bg-[#0A1F44] text-white px-8 py-5">
                          <h4 className="text-xs font-black uppercase tracking-widest text-[#FF6B00] mb-2">Asunto Declarado</h4>
                          <p className="text-2xl font-bold">{trackedPqr.subject}</p>
                        </div>
                        <div className="p-8">
                          <p className="text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">{trackedPqr.description}</p>
                        </div>
                      </div>

                      <div className={`p-8 rounded-2xl border ${getStatusInfo(trackedPqr.status).bg} border-current border-opacity-30 flex items-start gap-6 shadow-inner`}>
                        <div className={`shrink-0 ${getStatusInfo(trackedPqr.status).color}`}>
                          <FileText className="w-8 h-8" />
                        </div>
                        <div>
                           <h4 className={`text-sm font-black uppercase tracking-widest mb-2 ${getStatusInfo(trackedPqr.status).color}`}>Observación del Sistema</h4>
                           <p className={`text-lg font-medium leading-relaxed ${getStatusInfo(trackedPqr.status).color}`}>
                            {getStatusInfo(trackedPqr.status).desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
