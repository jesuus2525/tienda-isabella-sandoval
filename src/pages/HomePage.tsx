import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { ShoppingBag, X, ShoppingCart } from "lucide-react";
import { supabase } from "../supabase/client";
import { useTheme } from "../context/ThemeContext";
import { useSearchParams } from "react-router-dom"; // <-- Agrega esto a tus importaciones


// Listado de conectores y palabras vacías a ignorar en la búsqueda
const CONECTORES = new Set([
  "de", "del", "la", "el", "los", "las", "un", "una", "unos", "unas", 
  "y", "o", "en", "con", "para", "por", "a", "al", "se", "su", "sus"
]); 
export const HomePage = () => {
  const { agregarAlCarrito } = useOutletContext<any>();
  const { config } = useTheme();
  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [tonosSeleccionados, setTonosSeleccionados] = useState<{ [key: number]: string }>({});
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [searchParams] = useSearchParams(); // <-- 1. Captura la URL
  const terminoBusqueda = searchParams.get("buscar")?.toLowerCase() || ""; // <-- 2. Lee la palabra
  
  // NUEVO: Estado para controlar el Modal del producto
  const [productoModal, setProductoModal] = useState<any | null>(null);
  // 👇 NUEVOS ESTADOS PARA COMPRA DIRECTA 👇
  const [compraDirecta, setCompraDirecta] = useState<{producto: any, tono: string} | null>(null);
  const [datosCliente, setDatosCliente] = useState({ nombre: '', telefono: '', direccion: '' });
  const [cargandoCompra, setCargandoCompra] = useState(false);
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
  // 1. Extraemos y limpiamos las palabras clave (eliminando conectores)
  const palabrasClave = terminoBusqueda
    .trim()
    .split(/\s+/) // Separa por espacios
    .filter((palabra) => palabra.length > 1 && !CONECTORES.has(palabra));
  // 3. Modifica tu filtro actual para que dé prioridad a la búsqueda
  // 2. Filtrado e indexación por relevancia
  const productosFiltrados = productos
    .map((prod) => {
      if (palabrasClave.length === 0) return { prod, coincidencia: 1 };

      const textoBuscable = `${prod.nombre} ${prod.descripcion || ""} ${prod.categoria_producto || ""}`.toLowerCase();

      // Cuenta cuántas palabras clave coinciden con el producto
      const coincidencias = palabrasClave.reduce((acc, palabra) => {
        return acc + (textoBuscable.includes(palabra) ? 1 : 0);
      }, 0);

      return { prod, coincidencia: coincidencias };
    })
    .filter((item) => {
      // Si hay búsqueda, solo muestra si coincide al menos con 1 palabra
      if (palabrasClave.length > 0) return item.coincidencia > 0;

      // Si no hay búsqueda, aplica el filtro de categoría normal
      if (categoriaActiva === "Todos") return true;
      return item.prod.categoria_producto === categoriaActiva;
    })
    // Ordena los productos para que aparezcan primero los que coinciden con más palabras
    .sort((a, b) => b.coincidencia - a.coincidencia)
    .map((item) => item.prod);

    /* este es el filtro de productos filtrados */

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
     
    // 👇 1. Aplicamos el color de fondo general a toda la página
    <div style={{ backgroundColor: config.colorFondoCatalogo || config.colorFondoCatalogo, minHeight: '100vh' }} className="pb-12 pt-6 transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto px-4 space-y-12 relative">
    
      
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h2 className="text-xs uppercase font-bold tracking-widest text-violet-600">Colección Exclusiva</h2>
        <h1 className="text-3xl font-black text-violet-800 tracking-tight uppercase sm:text-4xl">
          Realza tu Belleza Natural
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
{/* cantidad de productos por fila*/}
{productosFiltrados.length > 0 || terminoBusqueda == "" ? (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
        
        {productosFiltrados.map((prod) =>{
          
          // 👇 AQUÍ DEBE IR LA CONSTANTE, DENTRO DEL MAP 👇
          const tonoActual = tonosSeleccionados[prod.id];
          
          return ( (
          
          <div key={prod.id} className="bg-white flex flex-col group border border-gray-100 rounded-2xl p-2 hover:shadow-xl transition-all duration-300 relative">
              
              {/* 1. LA IMAGEN ABRE EL MODAL ("Ver Detalles") */}
              <div 
                className="relative overflow-hidden aspect-[4/5] bg-gray-50 rounded-xl mb-4 cursor-pointer" 
                onClick={() => setProductoModal(prod)}
              >
                <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider transition shadow-sm">
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
                 // Cambiamos justify-end por justify-center y text-xs por text-[10px]
                  className="mt-5 w-full bg-gray-400 text-white py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-600 transition"
                  >
                           {/* Redujimos el tamaño del icono de 20 a 16 */}
                           <span>  </span>
                           <ShoppingCart size={20} />
                        <span>Añadir al Carrito  </span>
                        <span> </span>
                  </button>

                  <button
  onClick={() => {
    // 1. Aquí no necesitamos el escudo, pasamos directamente 'prod' y 'tonoActual'
    setCompraDirecta({ 
      producto: prod, 
      tono: tonoActual 
    });
  }}
  className="mt-2 w-full bg-rose-500 text-white py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-600 transition shadow-md shadow-rose-200"
>
  <ShoppingBag size={16} />
  <span>Comprar ahora</span>
</button>
                      
              </div>

            </div>
        )) })}
      </div> 

) : (
  // 👇 ESTE ES EL MENSAJE DE "NO ENCONTRADO" 👇
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center w-full">
    {/* Puedes usar el icono de SearchX de lucide-react si lo importas arriba */}
    <div className="bg-gray-100 p-4 rounded-full mb-4">
      <X size={32} className="text-gray-400" />
    </div>
    
    <h3 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">
      No hay resultados
    </h3>
    
    <p className="text-sm font-medium text-gray-500 max-w-md mx-auto">
      {terminoBusqueda 
        ? `No pudimos encontrar coincidencias para "${terminoBusqueda}". Intenta comprobando la ortografía o buscando con términos más generales.` 
        : `En este momento no tenemos productos disponibles en la categoría "${categoriaActiva}".`
      }
    </p>
  </div>
)}

      {/* MODAL DE VISTA PREVIA DETALLADA POR PRODUCTO */}
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
                    className="mt-5 w-full bg-gray-400 text-white py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-widest flex flex-row items-center justify-center hover:bg-rose-600 transition"
                  >
                    <ShoppingCart size={16} className="shrink-0 mr-2" />
                  <span>Añadir al Carrito</span>
                </button>
                <button
  onClick={() => {
    // 1. Aquí no necesitamos el escudo, pasamos directamente 'prod' y 'tonoActual'
    setCompraDirecta({ 
      producto: productoModal, 
      tono: tonosSeleccionados[productoModal.id] 
    });
  }}
  className="mt-2 w-full bg-rose-500 text-white py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-600 transition shadow-md shadow-rose-200"
>
  <ShoppingBag size={16} />
  <span>Comprar ahora</span>
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
      )} {/* MODAL DE COMPRA DIRECTA (CHECKOUT EXPRESS) */}
      {compraDirecta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fade-in-up p-6 md:p-8">
            
            {/* Botón Cerrar (Se mantiene igual) */}
            <button 
              onClick={() => setCompraDirecta(null)} 
              className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-rose-100 hover:text-rose-600 shadow-sm"
            >
              <X size={16} />
              Seguir viendo
            </button>

            {/* 👇 TÍTULO: Le agregamos mt-10 para bajarlo y evitar el choque 👇 */}
            <div className="text-center mb-6 mt-10">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Compra Rápida</h2>
              <p className="text-xs text-gray-500 mt-1">Completa tus datos para coordinar el envío</p>
            </div>

            {/* Resumen del Producto */}
            {/* Resumen del Producto (Ahora es interactivo) */}
            <div 
              onClick={() => {
                setCompraDirecta(null); // 1. Cerramos la ventana de compra rápida
                setProductoModal(compraDirecta.producto); // 2. Abrimos los detalles completos
              }}
              className="flex gap-4 items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6 cursor-pointer hover:bg-gray-100 hover:shadow-md transition-all group"
            >
              <div className="relative overflow-hidden w-16 h-16 rounded-xl shrink-0">
                <img 
                  src={compraDirecta.producto.imagen} 
                  alt={compraDirecta.producto.nombre} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-wider transition shadow-sm">
                    Ver
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase text-gray-900 group-hover:text-rose-500 transition-colors">{compraDirecta.producto.nombre}</h3>
                <p className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">Tono: {compraDirecta.tono || 'Único'}</p>
                <p className="font-black text-rose-500 text-sm mt-1">${compraDirecta.producto.precio.toLocaleString('es-CO')}</p>
              </div>
            </div>

            {/* Formulario de Datos */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={datosCliente.nombre}
                  onChange={(e) => setDatosCliente({...datosCliente, nombre: e.target.value})}
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition"
                  placeholder="Ej: María Pérez"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Teléfono (WhatsApp)</label>
                <input 
                  type="tel" 
                  value={datosCliente.telefono}
                  onChange={(e) => setDatosCliente({...datosCliente, telefono: e.target.value})}
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition"
                  placeholder="Ej: 300 123 4567"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Dirección de Envío</label>
                <input 
                  type="text" 
                  value={datosCliente.direccion}
                  onChange={(e) => setDatosCliente({...datosCliente, direccion: e.target.value})}
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition"
                  placeholder="Ej: Calle 123 # 45-67, Barrio X"
                />
              </div>
            </div>

            {/* Mensaje de Aviso */}
            <div className="mt-6 bg-blue-50 text-blue-800 p-3.5 rounded-xl border border-blue-100 text-[10px] text-center font-medium leading-relaxed">
              Al confirmar, se abrirá WhatsApp. <strong>Pronto un asesor te contactará</strong> para confirmar el pago y entregar tu envío.
            </div>

           

{/* Botón Enviar con conexión a BD */}
            <button
              onClick={async () => {
                
                
                if(!datosCliente.nombre || !datosCliente.telefono || !datosCliente.direccion) {
                  alert("Por favor, completa todos los campos para poder realizar el envío.");
                  return;
                }

                setCargandoCompra(true);
                const numRef = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

                try {
                  // 1. Guardar en Supabase simulando la estructura del carrito
                  const { error } = await supabase.from("pedidos").insert([
                    {
                      num_ref: numRef,
                      // Convertimos el producto en un arreglo para que la BD lo lea igual que un carrito
                      pedido_detallado: [{
                        ...compraDirecta.producto,
                        cantidad: 1,
                        tonoSeleccionado: compraDirecta.tono || 'Único'
                      }],
                      precio_total: compraDirecta.producto.precio,
                      cliente_nombre: datosCliente.nombre,
                      cliente_telefono: datosCliente.telefono,
                      direccion_envio: datosCliente.direccion,
                      estado: "En espera",
                    },
                  ]);

                  if (error) throw error;

                  // 2. Formatear mensaje de WhatsApp con la referencia
                  const numeroAdmin = "573012970476"; // <--- RECUERDA CAMBIAR ESTE NÚMERO
                  const mensaje = `¡Hola! Quiero hacer una compra directa. \n\n` +
                                  ` *Referencia:* ${numRef}\n` +
                                  `*Producto:* ${compraDirecta.producto.nombre}\n` +
                                  `*Tono:* ${compraDirecta.tono || 'Único'}\n` +
                                  `*Total a Pagar:* $${compraDirecta.producto.precio.toLocaleString('es-CO')}\n\n` +
                                  `📍 *Mis Datos para Envío:*\n` +
                                  `- Nombre: ${datosCliente.nombre}\n` +
                                  `- Teléfono: ${datosCliente.telefono}\n` +
                                  `- Dirección: ${datosCliente.direccion}\n\n` +
                                  `Quedo atento(a) para confirmar detalles y pago.`;
                  
                  // 3. Abrir WhatsApp, limpiar el formulario y cerrar el modal
                  window.open(`https://wa.me/${numeroAdmin}?text=${encodeURIComponent(mensaje)}`, '_blank');
                  setDatosCliente({ nombre: '', telefono: '', direccion: '' });
                  setCompraDirecta(null); 
                  
                } catch (err) {
                  alert("Hubo un error al registrar el pedido. Intenta nuevamente.");
                } finally {
                  setCargandoCompra(false);
                }
              }}
              disabled={cargandoCompra}
              className="mt-4 w-full bg-rose-500 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition shadow-lg shadow-emerald-200 disabled:bg-gray-400"
            >
              {cargandoCompra ? "Registrando..." : "Confirmar Pedido y Abrir WhatsApp"}
            </button>
           

            
          </div>
        </div>
      )}
    </div>
  );
  </div>
)};
