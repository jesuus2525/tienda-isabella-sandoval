export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  tonos: string[];
  stock: number;
  imagen: string;
  desc: string;
}

export const PRODUCTOS_MAQUILLAJE: Producto[] = [
  { 
    id: 1, 
    nombre: "Base Líquida Matte", 
    precio: 35000, 
    tonos: ["Claro", "Medio", "Oscuro"], 
    stock: 15, 
    imagen: "https://images.unsplash.com/photo-1631214524020-5e1841261ca9?w=500&q=80", 
    desc: "Alta cobertura y control de brillo" 
  },
  { 
    id: 2, 
    nombre: "Gloss Labial Mágico", 
    precio: 18000, 
    tonos: ["Fresa", "Cereza"], 
    stock: 3, 
    imagen: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&q=80", 
    desc: "Brillo intenso con destellos naturales" 
  }, 
  { 
    id: 3, 
    nombre: "Paleta de Sombras Rosa", 
    precio: 45000, 
    tonos: ["Único"], 
    stock: 9, 
    imagen: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80", 
    desc: "Alta pigmentación profesional" 
  }, 
  { 
    id: 4, 
    nombre: "Rubor Líquido Drops", 
    precio: 27500, 
    tonos: ["Durazno", "Rosa"], 
    stock: 8, 
    imagen: "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=500&q=80", 
    desc: "Efecto ruborizado natural y duradero" 
  },
  { 
    id: 5, 
    nombre: "Pestañina Volumen", 
    precio: 22000, 
    tonos: ["Negro"], 
    stock: 20, 
    imagen: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&q=80", 
    desc: "Mirada impactante y máxima definición" 
  }
];