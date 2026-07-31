import { createContext, useContext, useState, type ReactNode } from "react";

export interface ConfigTienda {
  nombreTienda: string;
  eslogan: string;
  colorPrimario: string;
  colorTextoNombre: string; // Nuevo: Color de la letra del logo/nombre
  colorFondoPagina: string; // Nuevo: Fondo general de la página
  colorFondoTarjeta: string; // Nuevo: Fondo de los cuadros de producto
  tipoRubro: "cosmeticos" | "ropa" | "comida" | "general";
  logoUrl: string;
  textoAnuncio: string;
  bannersPromocionales: string[];
}

const configDefecto: ConfigTienda = {
  nombreTienda: "ISABELLA SANDOVAL",
  eslogan: "makeup",
  colorPrimario: "#d331a0",
  colorTextoNombre: "#915fa8",
  colorFondoPagina: "#ffffff",
  colorFondoTarjeta: "#ffffff",
  tipoRubro: "cosmeticos",
  logoUrl: "https://wcuvgpxitetgmdzyieim.supabase.co/storage/v1/object/public/productos/tienda/1785463603191_logo.png",
  textoAnuncio: "⚡ ENVÍOS SEGUROS A TODO COLOMBIA | REGALO POR COMPRAS SUPERIORES A $160.000 ⚡",
  bannersPromocionales: [
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop"
  ],
};

interface ThemeContextType {
  config: ConfigTienda;
  actualizarConfig: (nuevaConfig: Partial<ConfigTienda>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<ConfigTienda>(() => {
    const guardado = localStorage.getItem("config_tienda");
    return guardado ? JSON.parse(guardado) : configDefecto;
  });

  const actualizarConfig = (nuevaConfig: Partial<ConfigTienda>) => {
    setConfig((prev) => {
      const actualizada = { ...prev, ...nuevaConfig };
      localStorage.setItem("config_tienda", JSON.stringify(actualizada));
      return actualizada;
    });
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