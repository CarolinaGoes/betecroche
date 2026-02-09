import { MessageCircle, Instagram, MapPin } from "lucide-react";

export default function Contato() {
  return (
    /* O ID 'contato' deve ficar aqui na div principal */
    <div id="contato" className="py-32 bg-brand-lavender-subtle/30">
      <section className="max-w-4xl mx-auto px-6 text-center">
        <h3 className="text-3xl md:text-5xl font-serif mb-12 text-brand-brown">Vamos conversar?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <a 
            href="https://wa.me/5511972230817" 
            target="_blank" 
            rel="noreferrer" 
            className="flex flex-col items-center p-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-all group"
          >
            <MessageCircle className="text-brand-lavender-dark mb-4 group-hover:scale-110 transition-transform" size={32} />
            <span className="font-medium">WhatsApp</span>
          </a>

          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noreferrer" 
            className="flex flex-col items-center p-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-all group"
          >
            <Instagram className="text-brand-lavender-dark mb-4 group-hover:scale-110 transition-transform" size={32} />
            <span className="font-medium">Instagram</span>
          </a>

          <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-sm">
            <MapPin className="text-brand-lavender-dark mb-4" size={32} />
            <span className="font-medium">São Paulo</span>
          </div>
        </div>
      </section>
    </div>
  );
}