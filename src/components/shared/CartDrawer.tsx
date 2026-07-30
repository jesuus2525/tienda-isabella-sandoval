import { useState, useEffect } from "react";
import { Trash2, Send, Plus, Minus ,ShoppingCart} from "lucide-react";
import { supabase } from "../../supabase/client"; // Asegúrate de que la ruta sea correcta
import { useNotification } from "../../context/NotificationContext";
interface CartDrawerProps {
  carrito: any[];
  setCarrito: any; // Se requiere para poder agregar sugerencias desde el drawer
  isCarritoAbierto: boolean;
  cerrarCarrito: () => void;
}



export const CartDrawer = ({ carrito, setCarrito, isCarritoAbierto, cerrarCarrito }: CartDrawerProps) => {
  const [recomendados, setRecomendados] = useState<any[]>([]);
  const [nombreCliente, setNombreCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [direccionEnvio, setDireccionEnvio] = useState("");
  const [cargando, setCargando] = useState(false);
  const [toast, setToast] = useState<{ mensaje: string; tipo: 'exito' | 'error' } | null>(null);
  const { notify } = useNotification();
  const mostrarNotificacion = (mensaje: string, tipo: 'exito' | 'error' = 'exito') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAccionEjemplo = () => {
    // Ejemplo de uso al realizar una acción exitosa
    mostrarNotificacion("¡Producto guardado con éxito!", "exito");
  };

  const handleAccionError = () => {
    // Ejemplo de uso al ocurrir un error
    mostrarNotificacion("Hubo un error al procesar la solicitud", "error");
  };

  // 1. Calcular el total
  const totalCarrito = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  // 2. Obtener sugerencias de la BD cuando se abre el carrito
  useEffect(() => {
    const obtenerRecomendados = async () => {
      const { data } = await supabase.from("productos").select("*").limit(8);
      if (data) setRecomendados(data);
    };
    if (isCarritoAbierto) obtenerRecomendados();
  }, [isCarritoAbierto]);

  // Filtrar sugerencias que no estén ya en el carrito
  const idsEnCarrito = carrito.map((item) => item.id);
  const sugerenciasFiltradas = recomendados.filter((prod) => !idsEnCarrito.includes(prod.id)).slice(0, 3);

  // 3. Funciones del carrito
  const modificarCantidad = (idCarrito: string, cambio: number) => {
    setCarrito(
      carrito.map((item) => {
        if (item.idCarrito === idCarrito) {
          const nuevaCantidad = item.cantidad + cambio;
          return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : item;
        }
        return item;
      })
    );
  };

  const eliminarDelCarrito = (idCarrito: string) => {
    setCarrito(carrito.filter((item) => item.idCarrito !== idCarrito));
  };

  // 4. Procesar el Pedido (Guardar en BD y abrir WhatsApp)
  const finalizarPedido = async () => 
    {
    if (carrito.length === 0) {
      notify({ title: 'Carrito vacío', message: 'Agrega productos antes de continuar.', type: 'info' });
      return;
    }
    if (!nombreCliente.trim() || !telefonoCliente.trim() || !direccionEnvio.trim()) {
      notify({ title: 'Falta información', message: 'Completa tu nombre, teléfono y dirección de envío.', type: 'warning' });
      return;
    }

    setCargando(true);
  };

  return (
    
    <>
      {isCarritoAbierto && <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity" onClick={cerrarCarrito} />}

      <aside className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${isCarritoAbierto ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
  <h2 className="text-base font-bold text-gray-900 tracking-wider uppercase">Tu Pedido ({carrito.length})</h2>
  
  <button 
    onClick={cerrarCarrito} 
    className="px-4 py-2 text-[10px] font-bold text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-full uppercase tracking-widest transition-all border border-transparent"
  >
    Seguir comprando X
  </button>
</div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {carrito.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
              <ShoppingCart size={40} className="text-gray-200" />
              <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">El carrito está vacío</p>
            </div>
          ) : (
            <>
              {carrito.map((item) => (
                <div key={item.idCarrito} className="flex gap-4 items-center p-3 border border-gray-100 rounded-xl hover:shadow-sm transition bg-white">
                  <div className="w-16 h-20 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                    <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wide">{item.nombre}</h4>
                    {item.tonoSeleccionado && (
                      <span className="inline-block mt-1 text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">
                        Tono: {item.tonoSeleccionado}
                      </span>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-0.5 bg-gray-50">
                        <button onClick={() => modificarCantidad(item.idCarrito, -1)} className="p-1 hover:bg-white rounded-md"><Minus size={12} /></button>
                        <span className="text-xs font-bold w-4 text-center">{item.cantidad}</span>
                        <button onClick={() => modificarCantidad(item.idCarrito, 1)} className="p-1 hover:bg-white rounded-md"><Plus size={12} /></button>
                      </div>
                      <p className="text-sm font-extrabold text-rose-600">
                        ${(item.precio * item.cantidad).toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => eliminarDelCarrito(item.idCarrito)} className="text-gray-300 hover:text-red-500 p-2 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {/* SECCIÓN DE SUGERENCIAS */}
              {sugerenciasFiltradas.length > 0 && (
                <div className="pt-6 pb-2 space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">¿Te falta algo?</h3>
                  {sugerenciasFiltradas.map((sug) => (
                    <div key={sug.id} className="flex items-center justify-between border border-gray-100 p-2.5 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <img src={sug.imagen} className="w-10 h-10 object-cover rounded-md bg-white border border-gray-100" />
                        <div>
                          <h4 className="text-[10px] font-bold uppercase text-gray-900 truncate w-32">{sug.nombre}</h4>
                          <p className="text-[10px] text-rose-500 font-bold">${sug.precio.toLocaleString('es-CO')}</p>
                        </div>
                      </div>
                      <button onClick={() => setCarrito([...carrito, { ...sug, idCarrito: `${sug.id}-${sug.tonos[0]}`, tonoSeleccionado: sug.tonos[0], cantidad: 1 }])}
                        className="text-[10px] bg-gray-900 text-white font-bold uppercase px-3 py-1.5 rounded-lg hover:bg-rose-600 transition">
                        Añadir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Checkout y Formulario */}
        {carrito.length > 0 && (
          <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] z-10">
            <div className="space-y-2 bg-white p-4 rounded-xl border border-gray-500 shadow-sm">
              <input type="text" placeholder="Tu Nombre Completo" value={nombreCliente} onChange={e => setNombreCliente(e.target.value)}
                className="w-full border border-gray-400 rounded-lg p-2.5 text-xs focus:outline-none focus:border-rose-400 bg-gray-50" />
              <input type="number" placeholder="Teléfono" value={telefonoCliente} onChange={e => setTelefonoCliente(e.target.value)}
                className="w-full border border-gray-400 rounded-lg p-2.5 text-xs focus:outline-none focus:border-rose-400 bg-gray-50" />
              <input type="text" placeholder="Dirección de Envío" value={direccionEnvio} onChange={e => setDireccionEnvio(e.target.value)}
                className="w-full border border-gray-400 rounded-lg p-2.5 text-xs focus:outline-none focus:border-rose-400 bg-gray-50" />
            </div>

            <div className="flex justify-between items-end px-1">
              <span className="text-xs text-gray-600 font-bold uppercase tracking-wider">Subtotal</span>
              <span className="text-xl font-black text-gray-900">${totalCarrito.toLocaleString('es-CO')}</span>
            </div>
            
            <button onClick={finalizarPedido}  disabled={cargando}
              className="w-full bg-emerald-600 text-white py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 rounded-xl disabled:bg-gray-300">
              <Send size={16} /> {cargando ? "Registrando..." : "Generar Pedido y Abrir WhatsApp"}

              
            </button>

            
          </div>
        )}
      </aside>
    </>
  );
};
