import { useNavigate } from "react-router-dom";
import logoHero from "../assets/bg.jpg";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section 
      id="inicio" 
      className="relative w-full h-[110vh] m-0 p-0 overflow-hidden bg-white"
    >
      <div
        className="absolute w-full h-full top-0 left-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${logoHero})` 
        }}
      />

      {/* Conteúdo Central */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6">
        <span className="uppercase tracking-[0.6em] text-[10px] md:text-[12px] mb-6 block font-medium opacity-90">
          Artesanato de Luxo
        </span>
        <h2 className="text-5xl md:text-8xl font-serif leading-tight mb-8">
          Onde cada ponto <br /> <span className="italic">conta uma história</span>
        </h2>
        <button 
          onClick={() => navigate("/colecao")} 
          className="px-10 py-4 border-2 border-white rounded-full uppercase text-[11px] tracking-[0.3em] font-bold hover:bg-white hover:text-brand-lavender-dark transition-all cursor-pointer"
        >
          Explorar Coleção
        </button>
      </div>
    </section>
  );
}