// src/Home.tsx
import { Fragment, useEffect } from "react"; // Adicionado useEffect
import { useLocation } from "react-router-dom"; // Adicionado useLocation

import Navbar from "./components/Navbar"; 
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";

import Hero from "./pages/Hero"; 
import Sobre from "./pages/Sobre";
import Contato from "./pages/Contato";

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    // 1. Verifica se existe um ID de destino no estado da navegação
    const targetId = location.state?.targetId;
    
    if (targetId) {
      // 2. Aguarda um pequeno delay para garantir que os componentes Hero, Sobre, etc., 
      // já foram montados no navegador.
      const timer = setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
        
        // 3. Limpa o estado para evitar que a página role sozinha se o usuário der F5
        window.history.replaceState({}, document.title);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <Fragment>
      <Navbar />
      <main>
        {/* Adicionei o ID inicio aqui para o link "Início" funcionar */}
        <div id="inicio">
          <Hero /> 
        </div>

        <div id="sobre">
          <Sobre />
        </div>

        <div id="contato">
          <div className="relative w-full">
             <Contato />
          </div>
        </div>
      </main>
      <Footer />
      <BackToTop />
    </Fragment>
  );
}