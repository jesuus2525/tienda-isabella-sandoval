import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { ShoppingBag, X } from "lucide-react";
import { supabase } from "../supabase/client";

export const HomePage = () => {
  const { agregarAlCarrito } = useOutletContext<any>();
  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [tonosSeleccionados, setTonosSeleccionados] = useState<{ [key: number]: string }>({});
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  
  // NUEVO: Estado para controlar el Modal del producto
  const [productoModal, setProductoModal] = useState<any | null>(null);

  useEffect(() => {
    const obtenerProductos = async () => {
      const { data } = await supabase.from("productos").select("*");
      if (data) {
        setProductos(data);
        const tonosIniciales = data.reduce((acc, prod) => ({ ...acc, [prod.id]: prod.tonos[0] }), {});
        setTonosSeleccionados(tonosIniciales);
      }
      setCargando(false);
    };
    obtenerProductos();
  }, []);

  const cambiarTono = (productoId: number, tono: string) => {
    setTonosSeleccionados({ ...tonosSeleccionados, [productoId]: tono });
  };

  // Extraemos las categorías únicas de la base de datos
  const categoriasExtraidas = [...new Set(productos.map(p => p.categoria_producto || 'Otros'))];
  
  // Reorganizamos: 'Todos' primero, luego el resto, y 'Otros' siempre al final
  const categoriasDisponibles = [
    'Todos', 
    ...categoriasExtraidas.filter(cat => cat !== 'Otros'), 
    ...(categoriasExtraidas.includes('Otros') ? ['Otros'] : [])
  ];
  const productosFiltrados = categoriaActiva === 'Todos' 
    ? productos 
    : productos.filter(p => (p.categoria_producto || 'Otros') === categoriaActiva);

  // Filtramos recomendaciones (Misma categoría, excluyendo el producto actual, máximo 4)
  const productosRecomendados = productoModal 
    ? productos.filter(p => p.categoria_producto === productoModal.categoria_producto && p.id !== productoModal.id).slice(0, 4)
    : [];

  if (cargando) return (
    <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-rose-500 rounded-full animate-spin"></div>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Cargando catálogo...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-12 relative">
      
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h2 className="text-xs uppercase font-bold tracking-widest text-violet-300">Colección Exclusiva</h2>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase sm:text-4xl">
          Realza tu Belleza <span className="font-light text-gray-500">Natural</span>
        </h1>
      </div>

     {/* Menú de Categorías (Filtros) */}
      <div className="flex overflow-x-auto gap-2 pb-4 justify-start md:justify-center scrollbar-hide px-2">
        {categoriasDisponibles.map((cat) => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)}
            className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
              categoriaActiva === cat ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-900"
            }`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
        {productosFiltrados.map((prod) =>{
          
          // 👇 AQUÍ DEBE IR LA CONSTANTE, DENTRO DEL MAP 👇
          const tonoActual = tonosSeleccionados[prod.id];
          
          return ( (
          
          <div key={prod.id} className="bg-white flex flex-col group border border-gray-100 rounded-2xl p-4 hover:shadow-xl transition-all duration-300 relative">
              
              {/* 1. LA IMAGEN ABRE EL MODAL ("Ver Detalles") */}
              <div 
                className="relative overflow-hidden aspect-[4/5] bg-gray-50 rounded-xl mb-4 cursor-pointer" 
                onClick={() => setProductoModal(prod)}
              >
                <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider transition shadow-sm">
                    Ver Detalles
                  </span>
                </div>
              </div>

              {/* 2. EL RESTO DE LA TARJETA MANTIENE EL AÑADIR AL CARRITO */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">{prod.categoria_producto}</span>
                  <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mt-1">{prod.nombre}</h3>
                  <p className="text-lg font-black text-gray-900 mt-1">${prod.precio.toLocaleString('es-CO')}</p>
                  
                  {/* Selectores de Tono Interactivos */}
                  <div className="mt-3 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Variación de Tono:</label>
                    <div className="flex flex-wrap gap-1.5">
                      
                      {
                      prod.tonos.map((tono: string) => (
                        <button key={tono} onClick={() => cambiarTono(prod.id, tono)}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase transition tracking-wider border ${
                            
                            tonoActual === tono 
                              ? "bg-gray-900 text-white border-gray-900 shadow-sm" 
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          {tono}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => agregarAlCarrito(prod, tonoActual)}
                  className="mt-5 w-full bg-gray-950 text-white py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-600 transition"
                >
                  <ShoppingBag size={10} />
                  Añadir al Carrito
                </button>
              </div>

            </div>
        ))})}
      </div>

      {/* MODAL ESTILO JULIETA MAKEUP */}
      {productoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fade-in-up">
            
            <button onClick={() => setProductoModal(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-rose-100 hover:text-rose-600 transition z-10">
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
              <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
                <img src={productoModal.imagen} alt={productoModal.nombre} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex flex-col justify-center space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-rose-500">{productoModal.categoria_producto}</span>
                  <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mt-2">{productoModal.nombre}</h2>
                  <p className="text-2xl font-light text-gray-600 mt-2">${productoModal.precio.toLocaleString('es-CO')}</p>
                </div>
                
                <p className="text-sm text-gray-500 leading-relaxed">{productoModal.descripcion}</p>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Selecciona tu tono:</label>
                  <div className="flex flex-wrap gap-2">
                    {productoModal.tonos.map((tono: string) => (
                      <button key={tono} onClick={(e) => { e.stopPropagation(); cambiarTono(productoModal.id, tono); }}
                        className={`text-xs font-bold px-4 py-2 rounded-lg uppercase transition border ${
                          tonosSeleccionados[productoModal.id] === tono 
                            ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-900"
                        }`}>
                        {tono}
                      </button>
                    ))}
                  </div>
                </div>

                  <button
                    onClick={() => {
                      agregarAlCarrito(productoModal, tonosSeleccionados[productoModal.id]);
                      setProductoModal(null); // Cierra el modal tras agregar
                    }}
                    className="mt-5 w-full bg-gray-950 text-white py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-widest flex flex-row items-center justify-center hover:bg-rose-600 transition"
                  >
                    <ShoppingBag size={16} className="shrink-0 mr-2" />
                  <span>Añadir al Carrito</span>
                </button>
                </div>
              </div>

            {/* SECCIÓN: TAMBIÉN TE PUEDE INTERESAR */}
            {productosRecomendados.length > 0 && (
              <div className="bg-gray-50 p-6 md:p-10 border-t border-gray-100">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-6 text-center">También te puede interesar</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {productosRecomendados.map(rec => (
                    <div key={rec.id} onClick={() => setProductoModal(rec)} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition">
                      <img src={rec.imagen} className="w-full aspect-square object-cover rounded-lg mb-3" />
                      <h4 className="text-[10px] font-bold uppercase text-gray-900 truncate">{rec.nombre}</h4>
                      <p className="text-xs text-rose-500 font-semibold mt-1">${rec.precio.toLocaleString('es-CO')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
