import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Bus, Search, Loader2, Info } from 'lucide-react';
import { motion } from 'motion/react';
import type { Database } from '@/src/types/database';

type BusRow = Database['public']['Tables']['buses']['Row'];

export default function Buses() {
  const [buses, setBuses] = useState<BusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBuses = async () => {
      const { data, error } = await supabase
        .from('buses')
        .select('*')
        .order('plate');
      if (error) console.error(error);
      else setBuses(data || []);
      setLoading(false);
    };
    fetchBuses();
  }, []);

  const filteredBuses = buses.filter(b => 
    b.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[#0A1F44] mb-4">Consulta de Buses</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Conoce la flota de vehículos que operan en el Sistema Estratégico de Transporte Público de Pasto.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por placa o fabricante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#FF6B00]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBuses.map((bus, i) => (
              <motion.div
                key={bus.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-[#FF6B00] group-hover:text-white transition-colors">
                    <Bus className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vehículo Oficial</span>
                </div>
                
                <h3 className="text-3xl font-black text-[#0A1F44] mb-2 tracking-tight">{bus.plate}</h3>
                <p className="text-gray-500 font-medium mb-6">{bus.manufacturer} · {bus.model}</p>
                
                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Info className="w-4 h-4" />
                    <span>N° Orden: {bus.order_number}</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              </motion.div>
            ))}
            {filteredBuses.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-400 text-lg italic">No se encontraron buses con los criterios de búsqueda.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
