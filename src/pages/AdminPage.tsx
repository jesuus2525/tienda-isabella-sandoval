import { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import { Package, PlusCircle, UploadCloud, Search, Edit, Trash2, X, ClipboardList, ShoppingCart } from "lucide-react";

export const AdminPage = () => {
  // Estado para la pestaña activa
  const [tabActiva, setTabActiva] = useState<'inventario' | 'pedidos'>('inventario');

  // Estados para Inventario (CRUD)
  const [productos, setProductos] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  
  // Estados del Formulario de Producto
  const [modoEdicion, setModoEdicion] = useState<any | null>(null);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('10');
  const [tonos, setTonos] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);

  // Estados para Pedidos (Dashboard)
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<any | null>(null);

  useEffect(() => {
    obtenerInventario();
    obtenerPedidos();
  }, []);

  const obtenerInventario = async () => {
    const { data } = await supabase.from('productos').select('*').order('created_at', { ascending: false });
    if (data) setProductos(data);
  };

  const obtenerPedidos = async () => {
    const { data } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });
    if (data) setPedidos(data);
  };

  // Función inteligente de auto-categorización
  const analizarCategoria = (nombreProducto: string) => {
    const nombre = nombreProducto.toLowerCase();
    const palabrasLabios = ['labios','labial', 'gloss', 'brillo', 'tinta', 'bálsamo'];
    const palabrasOjos = ['ojos','sombra', 'paleta', 'pestañina', 'delineador', 'cejas','pestañas','encresador'];
    const palabrasRostro = ['rostro', 'Desmaquillador','base', 'rubor', 'iluminador', 'corrector', 'polvo', 'primer', 'maquillaje', 'facial','Fijador'];
    const palabrasPiel = ['piel','crema', 'serum', 'suero', 'limpiador', 'tónico', 'mascarilla', 'corporal', 'skincare', 'antiedad', 'protector solar', 'protector'];
    const palabrascabello = ['cepillo', 'capilar', 'balaca'];
    if (palabrasLabios.some(palabra => nombre.includes(palabra))) return 'Labios';
    if (palabrasOjos.some(palabra => nombre.includes(palabra))) return 'Ojos';
    if (palabrasRostro.some(palabra => nombre.includes(palabra))) return 'Rostro';
    if (palabrasPiel.some(palabra => nombre.includes(palabra))) return 'Cuidado de la Piel';
    if (palabrascabello.some(palabra => nombre.includes(palabra))) return 'Cabello';
    return 'Otros';
  };

  // Guardar o Actualizar Producto
  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      let urlPublica = modoEdicion ? modoEdicion.imagen : "";

      if (imagen) {
        const rutaArchivo = `catalogo/${Date.now()}.${imagen.name.split('.').pop()}`;
        await supabase.storage.from('productos').upload(rutaArchivo, imagen);
        const { data } = supabase.storage.from('productos').getPublicUrl(rutaArchivo);
        urlPublica = data.publicUrl;
      }

      const arrayTonos = tonos.split(',').map(tono => tono.trim()).filter(tono => tono !== '');
      
      const productoFinal = {
        nombre: nombre,
        precio: Number(precio),
        stock: Number(stock),
        tonos: arrayTonos.length > 0 ? arrayTonos : ['Único'],
        descripcion: descripcion,
        categoria_producto: analizarCategoria(nombre),
        ...(urlPublica && { imagen: urlPublica })
      };

      if (modoEdicion) {
        await supabase.from('productos').update(productoFinal).eq('id', modoEdicion.id);
        alert("Producto actualizado correctamente.");
      } else {
        if (!imagen) return alert("Selecciona una foto para el nuevo producto");
        await supabase.from('productos').insert([productoFinal]);
        alert("Producto creado exitosamente.");
      }

      limpiarFormulario();
      obtenerInventario();
    } catch (error) {
      alert("Hubo un error al guardar.");
    } finally {
      setCargando(false);
    }
  };

  const eliminarProducto = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      await supabase.from('productos').delete().eq('id', id);
      obtenerInventario();
    }
  };

  const cargarParaEdicion = (prod: any) => {
    setModoEdicion(prod);
    setNombre(prod.nombre);
    setPrecio(prod.precio.toString());
    setStock(prod.stock.toString());
    setTonos(prod.tonos.join(', '));
    setDescripcion(prod.descripcion);
    setImagen(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const limpiarFormulario = () => {
    setModoEdicion(null); setNombre(''); setPrecio(''); setStock('10'); setTonos(''); setDescripcion(''); setImagen(null);
  };

  // Gestión de Pedidos
  const cambiarEstadoPedido = async (id: number, nuevoEstado: string) => {
    const { error } = await supabase.from('pedidos').update({ estado: nuevoEstado }).eq('id', id);
    if (error) {
      alert("Error al actualizar el estado del pedido.");
    } else {
      obtenerPedidos();
    }
  };

  const eliminarPedido = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar permanentemente este registro de pedido?")) {
      await supabase.from('pedidos').delete().eq('id', id);
      obtenerPedidos();
    }
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    (p.categoria_producto && p.categoria_producto.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-sans pb-20">
      
      {/* Encabezado */}
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-black text-gray-950 uppercase tracking-tight">Panel de Control</h1>
        <p className="text-xs text-gray-400 mt-1">Gestión administrativa interna de Isabella Sandoval.</p>
      </div>

      {/* Menú de Pestañas (Tabs) */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl max-w-md">
        <button 
          onClick={() => setTabActiva('inventario')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
            tabActiva === 'inventario' ? "bg-white text-gray-950 shadow-sm" : "text-gray-400 hover:text-gray-950"
          }`}
        >
          <Package size={16} /> Inventario
        </button>
        <button 
          onClick={() => setTabActiva('pedidos')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
            tabActiva === 'pedidos' ? "bg-white text-gray-950 shadow-sm" : "text-gray-400 hover:text-gray-950"
          }`}
        >
          <ClipboardList size={16} /> Pedidos Recibidos
        </button>
      </div>

      {/* Renderizado Dinámico de las Pestañas */}
      {tabActiva === 'inventario' ? (
        <div className="space-y-8">
          {/* Formulario */}
          <div className={`bg-white border ${modoEdicion ? 'border-amber-400 shadow-amber-100' : 'border-gray-100'} rounded-2xl p-6 shadow-sm`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${modoEdicion ? 'bg-amber-100 text-amber-600' : 'bg-rose-50 text-rose-500'}`}>
                  {modoEdicion ? <Edit size={20} /> : <PlusCircle size={20} />}
                </div>
                <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">
                  {modoEdicion ? `Editando: ${modoEdicion.nombre}` : "Agregar Nuevo Producto"}
                </h2>
              </div>
              {modoEdicion && (
                <button onClick={limpiarFormulario} className="text-gray-400 hover:text-red-500 flex items-center gap-1 text-xs font-bold uppercase">
                  <X size={16} /> Cancelar Edición
                </button>
              )}
            </div>

            <form onSubmit={guardarProducto} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nombre *</label>
                  <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Nombre del Producto" className="w-full border p-3 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Precio *</label>
                  <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} required placeholder="Precio (COP)" className="w-full border p-3 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Stock *</label>
                  <input type="number" value={stock} onChange={e => setStock(e.target.value)} required placeholder="Stock" className="w-full border p-3 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tonos (Separados por coma)</label>
                  <input type="text" value={tonos} onChange={e => setTonos(e.target.value)} placeholder="Ej. Claro, Medio, Oscuro" className="w-full border p-3 rounded-lg text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Descripción *</label>
                <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} required placeholder="Descripción" rows={2} className="w-full border p-3 rounded-lg text-sm resize-none" />
              </div>
              <div className="border-2 border-dashed p-6 text-center cursor-pointer hover:border-rose-400 relative rounded-xl bg-gray-50/50">
                <UploadCloud size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-xs font-semibold text-gray-600">{imagen ? imagen.name : (modoEdicion ? "Haz clic para cambiar la foto" : "Sube la imagen del producto")}</p>
                <input type="file" onChange={e => setImagen(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
              </div>
              <button type="submit" disabled={cargando} className={`w-full text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest ${modoEdicion ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-900 hover:bg-rose-600'} transition`}>
                {cargando ? "Guardando..." : (modoEdicion ? "Actualizar Producto" : "Subir Producto")}
              </button>
            </form>
          </div>

          {/* Listado de Inventario */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <Package size={20} className="text-rose-500" /> Inventario de Productos
              </h2>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input type="text" placeholder="Buscar por nombre o categoría..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-rose-400 transition" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-900 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Producto</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3 text-right rounded-tr-lg">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productosFiltrados.map(prod => (
                    <tr key={prod.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <img src={prod.imagen} alt="" className="w-10 h-10 rounded-md object-cover border border-gray-200" />
                        <span className="font-bold text-gray-900 text-xs">{prod.nombre}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">{prod.categoria_producto || 'Otros'}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-xs">${prod.precio.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold ${prod.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          {prod.stock} UND
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={() => cargarParaEdicion(prod)} className="p-2 bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-600 rounded-lg transition"><Edit size={14} /></button>
                        <button onClick={() => eliminarProducto(prod.id)} className="p-2 bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Historial de Pedidos */
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 mb-6 flex items-center gap-2">
            <ClipboardList size={20} className="text-rose-500" /> Control de Pedidos Recibidos
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-900 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Referencia</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right rounded-tr-lg">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {pedidos.map(ped => (
                  <tr key={ped.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-bold text-gray-950">{ped.num_ref}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{ped.cliente_nombre || "Anónimo"}</div>
                      <div className="text-[10px] text-gray-400">{ped.direccion_envio}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">${ped.precio_total.toLocaleString('es-CO')}</td>
                    <td className="px-4 py-3">
                      <select 
                        value={ped.estado} 
                        onChange={(e) => cambiarEstadoPedido(ped.id, e.target.value)}
                        className={`font-bold p-1.5 px-2.5 rounded-lg border text-[9px] uppercase outline-none cursor-pointer ${
                          ped.estado === 'Confirmado' ? 'bg-green-50 text-green-700 border-green-200' :
                          ped.estado === 'Enviado' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          ped.estado === 'Cancelado' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="En espera">En espera</option>
                        <option value="Confirmado">Confirmado</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-[10px]">{new Date(ped.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => setPedidoSeleccionado(ped)} className="p-2 bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-500 rounded-lg font-bold uppercase text-[9px] tracking-wider px-3 py-1.5 transition">
                        Ver Detalle
                      </button>
                      <button onClick={() => eliminarPedido(ped.id)} className="p-2 bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition"><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pedidos.length === 0 && (
              <p className="text-center py-8 text-gray-400 text-sm font-bold uppercase">Aún no se han recibido pedidos en la tienda.</p>
            )}
          </div>

          {/* MODAL DETALLE DE COMPRA */}
          {pedidoSeleccionado && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl w-full max-w-lg p-6 relative shadow-2xl">
                <button onClick={() => setPedidoSeleccionado(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition">
                  <X size={18} />
                </button>
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                  <ShoppingCart size={20} className="text-rose-500" />
                  <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm">Resumen de {pedidoSeleccionado.num_ref}</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl mb-4 text-xs space-y-1">
                  <p><span className="font-bold text-gray-400 uppercase text-[9px]">Cliente:</span> {pedidoSeleccionado.cliente_nombre}</p>
                  <p><span className="font-bold text-gray-400 uppercase text-[9px]">Teléfono:</span> {pedidoSeleccionado.cliente_telefono || "No registrado"}</p>
                  <p><span className="font-bold text-gray-400 uppercase text-[9px]">Dirección:</span> {pedidoSeleccionado.direccion_envio}</p>
                </div>
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                  {pedidoSeleccionado.pedido_detallado?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-3">
                        <img src={item.imagen} alt="" className="w-8 h-10 object-cover rounded-md border border-gray-100" />
                        <div>
                          <p className="font-bold text-gray-900 uppercase text-[11px] truncate w-44">{item.nombre}</p>
                          <p className="text-[9px] text-gray-400 uppercase font-semibold">Tono: {item.tonoSeleccionado}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{item.cantidad}x</p>
                        <p className="text-[10px] text-gray-400">${(item.precio * item.cantidad).toLocaleString('es-CO')}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between items-center">
                  <span className="font-bold text-gray-500 text-xs">Total del Pedido</span>
                  <span className="font-black text-gray-950 text-base">${pedidoSeleccionado.precio_total.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};