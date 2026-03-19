import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bus, 
  Users, 
  Map, 
  MessageSquare, 
  LayoutDashboard, 
  UserCog, 
  LogOut, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/login');
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Buses', path: '/admin/buses', icon: Bus },
    { name: 'Conductores', path: '/admin/conductors', icon: Users },
    { name: 'Rutas', path: '/admin/routes', icon: Map },
    { name: 'PQR', path: '/admin/pqr', icon: MessageSquare },
    { name: 'Administradores', path: '/admin/admins', icon: UserCog },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-[#0A1F44] text-white transition-all duration-300 flex flex-col fixed inset-y-0 z-50",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <Link to="/admin" className={cn("flex items-center gap-2 overflow-hidden", !isSidebarOpen && "justify-center w-full")}>
            <div className="bg-[#FF6B00] p-1.5 rounded-lg shrink-0">
              <Bus className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && <span className="text-xl font-bold tracking-tight whitespace-nowrap">PASTOSETP</span>}
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-grow mt-6 px-3 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                  isActive 
                    ? "bg-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/20" 
                    : "hover:bg-white/10 text-gray-400 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "group-hover:text-white")} />
                {isSidebarOpen && <span className="font-medium">{item.name}</span>}
                {isSidebarOpen && isActive && <ChevronRight className="ml-auto w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-grow transition-all duration-300 min-h-screen",
        isSidebarOpen ? "ml-64" : "ml-20"
      )}>
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:block p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {menuItems.find(i => i.path === location.pathname)?.name || 'Administración'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
              <p className="text-xs text-gray-500 capitalize">Administrador</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#0A1F44] flex items-center justify-center text-white font-bold">
              {user.email?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
