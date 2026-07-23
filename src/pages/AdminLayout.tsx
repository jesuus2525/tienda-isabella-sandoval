import { useState } from "react";
import { 
  LayoutDashboard, 
  Palette, 
  LogOut, 
  Plus, 
  Search, 
  ArrowUpDown, 
  Eye, 
  Edit, 
  Trash2, 
  X,
  Upload,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export const AdminDashboard = () => {
  const { config, actualizarConfig } = useTheme();
  
  // Pestaña activa: 'inventario' | 'personalizacion'
  const [seccionActiva, setSeccionActiva] = useState<"inventario" | "personalizacion">("inventario");
  
  // Lista ficticia/estado de productos
  const [productos] = useState([
    { id: 1, nombre: "Base de Maquillaje Matte", categoria: "Rostro", precio: 45000, stock: 12, imagen: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300" },
    { id: 2, nombre: "Pestañina Volumen Extreme", categoria: "Ojos", precio: 28000, stock: 25, imagen: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=300" },
    { id: 3, nombre: "Sombra de Ojos Nude", categoria: "Ojos", precio: 35000, stock: 8, imagen: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300" }
  ]);

  // Filtros y ordenamiento
  const [busqueda, setBusqueda] = useState("");
  const [criterioOrden, setCriterioOrden] = useState<"nombre" | "categoria" | "precio">("nombre");

  // Modal para ver imagen en grande (Lightbox)
  const [imagenModal, setImagenModal] = useState<string | null>(null);

  // Formulario de Producto (Agregar / Editar)
  const [modalFormulario, setModalFormulario] = useState(false);
  const [previewImagenForm, setPreviewImagenForm] = useState<string | null>(null);

  // Productos filtrados y ordenados
  const productosFiltrados = productos
    .filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.categoria.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      if (criterioOrden === "precio") return a.precio - b.precio;
      return a[criterioOrden].localeCompare(b[criterioOrden]);
    });

  // Manejar seleccion de archivo con previsualizacion
  const manejarArchivoForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const urlPreview = URL.createObjectURL(file);
      setPreviewImagenForm(urlPreview);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 1. SIDEBAR LATERAL */}
      <aside className="w-64 bg-gray-950 text-white flex flex-col justify-between p-6">
        <div>
          {/* Logo / Nombre de Tienda */}
          <div className="mb-8">
            <h1 className="text-lg font-black tracking-wider uppercase text-white">
              {config.nombreTienda}
            </h1>
            <p className="text-[10px] text-gray-400 tracking-widest uppercase">Panel Administrativo</p>
          </div>

          {/* Menú de Opciones */}
          <nav className="space-y-2">
            <button
              onClick={() => setSeccionActiva("inventario")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase transition ${
                seccionActiva === "inventario" ? "bg-rose-500 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <LayoutDashboard size={18} />
              Inventario
            </button>

            <button
              onClick={() => setSeccionActiva("personalizacion")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase transition ${
                seccionActiva === "personalizacion" ? "bg-rose-500 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <Palette size={18} />
              Personalización
            </button>
          </nav>
        </div>

        {/* Botón Cerrar Sesión */}
        <button 
          onClick={() => window.location.href = "/"}
          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase text-red-400 hover:bg-red-950/40 rounded-xl transition"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </aside>

      {/* 2. ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* SECCIÓN 1: INVENTARIO */}
        {seccionActiva === "inventario" && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Gestión de Inventario</h2>
                <p className="text-xs text-gray-500">Administra los productos de tu catálogo web</p>
              </div>

              <button
                onClick={() => {
                  setPreviewImagenForm(null);
                  setModalFormulario(true);
                }}
                className="bg-gray-950 hover:bg-rose-600 text-white px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition"
              >
                <Plus size={16} /> Agregar Producto
              </button>
            </div>

            {/* Barra de Filtros y Ordenamiento */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar producto o categoría..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Selector de Ordenamiento */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <ArrowUpDown size={16} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-500 uppercase">Ordenar por:</span>
                <select
                  value={criterioOrden}
                  onChange={(e: any) => setCriterioOrden(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none"
                >
                  <option value="nombre">Nombre</option>
                  <option value="categoria">Categoría</option>
                  <option value="precio">Precio</option>
                </select>
              </div>
            </div>

            {/* Tabla de Productos */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    <th className="p-4">Imagen</th>
                    <th className="p-4">Nombre</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {productosFiltrados.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4">
                        {/* Miniatura interactiva para el Lightbox */}
                        <div 
                          onClick={() => setImagenModal(item.imagen)}
                          className="relative w-12 h-12 rounded-xl overflow-hidden cursor-pointer group border border-gray-200"
                        >
                          <img 
                            src={item.imagen} 
                            alt={item.nombre} 
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                            onError={(e: any) => {
                              e.target.src = "https://via.placeholder.com/150?text=Sin+Imagen";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                            <Eye size={16} />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-900">{item.nombre}</td>
                      <td className="p-4"><span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-[10px] font-bold">{item.categoria}</span></td>
                      <td className="p-4 font-black">${item.precio.toLocaleString("es-CO")}</td>
                      <td className="p-4">{item.stock} un.</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"><Edit size={16} /></button>
                          <button className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECCIÓN 2: PERSONALIZACIÓN GLOBAL */}
        {seccionActiva === "personalizacion" && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Ajustes de Personalización</h2>
            <p className="text-xs text-gray-500 mb-8">Modifica los aspectos clave de tu marca para cualquier tipo de tienda</p>

            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
              
              {/* Nombre de la Tienda */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Nombre de la Tienda</label>
                <input
                  type="text"
                  value={config.nombreTienda}
                  onChange={(e) => actualizarConfig({ nombreTienda: e.target.value })}
                  className="mt-2 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Eslogan */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Eslogan o Subtítulo</label>
                <input
                  type="text"
                  value={config.eslogan}
                  onChange={(e) => actualizarConfig({ eslogan: e.target.value })}
                  className="mt-2 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Rubro / Categoría de Comercio */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Tipo de Negocio</label>
                <select
                  value={config.tipoRubro}
                  onChange={(e: any) => actualizarConfig({ tipoRubro: e.target.value })}
                  className="mt-2 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                >
                  <option value="cosmeticos">Cosméticos & Belleza</option>
                  <option value="ropa">Ropa & Moda</option>
                  <option value="comida">Comida & Restaurante</option>
                  <option value="general">Catálogo General</option>
                </select>
              </div>

              {/* Selector de Color Primario */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase block mb-2">Color Principal de la Marca</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.colorPrimario}
                    onChange={(e) => actualizarConfig({ colorPrimario: e.target.value })}
                    className="w-12 h-12 rounded-xl border-none cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-gray-600 uppercase">{config.colorPrimario}</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* 3. LIGHTBOX / MODAL PREVISUALIZADOR DE IMAGEN */}
      {imagenModal && (
        <div 
          onClick={() => setImagenModal(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="relative max-w-lg w-full bg-white rounded-3xl p-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setImagenModal(null)}
              className="absolute top-4 right-4 p-2 bg-gray-900/80 text-white rounded-full hover:bg-black transition"
            >
              <X size={18} />
            </button>
            <img src={imagenModal} alt="Vista previa" className="w-full h-96 object-cover rounded-2xl" />
          </div>
        </div>
      )}

      {/* 4. MODAL FORMULARIO CON PREVIEW LOCAL DE IMAGEN */}
      {modalFormulario && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setModalFormulario(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-black text-gray-900 mb-4">Agregar Nuevo Producto</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Nombre</label>
                <input type="text" className="w-full mt-1 p-2.5 border rounded-xl text-xs" placeholder="Ej. Polvo Traslúcido" />
              </div>

              {/* Subida de Imagen con Previsualización */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Imagen del Producto</label>
                <div className="mt-2 border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center relative hover:border-gray-400 transition">
                  {previewImagenForm ? (
                    <div className="relative h-40 w-full rounded-xl overflow-hidden">
                      <img src={previewImagenForm} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setPreviewImagenForm(null)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload size={24} className="text-gray-400" />
                      <span className="text-xs text-gray-500 font-semibold">Haz clic para subir o arrastra la foto</span>
                      <input type="file" accept="image/*" onChange={manejarArchivoForm} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <button className="w-full bg-gray-950 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider mt-4">
                Guardar Producto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};