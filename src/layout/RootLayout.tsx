import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/shared/Navbar";
import { Footer } from "../components/shared/Footer";
import { CartDrawer } from "../components/shared/CartDrawer";

export const RootLayout = () => {
  const [carrito, setCarrito] = useState<any[]>([]);
  const [isCarritoAbierto, setIsCarritoAbierto] = useState(false);

  // Lógica de adición basada en id + tono para evitar colisiones
  const agregarAlCarrito = (producto: any, tonoSeleccionado: string) => {
    const idCarrito = `${producto.id}-${tonoSeleccionado}`;
    const existente = carrito.find((item) => item.idCarrito === idCarrito);
    if (existente) {
      setCarrito(
        carrito.map((item) =>
          item.idCarrito === idCarrito ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      );
    } else {
      setCarrito([
        ...carrito,
        { ...producto, idCarrito, tonoSeleccionado, cantidad: 1 },
      ]);
    }
    if (carrito.length === 0) {
      setIsCarritoAbierto(true);
    } // Despliega el carrito visualmente
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans antialiased">
      <Navbar cantidadCarrito={carrito.length} abrirCarrito={() => setIsCarritoAbierto(true)} />

      {/* Repartimos la función inyectora al Outlet del enrutador */}
      <main className="flex-1 py-10">
        <Outlet context={{ agregarAlCarrito }} />
      </main>

      <Footer />

      <CartDrawer 
        carrito={carrito} 
        setCarrito={setCarrito} 
        isCarritoAbierto={isCarritoAbierto} 
        cerrarCarrito={() => setIsCarritoAbierto(false)} 
      />
    </div>
  );
};