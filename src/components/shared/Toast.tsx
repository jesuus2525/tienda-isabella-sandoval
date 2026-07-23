import { useEffect } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface ToastProps {
  mensaje: string;
  tipo?: "éxito" | "error";
  onClose: () => void;
  duracion?: number; // Tiempo en milisegundos
}

export const Toast = ({ mensaje, tipo = "éxito", onClose, duracion = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duracion);

    return () => clearTimeout(timer);
  }, [onClose, duracion]);

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold text-white ${
        tipo === "éxito" ? "bg-gray-900 border-gray-800" : "bg-red-600 border-red-500"
      }`}>
        {tipo === "éxito" ? <CheckCircle className="text-emerald-400" size={18} /> : <AlertCircle className="text-white" size={18} />}
        <span>{mensaje}</span>
        <button onClick={onClose} className="ml-2 text-gray-400 hover:text-white">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};