import { MessageCircle, Instagram, MapPin, Mail } from "lucide-react";

export default function Contato() {
  return (
    <div id="contato" className="py-32 bg-brand-lavender-subtle/30">
      <section className="max-w-5xl mx-auto px-6 text-center">
        <h3 className="text-3xl md:text-5xl font-serif mb-12 text-brand-brown">Vamos conversar?</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {/* WhatsApp */}
          <a 
            href="https://wa.me/5513991912020" 
            target="_blank" 
            rel="noreferrer" 
            className="flex flex-col items-center p-6 md:p-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-all group"
          >
            <MessageCircle className="text-brand-lavender-dark mb-4 group-hover:scale-110 transition-transform" size={32} />
            <span className="font-medium text-sm md:text-base">WhatsApp</span>
          </a>

          {/* Instagram */}
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noreferrer" 
            className="flex flex-col items-center p-6 md:p-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-all group"
          >
            <Instagram className="text-brand-lavender-dark mb-4 group-hover:scale-110 transition-transform" size={32} />
            <span className="font-medium text-sm md:text-base">Instagram</span>
          </a>

          {/* E-mail - CORRIGIDO */}
          <a 
            href="mailto:martinselisabete16@gmail.com" 
            className="flex flex-col items-center p-6 md:p-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-all group"
          >
            <Mail className="text-brand-lavender-dark mb-4 group-hover:scale-110 transition-transform" size={32} />
            <span className="font-medium text-sm md:text-base">E-mail</span>
          </a>

          {/* Localização */}
          <div className="flex flex-col items-center p-6 md:p-8 bg-white rounded-lg shadow-sm">
            <MapPin className="text-brand-lavender-dark mb-4" size={32} />
            <span className="font-medium text-sm md:text-base">São Paulo</span>
          </div>
        </div>
      </section>
    </div>
  );
}