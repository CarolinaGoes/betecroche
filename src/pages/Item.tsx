import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, MessageCircle, Ruler, Tag, Loader2 } from "lucide-react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const FooterLocal = () => (
  <footer className="bg-white border-t border-brand-lavender/20 py-12 px-6 text-center mt-20">
    <h4 className="font-serif italic text-xl text-brand-lavender-dark mb-4">Bete Crochê</h4>
    <p className="text-[10px] tracking-[0.3em] text-gray-400 uppercase">© 2026 — Feito à mão no Brasil</p>
  </footer>
);

export default function Item() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [work, setWork] = useState<any>(location.state?.work || null);
    const [loading, setLoading] = useState(!work);

    useEffect(() => {
        if (!work && id) {
            const fetchWork = async () => {
                setLoading(true);
                try {
                    const docRef = doc(db, "artworks", id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setWork({ id: docSnap.id, ...docSnap.data() });
                    }
                } catch (error) {
                    console.error("Erro ao buscar obra:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchWork();
        }
    }, [id, work]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFCFE]">
                <Loader2 className="animate-spin text-brand-lavender-dark" size={40} />
            </div>
        );
    }

    if (!work) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFE] p-6 text-center">
                <h2 className="text-3xl font-serif text-brand-brown mb-4">Peça não encontrada</h2>
                <button
                    onClick={() => navigate("/colecao")}
                    className="bg-brand-lavender-dark text-white px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest shadow-lg"
                >
                    Voltar para a Coleção
                </button>
            </div>
        );
    }

    const WHATSAPP_NUMBER = "5511972230817";
    const currentUrl = window.location.href;

    // Lógica de cores para o status
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'disponivel': return 'text-green-600 bg-green-50';
            case 'encomenda': return 'text-blue-600 bg-blue-50';
            case 'vendido': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'disponivel': return 'Pronta Entrega';
            case 'encomenda': return 'Sob Encomenda';
            case 'vendido': return 'Vendido';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFE]">
            <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-lavender/20">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
                    <button 
                        onClick={() => navigate("/colecao")} 
                        className="flex items-center gap-2 text-brand-lavender-dark font-bold uppercase text-[10px] tracking-widest"
                    >
                        <ChevronLeft size={18} /> Voltar para Coleção
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    
                    {/* FOTO: Sempre limpa, sem filtros de "vendido" */}
                    <div className="rounded-sm overflow-hidden shadow-xl bg-white p-2">
                        <img
                            src={work.image}
                            alt={work.title}
                            className="w-full h-auto object-cover rounded-sm"
                        />
                    </div>

                    <div className="flex flex-col">
                        <span className="text-brand-lavender-dark font-bold tracking-[0.3em] uppercase text-xs mb-4">
                            {work.category}
                        </span>
                        
                        <h1 className="text-4xl md:text-6xl font-serif text-brand-brown mb-6 leading-tight">
                            {work.title}
                        </h1>

                        <div className="flex items-baseline gap-4 mb-8">
                            <p className="text-3xl font-light text-brand-lavender-dark">
                                {work.status === "vendido" 
                                    ? "Acervo Privado" 
                                    : `R$ ${Number(work.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                }
                            </p>
                        </div>

                        <div className="space-y-6 mb-10 border-y border-brand-lavender/20 py-8">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-brand-lavender-subtle rounded-full">
                                    <Ruler size={18} className="text-brand-lavender-dark" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Dimensões</span>
                                    <span className="font-medium text-brand-brown">{work.dimensions || "Tamanho padrão"}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-brand-lavender-subtle rounded-full">
                                    <Tag size={18} className="text-brand-lavender-dark" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Disponibilidade</span>
                                    <span className={`px-3 py-0.5 rounded-md text-sm font-bold w-fit ${getStatusStyles(work.status)}`}>
                                        {getStatusLabel(work.status)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-10">
                            <h3 className="font-serif italic text-xl text-brand-brown mb-4">Detalhes da Obra</h3>
                            <p className="text-gray-600 leading-relaxed font-light text-lg">
                                {work.description || "Esta peça é única e produzida manualmente pela artista Bete, utilizando técnicas tradicionais de crochê."}
                            </p>
                        </div>

                        {/* BOTÃO WHATSAPP: Removido se estiver vendido */}
                        {work.status !== "vendido" ? (
                            <button
                                onClick={() => {
                                    const message = encodeURIComponent(
                                        `Olá, Bete! Gostaria de conversar sobre a peça "${work.title}".\n\nLink: ${currentUrl}`
                                    );
                                    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
                                }}
                                className="w-full bg-brand-lavender-dark text-white py-5 rounded-full font-bold uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-brand-brown transition-all duration-300 flex items-center justify-center gap-3"
                            >
                                <MessageCircle size={20} />
                                Solicitar Informações
                            </button>
                        ) : (
                            <div className="w-full py-5 rounded-full border border-red-200 text-red-400 text-center font-bold uppercase text-[10px] tracking-widest">
                                Item indisponível para novos pedidos
                            </div>
                        )}
                        
                        <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest">
                            {work.status !== "vendido" ? "Atendimento via WhatsApp" : "Consulte outras peças da coleção"}
                        </p>
                    </div>
                </div>
            </main>
            <FooterLocal />
        </div>
    );
}