import { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import { useTheme } from "../context/ThemeContext";
import { 
  Package, PlusCircle, UploadCloud, Search, Edit, Trash2, X, 
  ClipboardList, LayoutDashboard, Palette, LogOut, CheckCircle2, 
  AlertCircle, Eye, ArrowUpDown, Image as ImageIcon, Link as LinkIcon ,ShoppingCart
} from "lucide-react";

export const AdminPage = () => {
  const { config, actualizarConfig } = useTheme();
  const [tabActiva, setTabActiva] = useState<'dashboard' | 'inventario' | 'pedidos' | 'personalizacion'>('dashboard');
  const [toast, setToast] = useState<{ mensaje: string; tipo: 'exito' | 'error' } | null>(null);

  const mostrarNotificacion = (mensaje: string, tipo: 'exito' | 'error' = 'exito') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  // Estados Inventario
  const [productos, setProductos] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [ordenCampo, setOrdenCampo] = useState<'nombre' | 'precio' | 'stock' | 'categoria_producto'>('nombre');
  const [ordenDireccion, setOrdenDireccion] = useState<'asc' | 'desc'>('asc');
  const [cargando, setCargando] = useState(false);

  // Formulario Producto
  const [modoEdicion, setModoEdicion] = useState<any | null>(null);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('10');
  const [tonos, setTonos] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenArchivo, setImagenArchivo] = useState<File | null>(null);
  const [imagenPrevisualizacion, setImagenPrevisualizacion] = useState<string | null>(null);

  // Modal para Vista Previa / Banner de Producto
  const [productoModal, setProductoModal] = useState<any | null>(null);

  // Estados Pedidos
  const [pedidos, setPedidos] = useState<any[]>([]);
  // Estados Pedidos

  
  // 👇 AGREGA ESTA LÍNEA QUE FALTABA 👇
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<any | null>(null);

  // Estados Personalización
  const [nombreTiendaInput, setNombreTiendaInput] = useState(config.nombreTienda);
  const [esloganInput, setEsloganInput] = useState(config.eslogan);
  const [colorPrimarioInput, setColorPrimarioInput] = useState(config.colorPrimario);
  const [colorTextoNombreInput, setColorTextoNombreInput] = useState(config.colorTextoNombre || "#111827");
  const [colorFondoPagina_admInput, setcolorFondoPagina_admInput] = useState(config.colorFondoPagina_adm || "#ffffff");
  const [colorFondoCatalogoInput, setColorFondoCatalogoInput] = useState(config.colorFondoCatalogo || "#ffffff");
  const [colorFondoTarjetaInput, setColorFondoTarjetaInput] = useState(config.colorFondoTarjeta || "#ffffff");
  const [textoAnuncioInput, setTextoAnuncioInput] = useState(config.textoAnuncio);
  const [nuevoBannerUrl, setNuevoBannerUrl] = useState("");
  const [cargandoPersonalizacion, setCargandoPersonalizacion] = useState(false);

  useEffect(() => {
    obtenerInventario();
    obtenerPedidos();
  }, []);

  const obtenerInventario = async () => {
    const { data } = await supabase.from("productos").select("*");
    if (data) setProductos(data);
  };

  const obtenerPedidos = async () => {
    const { data } = await supabase.from("pedidos").select("*").order("created_at", { ascending: false });
    if (data) setPedidos(data);
  };

  const manejarSeleccionImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagenArchivo(file);
      setImagenPrevisualizacion(URL.createObjectURL(file));
    }
  };

  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !precio) return mostrarNotificacion("Completa nombre y precio", "error");
    setCargando(true);
    try {
      let imagenUrl = modoEdicion ? modoEdicion.imagen : "";
      if (imagenArchivo) {
        const filePath = `catalogo/${Date.now()}.${imagenArchivo.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('productos').upload(filePath, imagenArchivo);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('productos').getPublicUrl(filePath);
        imagenUrl = data.publicUrl;
      }

      const arregloTonos = tonos ? tonos.split(',').map(t => t.trim()) : ["Único"];
      const categoriaCalculada = analizarCategoria(nombre);

      const payload = {
        nombre: nombre.toUpperCase(),
        precio: parseFloat(precio),
        stock: parseInt(stock) || 0,
        tonos: arregloTonos,
        descripcion,
        categoria_producto: categoriaCalculada,
        imagen: imagenUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600"
      };

      if (modoEdicion) {
        await supabase.from("productos").update(payload).eq("id", modoEdicion.id);
        mostrarNotificacion("Producto actualizado con éxito");
      } else {
        await supabase.from("productos").insert([payload]);
        mostrarNotificacion("Producto creado con éxito");
      }

      limpiarFormulario();
      obtenerInventario();
    } catch (err: any) {
      mostrarNotificacion("Error al procesar el producto", "error");
    } finally {
      setCargando(false);
    }
  };

  const analizarCategoria = (nombreProd: string): string => {
    const n = nombreProd.toLowerCase();
    if (n.includes("labial") || n.includes("gloss") || n.includes("brillo")) return "Labios";
    if (n.includes("sombra") || n.includes("pestañina") || n.includes("delineador")) return "Ojos";
    if (n.includes("base") || n.includes("rubor") || n.includes("polvo")) return "Rostro";
    if (n.includes("crema") || n.includes("serum") || n.includes("protector")) return "Cuidado de Piel";
    return "Otros";
  };

  const cargarParaEdicion = (prod: any) => {
    setModoEdicion(prod);
    setNombre(prod.nombre);
    setPrecio(prod.precio.toString());
    setStock(prod.stock.toString());
    setTonos(prod.tonos ? prod.tonos.join(', ') : '');
    setDescripcion(prod.descripcion || '');
    setImagenPrevisualizacion(prod.imagen);
    setTabActiva('inventario');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const limpiarFormulario = () => {
    setModoEdicion(null); setNombre(''); setPrecio(''); setStock('10'); setTonos(''); setDescripcion(''); setImagenArchivo(null); setImagenPrevisualizacion(null);
  };

  const eliminarProducto = async (id: number) => {
    if (!confirm("¿Eliminar este producto permanentemente?")) return;
    await supabase.from("productos").delete().eq("id", id);
    mostrarNotificacion("Producto eliminado");
    obtenerInventario();
  };

  const cambiarEstadoPedido = async (id: number, nuevoEstado: string) => {
    await supabase.from("pedidos").update({ estado: nuevoEstado }).eq("id", id);
    mostrarNotificacion(`Pedido cambiado a ${nuevoEstado}`);
    obtenerPedidos();
  };
  const eliminarPedido = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este pedido del historial?")) return;
    const { error } = await supabase.from("pedidos").delete().eq("id", id);
    if (!error) {
      mostrarNotificacion("Pedido eliminado del historial");
      obtenerPedidos();
    } else {
      mostrarNotificacion("Error al eliminar el pedido", "error");
    }
  };

  // Personalización Banners & Logo
  const manejarSubidaLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCargandoPersonalizacion(true);
    try {
      const filePath = `tienda/${Date.now()}_logo.${file.name.split('.').pop()}`;
      await supabase.storage.from('productos').upload(filePath, file);
      const { data } = supabase.storage.from('productos').getPublicUrl(filePath);
      actualizarConfig({ logoUrl: data.publicUrl });
      mostrarNotificacion("Logo actualizado correctamente");
    } catch {
      mostrarNotificacion("Error al subir el logo", "error");
    } finally {
      setCargandoPersonalizacion(false);
    }
  };

  const agregarBannerUrl = () => {
    if (!nuevoBannerUrl) return;
    actualizarConfig({ bannersPromocionales: [...config.bannersPromocionales, nuevoBannerUrl] });
    setNuevoBannerUrl("");
    mostrarNotificacion("Banner añadido");
  };

  const manejarSubidaBannerArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCargandoPersonalizacion(true);
    try {
      const filePath = `tienda/${Date.now()}_banner.${file.name.split('.').pop()}`;
      await supabase.storage.from('productos').upload(filePath, file);
      const { data } = supabase.storage.from('productos').getPublicUrl(filePath);
      actualizarConfig({ bannersPromocionales: [...config.bannersPromocionales, data.publicUrl] });
      mostrarNotificacion("Banner subido correctamente");
    } catch {
      mostrarNotificacion("Error al subir el banner", "error");
    } finally {
      setCargandoPersonalizacion(false);
    }
  };

  const eliminarBanner = (index: number) => {
    const nuevosBanners = config.bannersPromocionales.filter((_, i) => i !== index);
    actualizarConfig({ bannersPromocionales: nuevosBanners });
  };

  const guardarPersonalizacion = () => {
    actualizarConfig({
      nombreTienda: nombreTiendaInput, eslogan: esloganInput,
      colorPrimario: colorPrimarioInput, colorTextoNombre: colorTextoNombreInput,
      colorFondoPagina_adm: colorFondoPagina_admInput, colorFondoCatalogo: colorFondoCatalogoInput,
      colorFondoTarjeta: colorFondoTarjetaInput,
      textoAnuncio: textoAnuncioInput
    });
    mostrarNotificacion("¡Diseño de tienda guardado!");
  };

  // Filtrado y Ordenamiento
  const productosFiltrados = productos
    .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (p.categoria_producto || '').toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      let valA = a[ordenCampo];
      let valB = b[ordenCampo];
      if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = (valB || '').toLowerCase(); }
      if (valA < valB) return ordenDireccion === 'asc' ? -1 : 1;
      if (valA > valB) return ordenDireccion === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative" style={{ backgroundColor: config.colorFondoPagina_adm || "#f9fafb" }}>
      
      {/* TOAST FLOTANTE */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-bold text-xs uppercase animate-bounce ${toast.tipo === 'exito' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {toast.tipo === 'exito' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.mensaje}</span>
        </div>
      )}

      {/* SIDEBAR ADMINISTRATIVO */}
      <aside className="w-full md:w-64 bg-gray-950 text-white flex-shrink-0 p-6 flex flex-col justify-between shadow-xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-lg font-black tracking-wider uppercase text-rose-400">Admin Panel</h1>
            <p className="text-[10px] text-gray-400 uppercase font-bold">{config.nombreTienda}</p>
          </div>
          <nav className="space-y-2">
            {[
              { id: 'dashboard', icono: LayoutDashboard, texto: 'Resumen' },
              { id: 'inventario', icono: Package, texto: 'Inventario' },
              { id: 'pedidos', icono: ClipboardList, texto: `Pedidos (${pedidos.length})` },
              { id: 'personalizacion', icono: Palette, texto: 'Personalización' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setTabActiva(tab.id as any)} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase transition ${tabActiva === tab.id ? 'bg-rose-500 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
              >
                <tab.icono size={18} /> <span>{tab.texto}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="pt-6 border-t border-gray-900 mt-10">
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-950/40 rounded-xl transition uppercase">
            <LogOut size={18} /> <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        
        {/* PESTAÑA: RESUMEN (DASHBOARD) */}
        {tabActiva === 'dashboard' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-gray-900 uppercase">Resumen General</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border flex items-center gap-4 shadow-sm" style={{ backgroundColor: config.colorFondoTarjeta || "#ffffff" }}>
                <div className="p-4 bg-rose-50 text-rose-500 rounded-2xl"><Package size={28} /></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Productos</p><p className="text-2xl font-black text-gray-900">{productos.length}</p></div>
              </div>
              <div className="bg-white p-6 rounded-2xl border flex items-center gap-4 shadow-sm" style={{ backgroundColor: config.colorFondoTarjeta || "#ffffff" }}>
                <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl"><ClipboardList size={28} /></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Pedidos</p><p className="text-2xl font-black text-gray-900">{pedidos.length}</p></div>
              </div>
              <div className="bg-white p-6 rounded-2xl border flex items-center gap-4 shadow-sm" style={{ backgroundColor: config.colorFondoTarjeta || "#ffffff" }}>
                <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl"><Palette size={28} /></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Banners Activos</p><p className="text-2xl font-black text-gray-900">{config.bannersPromocionales.length}</p></div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: INVENTARIO EN LISTA / TABLA */}
        {tabActiva === 'inventario' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-gray-900 uppercase">Gestión de Inventario</h2>

            {/* FORMULARIO CRUD */}
            <form onSubmit={guardarProducto} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-sm font-bold uppercase text-rose-500 flex items-center gap-2">
                <PlusCircle size={18} /> {modoEdicion ? `Editando: ${modoEdicion.nombre}` : "Agregar Nuevo Producto"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400">Nombre</label>
                  <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-xs font-semibold focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400">Precio (COP)</label>
                  <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-xs font-semibold focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400">Stock</label>
                  <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-xs font-semibold focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400">Tonos (Separados por coma)</label>
                  <input type="text" value={tonos} onChange={e => setTonos(e.target.value)} placeholder="Ej: Tono 1, Tono 2" className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-xs font-semibold focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400">Imagen del Producto</label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition text-gray-700">
                      <UploadCloud size={16} /> Seleccionar Foto
                      <input type="file" accept="image/*" onChange={manejarSeleccionImagen} className="hidden" />
                    </label>
                    {imagenPrevisualizacion && <img src={imagenPrevisualizacion} className="w-10 h-10 rounded-lg object-cover border" />}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400">Descripción</label>
                <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-xs font-semibold focus:outline-none" />
              </div>

              {/* BOTONES ABAJO */}
              <div className="flex gap-4 pt-2">
                <button type="submit" disabled={cargando} className="flex-1 bg-gray-950 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-600 transition">
                  {cargando ? "Procesando..." : (modoEdicion ? "Actualizar Producto" : "Guardar Producto")}
                </button>
                {modoEdicion && (
                  <button type="button" onClick={limpiarFormulario} className="px-6 bg-gray-200 text-gray-800 rounded-xl text-xs font-bold uppercase hover:bg-gray-300 transition">
                    Cancelar Edición
                  </button>
                )}
              </div>
            </form>

            {/* BÚSQUEDA Y ORDENAMIENTO */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input type="text" placeholder="Buscar por nombre o categoría..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none" />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <span className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1"><ArrowUpDown size={14} /> Ordenar:</span>
                <select value={ordenCampo} onChange={(e: any) => setOrdenCampo(e.target.value)} className="bg-gray-50 border border-gray-200 text-xs font-bold uppercase px-3 py-2 rounded-xl focus:outline-none">
                  <option value="nombre">Nombre</option>
                  <option value="precio">Precio</option>
                  <option value="stock">Stock</option>
                  <option value="categoria_producto">Categoría</option>
                </select>
                <button onClick={() => setOrdenDireccion(ordenDireccion === 'asc' ? 'desc' : 'asc')} className="p-2 bg-gray-100 rounded-xl text-xs font-bold uppercase">
                  {ordenDireccion === 'asc' ? '▲ ASC' : '▼ DESC'}
                </button>
              </div>
            </div>

            {/* VISTA EN LISTA / TABLA DE PRODUCTOS */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" style={{ backgroundColor: config.colorFondoTarjeta || "#ffffff" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      <th className="p-4">Producto</th>
                      <th className="p-4">Categoría</th>
                      <th className="p-4">Precio</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs">
                    {productosFiltrados.map((prod) => (
                      <tr key={prod.id} className="hover:bg-rose-50/20 transition">
                        <td className="p-4 flex items-center gap-3">
                          {/* CLICK EN LA FOTO ABRE EL BANNER MODAL PREVIA */}
                          <img 
                            src={prod.imagen} 
                            alt={prod.nombre} 
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300"; }}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-100 cursor-pointer hover:scale-105 transition shadow-sm"
                            onClick={() => setProductoModal(prod)}
                          />
                          <div>
                            <p onClick={() => setProductoModal(prod)} className="font-extrabold text-gray-900 uppercase cursor-pointer hover:text-rose-500 transition">{prod.nombre}</p>
                            <p className="text-[10px] text-gray-400 truncate max-w-xs">{prod.descripcion || 'Sin descripción'}</p>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-rose-500 uppercase">{prod.categoria_producto || 'Otros'}</td>
                        <td className="p-4 font-black text-gray-900">${prod.precio?.toLocaleString('es-CO')}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${prod.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {prod.stock} un.
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => setProductoModal(prod)} title="Ver detalles" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => cargarParaEdicion(prod)} title="Editar" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => eliminarProducto(prod.id)} title="Eliminar" className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: PEDIDOS (DISEÑO EXACTO A LA IMAGEN) */}
        {/* PESTAÑA: PEDIDOS (DISEÑO DE TABLA) */}
        {tabActiva === 'pedidos' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm" style={{ backgroundColor: config.colorFondoTarjeta || "#ffffff" }}>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 mb-6 flex items-center gap-2">
                <ClipboardList size={20} className="text-rose-500" /> Control de Pedidos Recibidos
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 border-collapse">
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
                      <tr key={ped.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-4 py-4 font-bold text-gray-950">{ped.num_ref}</td>
                        <td className="px-4 py-4">
                          <div className="font-bold text-gray-900">{ped.cliente_nombre || "Anónimo"}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[150px]">{ped.cliente_direccion}</div>
                        </td>
                        <td className="px-4 py-4 font-black text-gray-900">${ped.precio_total?.toLocaleString('es-CO')}</td>
                        <td className="px-4 py-4">
                          <select 
                            value={ped.estado || 'Pendiente'} 
                            onChange={(e) => cambiarEstadoPedido(ped.id, e.target.value)}
                            className={`font-bold p-1.5 px-2.5 rounded-lg border text-[9px] uppercase tracking-wider outline-none cursor-pointer transition-colors ${
                              ped.estado === 'Completado' || ped.estado === 'Confirmado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              ped.estado === 'Enviado' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              ped.estado === 'Cancelado' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Confirmado">Confirmado</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Completado">Completado</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 text-gray-400 text-[10px] font-semibold">{new Date(ped.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-4 text-right space-x-2">
                          <button onClick={() => setPedidoSeleccionado(ped)} className="bg-gray-100 text-gray-700 hover:bg-rose-500 hover:text-white rounded-lg font-bold uppercase text-[9px] tracking-wider px-3 py-2 transition shadow-sm">
                            Ver Detalle
                          </button>
                          <button onClick={() => eliminarPedido(ped.id)} className="p-2 bg-gray-50 text-gray-400 hover:bg-red-100 hover:text-red-600 rounded-lg transition">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pedidos.length === 0 && (
                  <div className="text-center py-12 flex flex-col items-center justify-center space-y-3">
                    <ClipboardList size={40} className="text-gray-200" />
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Aún no se han recibido pedidos</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: PERSONALIZACIÓN */}
        {tabActiva === 'personalizacion' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-gray-900 uppercase">Diseño de la Tienda</h2>

            {/* SECCIÓN 1: IDENTIDAD Y TEXTOS */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-sm font-bold uppercase text-gray-900 border-b pb-2">Identidad Visual</h3>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full border-4 border-gray-50 shadow-sm overflow-hidden bg-gray-100 flex items-center justify-center">
                  {config.logoUrl ? <img src={config.logoUrl} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-400" />}
                </div>
                <label className="cursor-pointer bg-gray-950 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-rose-600 transition">
                  <UploadCloud size={16} /> {cargandoPersonalizacion ? "Subiendo..." : "Subir Archivo de Logo"}
                  <input type="file" accept="image/*" onChange={manejarSubidaLogo} className="hidden" disabled={cargandoPersonalizacion} />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Nombre Tienda</label>
                  <input type="text" value={nombreTiendaInput} onChange={e => setNombreTiendaInput(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-xs font-semibold focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Eslogan</label>
                  <input type="text" value={esloganInput} onChange={e => setEsloganInput(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-xs font-semibold focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Barra Superior de Ofertas / Anuncio</label>
                  <input type="text" value={textoAnuncioInput} onChange={e => setTextoAnuncioInput(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-xs font-semibold focus:outline-none" />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: PALETA DE COLORES */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-sm font-bold uppercase text-gray-900 border-b pb-2">Colores del Sitio</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Color Barra Ofertas</label>
                  <input type="color" value={colorPrimarioInput} onChange={e => setColorPrimarioInput(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Color Letra Nombre</label>
                  <input type="color" value={colorTextoNombreInput} onChange={e => setColorTextoNombreInput(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Fondo de Página</label>
                  <input type="color" value={colorFondoPagina_admInput} onChange={e => setcolorFondoPagina_admInput(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Fondo Cuadros Tarjeta</label>
                  <input type="color" value={colorFondoTarjetaInput} onChange={e => setColorFondoTarjetaInput(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Fondo Página Catálogo</label>
                  <input type="color" value={colorFondoCatalogoInput} onChange={e => setColorFondoCatalogoInput(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
                </div>
              </div>
              <button onClick={guardarPersonalizacion} className="w-full bg-rose-500 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-600 transition">
                Aplicar Colores y Textos
              </button>
            </div>

            {/* SECCIÓN 3: BANNERS PROMOCIONALES */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-sm font-bold uppercase text-gray-900 border-b pb-2">Banners Promocionales (Portal de Inicio)</h3>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="cursor-pointer bg-white border border-gray-200 text-gray-700 w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 hover:bg-gray-100 transition">
                  <UploadCloud size={16} /> Subir Imagen
                  <input type="file" accept="image/*" onChange={manejarSubidaBannerArchivo} className="hidden" disabled={cargandoPersonalizacion} />
                </label>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Ó</span>
                <div className="flex w-full flex-1 gap-2">
                  <div className="relative flex-1">
                    <LinkIcon size={14} className="absolute left-3 top-3 text-gray-400" />
                    <input type="text" placeholder="Pegar URL de la imagen..." value={nuevoBannerUrl} onChange={e => setNuevoBannerUrl(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none" />
                  </div>
                  <button onClick={agregarBannerUrl} className="bg-gray-900 text-white px-4 rounded-xl text-xs font-bold uppercase hover:bg-gray-800 transition">
                    Añadir
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {config.bannersPromocionales.map((url, idx) => (
                  <div key={idx} className="relative rounded-2xl overflow-hidden border border-gray-200 aspect-video group bg-gray-100">
                    <img src={url} alt={`Banner ${idx}`} className="w-full h-full object-cover" />
                    <button onClick={() => eliminarBanner(idx)} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* MODAL DETALLE / BANNER DE PRODUCTO AL HACER CLIC EN LA IMAGEN DE INVENTARIO */}
      {productoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-fade-in-up">
            <button onClick={() => setProductoModal(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-rose-100 hover:text-rose-600 transition z-10">
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
                <img 
                  src={productoModal.imagen} 
                  alt={productoModal.nombre} 
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300"; }}
                  className="w-full h-full object-cover" 
                />
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-rose-500">{productoModal.categoria_producto || 'Otros'}</span>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mt-1">{productoModal.nombre}</h2>
                  <p className="text-xl font-black text-gray-900 mt-2">${productoModal.precio?.toLocaleString('es-CO')}</p>
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">{productoModal.descripcion || 'Sin descripción disponible.'}</p>
                  
                  {productoModal.tonos && productoModal.tonos.length > 0 && (
                    <div className="mt-4 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-gray-400">Tonos disponibles:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {productoModal.tonos.map((tono: string) => (
                          <span key={tono} className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
                            {tono}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => { cargarParaEdicion(productoModal); setProductoModal(null); }}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  <span>Editar Producto</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) } 
{/* MODAL DETALLE DE PEDIDO */}
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
  );
};