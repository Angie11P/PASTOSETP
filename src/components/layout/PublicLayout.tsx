import { Link, Outlet, useLocation } from 'react-router-dom';
import { Bus, Map as MapIcon, MessageSquare, Home, Menu, X, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);

export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setIsMenuOpen(false), [location.pathname]);

  const navLinks = [
    { name: 'Inicio', path: '/', icon: Home },
    { name: 'Consulta de Rutas', path: '/routes', icon: MapIcon },
    { name: 'Atención (PQR)', path: '/pqr', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-[#FF6B00] selection:text-white">
      {/* Navbar con Glassmorphism */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ease-out ${scrolled
          ? 'bg-[#0A1F44]/95 backdrop-blur-xl border-b border-white/5 shadow-2xl py-2'
          : 'bg-[#0A1F44] py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">

            <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded-xl p-1">
              <div className="relative">
                <img
                  src="/logo-square.png"
                  alt="SETP Logo"
                  className="w-10 h-10 object-contain rounded-xl bg-white/5 p-1 border border-white/10 shadow-sm relative z-10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement?.classList.add('fallback-logo');
                  }}
                />
                <style>{`.fallback-logo::before { content: '🚍'; font-size: 24px; }`}</style>
                <div className="absolute inset-0 bg-[#FF6B00] blur-md opacity-0 group-hover:opacity-50 transition-opacity rounded-xl"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white leading-none tracking-tight">SETP</span>
                <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-widest">Pasto</span>
              </div>
            </Link>

            {/* Menú Desktop */}
            <div className="hidden lg:flex items-center space-x-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] ${isActive ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <link.icon className={`w-4 h-4 ${isActive ? 'text-[#FF6B00]' : 'text-gray-400 group-hover:text-[#FF6B00]'} transition-colors`} />
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-[#FF6B00] rounded-t-full shadow-[0_0_10px_#FF6B00]"
                      />
                    )}
                  </Link>
                );
              })}

              <div className="w-px h-6 bg-white/10 mx-2"></div>

              <Link
                to="/admin"
                className="bg-[#FF6B00] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#e66000] hover:scale-105 transition-all shadow-lg shadow-[#FF6B00]/20 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1F44]"
              >
                Portal Interno <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Botón menú móvil */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                aria-label="Abrir menú"
              >
                <motion.div initial={false} animate={{ rotate: isMenuOpen ? 90 : 0 }}>
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </motion.div>
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-white/10 bg-[#0A1F44]/95 backdrop-blur-xl overflow-hidden mt-2"
            >
              <div className="px-4 py-6 space-y-2 max-w-7xl mx-auto">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all text-base ${isActive ? 'bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      <link.icon className={`w-5 h-5 ${isActive ? 'text-[#FF6B00]' : 'text-gray-400'}`} />
                      {link.name}
                    </Link>
                  );
                })}
                <div className="pt-6 mt-4 border-t border-white/10">
                  <Link
                    to="/admin"
                    className="flex justify-center items-center gap-2 bg-[#FF6B00] text-white px-4 py-4 rounded-2xl font-bold hover:bg-[#e66000] transition-colors"
                  >
                    Ingresar al Portal Interno <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content Area - Padding dinámico dependiendo de si es la página de inicio o no */}
      <main className={`flex-grow flex flex-col w-full ${location.pathname !== '/' ? 'pt-28 pb-12' : ''}`}>
        <div className="flex-grow w-full">
          <Outlet />
        </div>
      </main>

      {/* Footer Profesional */}
      <footer className="bg-[#0A1F44] text-white pt-24 pb-12 border-t-[6px] border-[#FF6B00] relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

            {/* Logo y descripción */}
            <div className="lg:col-span-4 space-y-6">
              <img
                src="/logo-horizontal.png"
                alt="SETP Horizontal"
                className="h-16 object-contain"
                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
              />
              <p className="text-gray-400 text-sm leading-relaxed pr-4">
                El Sistema Estratégico de Transporte Público (SETP) de Pasto es la solución definitiva para una movilidad urbana inteligente, sostenible, segura y orientada enteramente al servicio del ciudadano.
              </p>
            </div>

            {/* Enlaces */}
            <div className="lg:col-span-3 lg:col-start-6">
              <h4 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FF6B00]"></div> Ciudadanía
              </h4>
              <ul className="space-y-4 text-sm font-medium">
                {navLinks.map(link => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-gray-400 hover:text-[#FF6B00] hover:translate-x-1 transition-all flex items-center gap-2 focus-visible:text-[#FF6B00]">
                      <ChevronRight className="w-4 h-4" /> {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ayuda y Contacto */}
            <div className="lg:col-span-4">
              <h4 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FF6B00]"></div> Centro de Contacto
              </h4>
              <ul className="space-y-5 text-sm text-gray-400">
                <li className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <MapIcon className="w-6 h-6 text-[#FF6B00] shrink-0" />
                  <div>
                    <strong className="text-white block mb-1">Sede Principal</strong>
                    San Juan de Pasto, Nariño<br />Colombia, 520002
                  </div>
                </li>
                <li className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <MessageSquare className="w-6 h-6 text-[#FF6B00] shrink-0" />
                  <div>
                    <strong className="text-white block mb-1">Escríbenos</strong>
                    contacto@pastosetp.gov.co
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-gray-500 text-sm font-medium text-center md:text-left">
              &copy; {new Date().getFullYear()} PASTOSETP Institucional. Todos los derechos reservados.
            </p>
            <div className="flex bg-[#071630] p-1.5 rounded-xl border border-white/5">
              <button className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#FF6B00]">Términos de Uso</button>
              <div className="w-px h-auto bg-white/5 mx-1"></div>
              <button className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#FF6B00]">Privacidad Datos</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
