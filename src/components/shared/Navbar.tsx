import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, Search, Menu, User } from "lucide-react";

interface NavbarProps {
  cantidadCarrito: number;
  abrirCarrito: () => void;
}

export const Navbar = ({ cantidadCarrito, abrirCarrito }: NavbarProps) => {
  return (
    <header className="bg-white text-gray-900 sticky top-0 z-40 border-b border-gray-100 backdrop-blur-md bg-white/90">
      <div className="container mx-auto h-20 px-4 flex items-center justify-between lg:px-8">
        
        {/* Identidad de Marca */}
        <div className="flex items-center">
          <Link to="/" className="text-xl font-black tracking-widest text-gray-900 uppercase">
            ISABELLA <span className="text-rose-500 font-light">SANDOVAL</span>
          </Link>
        </div>

        {/* Enlaces de Navegación del Enrutador */}
        <nav className="hidden md:flex space-x-8 text-xs font-semibold uppercase tracking-widest">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? "text-rose-500 border-b-2 border-rose-500 pb-1" : "text-gray-600 hover:text-rose-500 transition-colors pb-1"}
          >
            Catálogo
          </NavLink>
          <NavLink 
            to="/sobre-nosotros" 
            className={({ isActive }) => isActive ? "text-rose-500 border-b-2 border-rose-500 pb-1" : "text-gray-600 hover:text-rose-500 transition-colors pb-1"}
          >
            Nuestra Esencia
          </NavLink>
        </nav>

        {/* Panel de Interacciones */}
        <div className="flex gap-6 items-center">
          <button className="text-gray-600 hover:text-rose-500 transition-colors">
            <Search size={20} />
          </button>
          
          <Link to="/admin" className="text-gray-600 hover:text-rose-500 transition-colors">
            <User size={20} />
          </Link>

          {/* Accionador del Carrito Flotante */}
          <button className="relative text-gray-900 hover:text-rose-500 transition-colors" onClick={abrirCarrito}>
            {cantidadCarrito > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {cantidadCarrito}
              </span>
            )}
            <ShoppingBag size={22} />
          </button>
          
          <button className="md:hidden text-gray-900">
            <Menu size={22} />
          </button>
        </div>

      </div>
    </header>
  );
};