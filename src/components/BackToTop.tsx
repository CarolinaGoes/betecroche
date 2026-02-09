import { ChevronUp } from "lucide-react";

export default function BackToTop() {
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();

    // 1. Tenta o scroll na janela (padrão)
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 2. Se a janela não mexeu, tentamos nos elementos que costumam causar o problema:
    const scrollingElements = [
      document.documentElement, // <html>
      document.body,            // <body>
      document.querySelector('main'), // <main>
      document.getElementById('root') // Padrão do React (Vite/CRA)
    ];

    scrollingElements.forEach(el => {
      if (el) {
        el.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    });
  };

  return (
    <button
      onClick={scrollToTop}
      style={{ zIndex: 9999 }}
      className="fixed bottom-6 left-6 bg-brand-lavender-light p-4 rounded-full shadow-2xl border border-brand-lavender/20 flex items-center justify-center hover:bg-brand-lavender transition-all active:scale-90 cursor-pointer"
      aria-label="Voltar ao topo"
    >
      <ChevronUp size={24} className="text-brand-lavender-dark" />
    </button>
  );
}