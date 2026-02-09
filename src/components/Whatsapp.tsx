import { MessageCircle } from "lucide-react";

export default function Whatsapp() {
  return (
    <a
      href="https://wa.me/5513991912020"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 bg-brand-lavender-dark text-white rounded-full shadow-2xl hover:bg-brand-brown transition-all duration-300 hover:scale-110 group animate-bounce-slow"
      aria-label="Contato via WhatsApp"
    >
      {/* Ícone do WhatsApp */}
      <MessageCircle size={36} className="group-hover:rotate-12 transition-transform" />
      
      {/* Efeito de brilho/pulso ao redor */}
      <span className="absolute inset-0 rounded-full bg-brand-lavender-dark animate-ping opacity-20"></span>
    </a>
  );
}