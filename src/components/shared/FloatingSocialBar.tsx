import { FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa6';
// 👇 mensaje x se puede borrar
const redes = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/isa.s.anaya?igsh=Z3ZjemJuenY5ZmRi',
    icon: FaInstagram,
    bg: 'bg-gradient-to-br from-pink-500 via-rose-500 to-violet-500',
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/+573012970476?text=Hola%20estoy%20interesad@%20en%20tus%20productos%20amiga',
    icon: FaWhatsapp,
    bg: 'bg-emerald-500',
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@paolavelandia76?_r=1&_t=ZS-988YVtdjWVg',
    icon: FaTiktok,
    bg: 'bg-black',
  },
];

export const FloatingSocialBar = () => {
  return (
    <div className="fixed right-5 top-1/2 z-10 -translate-y-1/2 flex">
      <div className="flex flex-col gap-2 rounded-full border border-white/15 bg-slate-400/10 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-md sm:gap-8">
        {redes.map(({ name, href, icon: Icon, bg }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={name}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg transition duration-200 hover:scale-105 sm:h-12 sm:w-12 ${bg}`}
          >
            <Icon size={18} />
          </a>
        ))}
      </div>
    </div>
  );
};
