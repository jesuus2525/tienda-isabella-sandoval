import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { supabase } from "../../supabase/client";
import { Search, ShoppingBag, Menu, Settings, LogOut, User } from "lucide-react";
interface NavbarProps {
  cantidadCarrito: number;
  abrirCarrito: () => void;
}

export const Navbar = ({ cantidadCarrito, abrirCarrito }: NavbarProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuAdminAbierto, setMenuAdminAbierto] = useState(false);

  // Verificamos en la base de datos si hay sesión activa
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Función para destruir el token y salir
  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setMenuAdminAbierto(false);
    window.location.href = "/";
  };

  return (
    <header className="border-b border-gray-100 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-tight">
          ISABELLA <span className="font-light text-rose-400">SANDOVAL</span>
        </Link>

        {/* CONTROLES DE LA DERECHA */}
        <div className="flex items-center gap-4 sm:gap-5">
          
          <button className="text-gray-900 hover:text-rose-500 transition">
            <Search size={20} />
          </button>
          
          {/* MENÚ DESPLEGABLE ADMINISTRADOR (POPOVER) */}
          {/* BOTÓN DE USUARIO / MENÚ DESPLEGABLE ADMINISTRADOR */}
          <div className="relative">
            {isAdmin ? (
              <>
                {/* Botón Avatar */}
                <button 
                  onClick={() => setMenuAdminAbierto(!menuAdminAbierto)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition shadow-sm border border-gray-200"
                >
                  <img src="https://ui-avatars.com/api/?name=Admin+Isabella&background=f43f5e&color=fff" alt="Admin" className="w-full h-full rounded-full" />
                </button>

                {/* Ventana Flotante */}
                {menuAdminAbierto && (
                  <div className="absolute right-0 mt-3 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-fade-in-up">
                    <div className="flex items-center gap-3 p-3 mb-2 border-b border-gray-50">
                      <img src="https://ui-avatars.com/api/?name=Admin+Isabella&background=f43f5e&color=fff" alt="Perfil" className="w-10 h-10 rounded-full" />
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Administración</h4>
                        <p className="text-xs text-gray-400">Tienda Isabella Sandoval</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Link 
                        to="/admin" 
                        onClick={() => setMenuAdminAbierto(false)} 
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition"
                      >
                        <div className="p-1.5 bg-gray-100 rounded-full text-gray-900"><Settings size={18} /></div>
                        Panel de Control
                      </Link>
                      <button 
                        onClick={cerrarSesion} 
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition mt-2 border-t border-gray-50 pt-3"
                      >
                        <div className="p-1.5 bg-gray-100 rounded-full"><LogOut size={18} /></div>
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Botón de acceso al login para cuando NO hay sesión iniciada */
              <Link to="/login" className="text-gray-900 hover:text-rose-500 transition flex items-center">
                <User size={20} />
              </Link>
            )}
          </div>

          {/* BOTÓN DEL CARRITO */}
          <button onClick={abrirCarrito} className="relative text-gray-900 hover:text-rose-500 transition">
            <ShoppingBag size={20} />
            {cantidadCarrito > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {cantidadCarrito}
              </span>
            )}
          </button>

          {/* MENÚ HAMBURGUESA (MÓVIL) */}
          <button className="text-gray-900 hover:text-rose-500 transition sm:hidden">
            <Menu size={20} />
          </button>

        </div>
      </div>
    </header>
  );
};