  import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
  import { supabase } from "../supabase/client";

  export interface ConfigTienda {
    nombreTienda: string;
    eslogan: string;
    colorPrimario: string;
    colorTextoNombre: string;
    colorFondoPagina_adm: string;
    colorFondoTarjeta: string;
    colorFondoCatalogo: string; // NUEVO: Fondo específico del catálogo
    tipoRubro: "cosmeticos" | "ropa" | "comida" | "general";
    logoUrl: string;
    textoAnuncio: string;
    bannersPromocionales: string[]; // Supabase (JSONB) guarda arreglos nativamente sin problema
  }
// 👇 mensaje x se puede borrar
  const configDefecto: ConfigTienda = {
    nombreTienda: "ISABELLA SANDOVAL",
    eslogan: "makeup",
    colorPrimario: "#d331a0",
    colorTextoNombre: "#915fa8",
    colorFondoPagina_adm: "#ffffff",
    colorFondoTarjeta: "#ffffff",
    colorFondoCatalogo: "#f9fafb",
    tipoRubro: "cosmeticos",
    logoUrl: "https://wcuvgpxitetgmdzyieim.supabase.co/storage/v1/object/public/productos/tienda/1785463603191_logo.png",
    textoAnuncio: "⚡ ENVÍOS SEGUROS A TODO COLOMBIA | OBSEQUIO POR COMPRAS SUPERIORES A $160.000 ⚡",
    bannersPromocionales: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop",
    ],
  };
  //// mantenemos esta version pero debemos act
  interface ThemeContextType {
    config: ConfigTienda;
    actualizarConfig: (nuevaConfig: Partial<ConfigTienda>) => void;
  }

  const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

  export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [config, setConfig] = useState<ConfigTienda>(configDefecto);

    // 1. Cargar desde Supabase al iniciar
    useEffect(() => {
      const cargarConfiguracion = async () => {
        try {
          const { data, error } = await supabase
            .from("configuracion_tienda")
            .select("dato")
            .eq("etiqueta", "tema_general")
            .single();

          if (data && data.dato) {
            setConfig({ ...configDefecto, ...data.dato, bannersPromocionales: Array.isArray(data.dato.bannersPromocionales) && data.dato.bannersPromocionales.length > 0 ? data.dato.bannersPromocionales : configDefecto.bannersPromocionales });
            return;
          }

          if (error?.code === "PGRST116") {
            await supabase
              .from("configuracion_tienda")
              .insert([{ etiqueta: "tema_general", dato: configDefecto }]);
          }
        } catch {
          setConfig(configDefecto);
        }
      };
      cargarConfiguracion();
    }, []);

    // 2. Guardar los cambios (Actualiza estado y hace Upsert en BD)
    const actualizarConfig = async (nuevaConfig: Partial<ConfigTienda>) => {
      const actualizada = { ...config, ...nuevaConfig };
      
      // Cambia en la UI instantáneamente
      setConfig(actualizada);

      // Guarda en Supabase usando la etiqueta única
      await supabase
        .from("configuracion_tienda")
        .upsert(
          { etiqueta: "tema_general", dato: actualizada },
          { onConflict: "etiqueta" }
        );
    };

    return (
      <ThemeContext.Provider value={{ config, actualizarConfig }}>
        {children}
      </ThemeContext.Provider>
    );
  };

  export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme debe usarse dentro de ThemeProvider");
    return context;
  };