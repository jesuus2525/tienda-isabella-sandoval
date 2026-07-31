import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabase/client";
import { useTheme } from "../../context/ThemeContext";
import { ShoppingBag, Settings, LogOut, User, LayoutDashboard } from "lucide-react";

interface NavbarProps {
  cantidadCarrito: number;
  abrirCarrito: () => void;
}

export const Navbar = ({ cantidadCarrito, abrirCarrito }: NavbarProps) => {
  const { config } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuAdminAbierto, setMenuAdminAbierto] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsAdmin(!!session));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => setIsAdmin(!!session));
    return () => authListener.subscription.unsubscribe();
  }, []);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setMenuAdminAbierto(false);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      
      {/* BARRA SUPERIOR DE ANUNCIOS */}
      {config.textoAnuncio && (
        <div style={{ backgroundColor: config.colorPrimario }} className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest py-2 px-4 text-center overflow-hidden">
          <p className="animate-pulse">{config.textoAnuncio}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* LOGO Y NOMBRE */}
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 group">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt={config.nombreTienda} className="w-10 h-10 object-contain rounded-full" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center font-black text-rose-500 text-sm">
              {config.nombreTienda.charAt(0)}
            </div>
          )}
          <div className="flex flex-col">
            <span style={{ color: config.colorTextoNombre || "#111827" }} className="font-black text-base sm:text-xl tracking-tight uppercase group-hover:opacity-75 transition">
              {config.nombreTienda}
            </span>
            {config.eslogan && (
              <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase -mt-1">{config.eslogan}</span>
            )}
          </div>
        </Link>

        {/* ACCIONES DEL MENÚ */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative">
            {isAdmin ? (
              <>
                <button 
                  onClick={() => setMenuAdminAbierto(!menuAdminAbierto)} 
                  className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-rose-600 transition shadow-sm"
                >
                  <LayoutDashboard size={14} />
                  <span className="hidden md:inline">Admin</span>
                </button>

                {/* MENÚ DESPLEGABLE CON SESIÓN ACTIVA */}
                {menuAdminAbierto && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-fade-in-up">
                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                      <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Sesión Activa</p>
                      <p className="text-xs font-extrabold text-gray-900 truncate">Administrador</p>
                    </div>
                    <Link 
                      to="/admin" 
                      onClick={() => setMenuAdminAbierto(false)} 
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition uppercase"
                    >
                      <Settings size={16} /> Panel de Control
                    </Link>
                    <button 
                      onClick={cerrarSesion} 
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition uppercase border-t border-gray-50"
                    >
                      <LogOut size={16} /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="text-gray-600 hover:text-rose-500 transition p-2">
                <User size={20} />
              </Link>
            )}
          </div>

          {/* CARRITO */}
          <button onClick={abrirCarrito} className="relative p-2 text-gray-900 hover:text-rose-500 transition">
            <ShoppingBag size={22} />
            {cantidadCarrito > 0 && (
              <span className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-bounce">
                {cantidadCarrito}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};