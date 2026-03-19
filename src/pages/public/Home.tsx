import {
  Bus, Map as MapIcon, MessageSquare, Search, ArrowRight, ShieldCheck, Clock, Users, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="flex flex-col font-sans bg-white overflow-hidden w-full">
      {/* Hero Section - Clean Solid Background but bleeding to top */}
      <section className="bg-[#0A1F44] text-white pt-32 pb-20 lg:pt-40 lg:pb-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8 text-center lg:text-left"
            >
              <motion.div variants={itemVariants}>
                <span className="inline-block bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00] px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase">
                  Sistema Estratégico Oficial
                </span>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                  Movilidad <span className="text-[#FF6B00]">Inteligente</span><br />
                  para Pasto
                </h1>
              </motion.div>

              <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Transformamos el transporte público de la ciudad. Consulta rutas en tiempo real, horarios y gestiona tus solicitudes en una plataforma unificada y sin complicaciones.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/routes"
                  className="bg-[#FF6B00] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#e66000] focus:ring-4 focus:ring-[#FF6B00]/30 transition-all flex items-center justify-center gap-2"
                >
                  Explorar Rutas <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/pqr"
                  className="bg-transparent text-white border-2 border-white/20 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 hover:border-white/40 focus:ring-4 focus:ring-white/20 transition-all flex items-center justify-center gap-2"
                >
                  Atención al Ciudadano
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative hidden lg:flex justify-end items-center"
            >
              {/* Limpio sin overlapping extremo, solo una caja decorativa muy sutil en el fondo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#FF6B00] rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
              <img
                src="/bus-illustration.png"
                alt="Bus SETP Pasto"
                className="w-full max-w-lg h-auto relative z-10 drop-shadow-2xl object-contain"
                style={{ animation: 'floating 4s ease-in-out infinite' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "../public/bus.png";
                }}
              />
              <style>{`
                  @keyframes floating {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                    100% { transform: translateY(0px); }
                  }
               `}</style>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section - Flat, clean layout sin margins negativos problemáticos */}
      <section className="py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Bus, label: 'Buses Activos', value: '450+', color: 'text-[#FF6B00]', bg: 'bg-[#FF6B00]/10' },
              { icon: MapIcon, label: 'Rutas Cubiertas', value: '32', color: 'text-[#0A1F44]', bg: 'bg-[#0A1F44]/10' },
              { icon: Users, label: 'Pasajeros Diarios', value: '85k+', color: 'text-emerald-600', bg: 'bg-emerald-100' },
              { icon: ShieldCheck, label: 'Confiabilidad', value: '100%', color: 'text-indigo-600', bg: 'bg-indigo-100' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] transition-all"
              >
                <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl mb-4`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <h3 className="text-4xl font-extrabold text-[#0A1F44] mb-1">{stat.value}</h3>
                <p className="text-gray-500 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Clean Cards */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#0A1F44] mb-6 tracking-tight">
              Servicios pensados para tu <span className="text-[#FF6B00]">Comodidad</span>
            </h2>
            <div className="w-16 h-1 bg-[#FF6B00] mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-500">
              Accede a toda la información oficial del Sistema Estratégico de Transporte Público de manera fácil, rápida y accesible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Rutas y Paraderos',
                desc: 'Explora mapas interactivos con el recorrido exacto de nuestras rutas oficiales y paraderos clave.',
                icon: MapIcon,
                link: '/routes'
              },
              {
                title: 'Atención (PQR)',
                desc: 'Tu voz nos importa. Radica y haz seguimiento a tus peticiones de manera 100% digital e instantánea.',
                icon: MessageSquare,
                link: '/pqr'
              },
              {
                title: 'Flota de Buses',
                desc: 'Consulta el directorio de todo nuestro parque automotor y verifica el estado de las unidades de transporte.',
                icon: Search,
                link: '/buses'
              }
            ].map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15 }}
              >
                <Link to={service.link} className="block h-full group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF6B00]/30 rounded-3xl">
                  <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100 group-hover:bg-white group-hover:border-[#FF6B00]/30 group-hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#0A1F44] group-hover:bg-[#FF6B00] group-hover:text-white transition-colors shadow-sm mb-8">
                      <service.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#0A1F44] mb-4">{service.title}</h3>
                    <p className="text-gray-600 flex-grow text-lg mb-8 leading-relaxed">
                      {service.desc}
                    </p>
                    <div className="inline-flex items-center text-[#FF6B00] font-bold uppercase tracking-wide gap-2 text-sm">
                      Acceder al módulo <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section - Minimalist */}
      <section className="py-24 bg-[#FF6B00] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <img
            src="/logo-horizontal.png"
            alt="SETP Pasto Logo"
            className="h-16 mx-auto mb-10 object-contain drop-shadow-md"
            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
          />
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            ¿Listo para moverte inteligentemente?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Nuestros servicios digitales están diseñados para ahorrarte tiempo informándote de forma precisa y constante.
          </p>
          <Link
            to="/routes"
            className="inline-flex items-center justify-center bg-[#0A1F44] text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-[#152e5a] hover:-translate-y-1 transition-all shadow-xl shadow-[#0A1F44]/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white border-2 border-transparent"
          >
            Abrir Mapa de Rutas
          </Link>
        </div>
      </section>
    </div>
  );
}
