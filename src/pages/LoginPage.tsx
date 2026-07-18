import { useState } from "react";
import { supabase } from "../supabase/client";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    // Supabase Auth maneja la encriptación y seguridad por nosotros
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Usuario o contraseña incorrecta.");
      setCargando(false);
      return;
    }

    // Si el login es exitoso, recargamos la página para que el enrutador lea la sesión
    if (data.session) {
      window.location.href = "/admin"; 
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 font-sans">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-sm uppercase font-bold tracking-widest text-rose-500 mb-2">Acceso Restringido</h2>
          <h1 className="text-2xl font-black text-gray-900 uppercase">Panel Administrativo</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={iniciarSesion} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Correo Electrónico</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3.5 text-sm focus:outline-none focus:border-rose-400 transition"
              placeholder="admin@isabellasandoval.com"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Contraseña de Seguridad</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3.5 text-sm focus:outline-none focus:border-rose-400 transition"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" disabled={cargando}
            className="w-full bg-gray-950 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-600 transition disabled:bg-gray-300 mt-4"
          >
            {cargando ? "Verificando..." : "Ingresar al Sistema"}
          </button>
        </form>
      </div>
    </div>
  );
};