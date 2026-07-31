import { Link } from "react-router-dom";
import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";

export const Footer = () => {

  const irArriba = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // "smooth" para desplazamiento suave, o "auto" para salto instantáneo
    });
  };
  return (
    <footer className="bg-gray-950 text-slate-200 py-16 px-5 md:px-12 mt-10 font-sans">
      <div className="container mx-auto flex flex-wrap justify-between gap-8 md:flex-nowrap">
        
        {/* Sección 1: Marca y Boletín */}
        <div className="flex-1 min-w-[250px] flex flex-col gap-4">
          <Link to="/" onClick={irArriba} className="text-2xl font-bold text-white tracking-wider">
            ISABELLA <span className="text-violet-300 font-light">SANDOVAL</span>
          </Link>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Suscríbete a nuestro boletín
          </p>
          <p className="text-xs text-slate-400 -mt-2">
            Recibe promociones exclusivas y las últimas novedades.
          </p>
          
          {/* Input de correo */}
          <div className="border border-gray-800 flex items-center gap-2 p-2 rounded-full bg-gray-950 max-w-sm">
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              className="pl-3 bg-transparent text-slate-200 text-sm focus:outline-none w-full"
            />
            <button className="text-slate-200 hover:text-cyan-500 transition-colors">
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Sección 2: Navegación y Políticas */}
        <div className="flex-1 min-w-[200px] flex flex-col gap-4">
          <p className="font-semibold uppercase tracking-wider text-white text-sm">Políticas</p>
          <nav className="flex flex-col gap-2 text-xs font-medium">
            <Link to="" className="text-slate-400 hover:text-white transition-colors">Productos</Link>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Políticas de Privacidad</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Términos de Uso</a>
          </nav>
        </div>

        {/* Sección 3: Redes Sociales (Minuto 46:00) */}
        <div className="flex-1 min-w-[200px] flex flex-col gap-4">
          <p className="font-semibold uppercase tracking-wider text-white text-sm">Síguenos</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            No te pierdas ninguna de las tendencias y novedades que tenemos para ti.
          </p>
          <div className="flex gap-3">
            <a href="https://www.instagram.com/isa.s.anaya?igsh=Z3ZjemJuenY5ZmRi" target="_blank" rel="noreferrer" className="border border-gray-800 p-2.5 rounded-full hover:bg-white hover:text-gray-950 transition-all duration-300">
              <FaInstagram size={18} />
            </a>
            <a href="https://www.tiktok.com/@paolavelandia76?_r=1&_t=ZS-988YVtdjWVg" target="_blank" rel="noreferrer" className="border border-gray-800 p-2.5 rounded-full hover:bg-white hover:text-gray-950 transition-all duration-300">
              <FaTiktok size={18} />
            </a>
            <a href="https://wa.me/+573012970476?text=Hola%20estoy%20interesad@%20en%20tus%20productos%20amiga" target="_blank" rel="noreferrer" className="border border-gray-800 p-2.5 rounded-full hover:bg-white hover:text-gray-950 transition-all duration-300">
              <FaWhatsapp size={18} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
