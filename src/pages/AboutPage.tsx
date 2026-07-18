export const AboutPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 space-y-8 font-sans">
      <div className="text-center space-y-2">
        <h2 className="text-xs uppercase font-bold tracking-widest text-rose-500">Quiénes Somos</h2>
        <h1 className="text-3xl font-black text-gray-900 uppercase">Nuestra Esencia</h1>
      </div>
      
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-50">
        <img 
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80" 
          alt="Isabella Sandoval Cosméticos" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="space-y-4 text-gray-600 text-sm leading-relaxed text-justify">
        <p>
          En <strong>Isabella Sandoval</strong>, creemos que el maquillaje no busca ocultar imperfecciones, sino potenciar los rasgos únicos que te caracterizan. Nos dedicamos a la distribución de productos cosméticos de alta cobertura, formulados con estándares profesionales para el cuidado diario de tu piel.
        </p>
        <p>
          Esta plataforma web forma parte de nuestra evolución tecnológica para ofrecer una atención ágil y personalizada, permitiendo centralizar tus pedidos y coordinar las entregas directamente a través de nuestra línea de atención automatizada.
        </p>
      </div>
    </div>
  );
};