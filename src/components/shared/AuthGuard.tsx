import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../../supabase/client";

export const AuthGuard = () => {
  const [autenticado, setAutenticado] = useState<boolean | null>(null);

  useEffect(() => {
    const verificarSesion = async () => {
      // Preguntamos a Supabase si hay una sesión activa
      const { data } = await supabase.auth.getSession();
      setAutenticado(!!data.session);
    };
    
    verificarSesion();
  }, []);

  // Mientras verifica, mostramos una pantalla en blanco o de carga
  if (autenticado === null) return null; 

  // Si está autenticado lo deja pasar (Outlet). Si no, lo patea al login (Navigate).
  return autenticado ? <Outlet /> : <Navigate to="/login" replace />;
};