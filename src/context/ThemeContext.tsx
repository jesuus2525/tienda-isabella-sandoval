import { createContext, useContext, useState, type ReactNode } from "react";

export interface ConfigTienda {
  nombreTienda: string;
  eslogan: string;
  colorPrimario: string; // ej: "#f43f5e" o "#000000"
  tipoRubro: "cosmeticos" | "ropa" | "comida" | "general";
  logoUrl: string;
}

const configDefecto: ConfigTienda = {
  nombreTienda: "ISABELLA SANDOVAL",
  eslogan: "Boutique & Cosméticos",
  colorPrimario: "#f43f5e",
  tipoRubro: "cosmeticos",
  logoUrl: "",
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