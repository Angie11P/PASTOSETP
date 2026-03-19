import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { getDashboardInsights } from '@/src/services/geminiService';
import { 
  Bus, 
  Users, 
  Map, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion } from 'motion/react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    buses: 0,
    conductors: 0,
    routes: 0,
    pqrs: 0,
    pqrByStatus: [] as any[]
  });
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          { count: busesCount },
          { count: conductorsCount },
          { count: routesCount },
          { data: pqrsData }
        ] = await Promise.all([
          supabase.from('buses').select('*', { count: 'exact', head: true }),
          supabase.from('conductors').select('*', { count: 'exact', head: true }),
          supabase.from('routes').select('*', { count: 'exact', head: true }),
          supabase.from('pqrs').select('status')
        ]);

        const pqrStatusCounts = (pqrsData || []).reduce((acc: any, curr: any) => {
          acc[curr.status] = (acc[curr.status] || 0) + 1;
          return acc;
        }, {});

        const pqrChartData = [
          { name: 'Recibidos', value: pqrStatusCounts.recibido || 0, color: '#3b82f6' },
          { name: 'En Trámite', value: pqrStatusCounts.en_tramite || 0, color: '#f59e0b' },
          { name: 'Resueltos', value: pqrStatusCounts.resuelto || 0, color: '#10b981' },
        ];

        const newStats = {
          buses: busesCount || 0,
          conductors: conductorsCount || 0,
          routes: routesCount || 0,
          pqrs: pqrsData?.length || 0,
          pqrByStatus: pqrChartData
        };

        setStats(newStats);
        
        // Fetch AI Insights
        setInsightsLoading(true);
        const aiInsights = await getDashboardInsights(newStats);
        setInsights(aiInsights);
        setInsightsLoading(false);

      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Buses', value: stats.buses, icon: Bus, color: 'bg-blue-500' },
    { label: 'Conductores', value: stats.conductors, icon: Users, color: 'bg-orange-500' },
    { label: 'Rutas Activas', value: stats.routes, icon: Map, color: 'bg-emerald-500' },
    { label: 'Total PQR', value: stats.pqrs, icon: MessageSquare, color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido al Panel de Control</h1>
        <p className="text-gray-500">Resumen general del estado del sistema SETP.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
                <h3 className="text-3xl font-bold text-gray-900">{card.value}</h3>
              </div>
              <div className={`${card.color} p-3 rounded-xl text-white`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>Actualizado ahora</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-[#0A1F44] to-[#1a3a7a] p-8 rounded-3xl text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-bold">Insights Inteligentes (Gemini AI)</h3>
          </div>
          {insightsLoading ? (
            <div className="flex items-center gap-3 text-white/60">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="text-sm">Analizando datos del sistema...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {insights.map((insight, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <p className="text-sm leading-relaxed text-white/90">{insight}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PQR Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">Estado de PQR</h3>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div> Recibidos
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div> En Trámite
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Resueltos
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.pqrByStatus}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                  {stats.pqrByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Alerts */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Alertas del Sistema</h3>
          <div className="space-y-6">
            {[
              { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', title: 'PQR Pendiente', time: 'Hace 5 min', desc: 'Nueva solicitud de ruta C14' },
              { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', title: 'Mantenimiento', time: 'Hace 2 horas', desc: 'Bus ABC123 en revisión técnica' },
              { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', title: 'Ruta Optimizada', time: 'Hace 5 horas', desc: 'Ruta E1 actualizada con nuevos paraderos' },
            ].map((alert, i) => (
              <div key={i} className="flex gap-4">
                <div className={`${alert.bg} ${alert.color} p-2.5 rounded-xl shrink-0 h-fit`}>
                  <alert.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-bold text-gray-900">{alert.title}</h4>
                    <span className="text-[10px] text-gray-400 font-medium uppercase">{alert.time}</span>
                  </div>
                  <p className="text-sm text-gray-500">{alert.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-sm font-bold text-[#FF6B00] bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
            Ver todas las notificaciones
          </button>
        </div>
      </div>
    </div>
  );
}
