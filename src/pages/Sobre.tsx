import React from "react";

export default function Sobre() {
  return (
    <section id="sobre" className="py-20 md:py-32 bg-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <span className="text-brand-lavender-dark font-medium tracking-[0.4em] text-xs uppercase mb-6 block">A Artista</span>
        <h3 className="text-4xl md:text-6xl font-serif mb-10 text-brand-brown leading-tight">
          Elisabete Martins <br />
          <span className="italic text-brand-lavender-dark text-3xl md:text-5xl">A versatilidade do ponto à mão</span>
        </h3>
        <div className="space-y-8 text-gray-600 leading-relaxed text-lg md:text-xl font-light">
          <p>Com uma trajetória marcada pela dedicação, <strong>Elisabete Martins</strong> transita entre a leveza da moda e a estrutura do design de interiores.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 text-left">
            <div className="border-l border-brand-lavender/40 pl-6">
              <h4 className="font-serif text-brand-lavender-dark text-xl mb-2">Vestuário & Acessórios</h4>
              <p className="text-base text-gray-500 italic">Criações delicadas que unem modernidade e tradição.</p>
            </div>
            <div className="border-l border-brand-lavender/40 pl-6">
              <h4 className="font-serif text-brand-lavender-dark text-xl mb-2">Home & Decor</h4>
              <p className="text-base text-gray-500 italic">Peças exclusivas pensadas para transformar ambientes.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}