import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigation = (sectionId: string) => {
  setIsMenuOpen(false);
  
  if (location.pathname !== "/") {
    // Se não está na home, navega passando o ID
    navigate("/", { state: { targetId: sectionId } });
  } else {
    // Se já está na home, apenas rola
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else if (sectionId === "inicio") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
};

  return (
    <>
      <header
        className={`fixed w-full top-0 z-[100] transition-all duration-300 ${
          isScrolled 
            ? "bg-white shadow-md py-3" 
            : "bg-[#F8F4FF]/95 backdrop-blur-md py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* LOGO */}
          <div
            onClick={() => navigate("/")}
            className="flex flex-col cursor-pointer"
          >
            <h1 className="text-xl md:text-2xl font-serif italic text-brand-lavender-dark leading-none">
              Bete Crochê
            </h1>
            <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-1">
              Arte em fios & delicadeza manual
            </p>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center space-x-10 text-[14px] tracking-widest uppercase font-medium">
            <NavLink label="Início" onClick={() => handleNavigation("inicio")} />
            <NavLink label="Sobre" onClick={() => handleNavigation("sobre")} />
            <button
              onClick={() => navigate("/colecao")}
              className="hover:text-brand-lavender-dark transition-colors cursor-pointer text-brand-brown"
            >
              Coleções
            </button>
            <NavLink label="Contato" onClick={() => handleNavigation("contato")} />
          </nav>

          {/* MOBILE TRIGGER */}
          <button 
            className="md:hidden p-2 text-brand-lavender-dark" 
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
      </header>

      {/* MOBILE MENU - Fora do header para evitar conflitos de z-index herdado */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[9999]"> 
            {/* Overlay Escuro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />

            {/* Painel Lateral */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="absolute inset-y-0 right-0 w-[300px] bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b border-gray-50">
                <span className="text-sm font-serif italic text-brand-lavender-dark">Menu</span>
                <button 
                  className="text-brand-lavender-dark p-2 rounded-full hover:bg-gray-100 transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X size={28} />
                </button>
              </div>
              
              <nav className="flex flex-col px-8 py-10 space-y-6">
                <MobileNavLink label="Início" onClick={() => handleNavigation("inicio")} />
                <MobileNavLink label="Sobre" onClick={() => handleNavigation("sobre")} />
                <button 
                  onClick={() => { setIsMenuOpen(false); navigate("/colecao"); }}
                  className="text-xl font-serif text-left text-brand-brown hover:text-brand-lavender-dark transition-colors border-b border-gray-100 pb-2"
                >
                  Coleções
                </button>
                <MobileNavLink label="Contato" onClick={() => handleNavigation("contato")} />
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Sub-componentes
function NavLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative group overflow-hidden py-1 text-brand-brown">
      <span className="block group-hover:-translate-y-full transition-transform duration-300">{label}</span>
      <span className="absolute top-full left-0 block text-brand-lavender-dark group-hover:-translate-y-full transition-transform duration-300">
        {label}
      </span>
    </button>
  );
}

function MobileNavLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className="text-xl font-serif text-left text-brand-brown hover:text-brand-lavender-dark transition-colors border-b border-gray-100 pb-2"
    >
      {label}
    </button>
  );
}