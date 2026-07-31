import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabase/client";
import { useTheme } from "../../context/ThemeContext";
import { ShoppingBag, Settings, LogOut, User, LayoutDashboard, Search} from "lucide-react";

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

  // Función para desplazar la página hacia arriba con efecto suave
  const irArriba = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // "smooth" para desplazamiento suave, o "auto" para salto instantáneo
    });
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
        
        {/* LOGO */}
        <Link to="/" onClick={irArriba} className="text-lg sm:text-xl font-black text-violet-400 uppercase tracking-tight">
          ISABELLA <span  className="font-bold text-violet-400">SANDOVAL </span><span   className="font-bold text-[10px] text-violet-400" >makeup </span>
        </Link>

        {/* CONTROLES DE LA DERECHA */}
        <div className="flex items-center gap-4 sm:gap-5">

          {/* BOTÓN DE BÚSQUEDA O LUPA */}
          
          <button className="text-white hover:text-rose-500 transition">
            <Search size={20} />
          </button>
          
          {/* MENÚ DESPLEGABLE ADMINISTRADOR (POPOVER) */}
          {/* BOTÓN DE USUARIO / MENÚ DESPLEGABLE ADMINISTRADOR */}
          <div className="relative">
            {isAdmin ?  (  
              <> {console.log("Usuario Administrador Activo")}
                {/* Botón Avatar */}
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
            ): (
              /* Botón de acceso al login para cuando NO hay sesión iniciada */ 
              <Link to="/login" className="text-gray-900 hover:text-rose-500 transition flex items-center">
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