import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  limit 
} from "firebase/firestore";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

// Importando seus componentes globais
import Navbar from "../components/Navbar"; 
import Footer from "../components/Footer";

export default function Colecao() {
  const navigate = useNavigate();
  const [worksData, setWorksData] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Aumentei para 12 para fechar linhas de 4 no desktop

  // Busca de dados no Firebase
  useEffect(() => {
    const qWorks = query(collection(db, "artworks"), orderBy("date", "desc"), limit(100));
    const unsubWorks = onSnapshot(qWorks, (snapshot) => {
      setWorksData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const unsubCats = onSnapshot(doc(db, "settings", "categories"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setCategories(data.list || []);
      }
    });

    return () => { 
      unsubWorks(); 
      unsubCats(); 
    };
  }, []);

  // Lógica de Filtro e Ordenação
  const filteredWorks = useMemo(() => {
    return worksData
      .filter((work) => {
        const matchesSearch = work.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === "Todos" || work.category === category;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [worksData, searchTerm, category, sortBy]);

  const currentItems = filteredWorks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredWorks.length * 1 / itemsPerPage);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-brander-lavander relative">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative"> 
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col"> 
            <span className="text-brand-lavender-dark uppercase tracking-widest text-[10px] font-bold">
              Elisabete Martins
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-brand-brown mt-2">
              Nossas Coleções
            </h1>
          </div>

          {/* Barra de Busca e Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="flex flex-1">
              <div className="relative grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Pesquisar peça..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-4 py-2.5 rounded-l-full border border-brand-lavender/30 bg-white focus:outline-none w-full sm:w-64"
                />
              </div>
              <button 
                onClick={handleSearch}
                className="bg-brand-lavender-dark text-white px-5 py-2.5 rounded-r-full text-[10px] uppercase tracking-widest font-bold hover:bg-brand-brown transition-colors"
              >
                Buscar
              </button>
            </div>
            
            <div className="flex gap-2">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2.5 rounded-full border border-brand-lavender/30 bg-white text-sm text-brand-brown outline-none cursor-pointer">
                <option value="Todos">Categorias</option>
                {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2.5 rounded-full border border-brand-lavender/30 bg-white text-sm text-brand-brown outline-none cursor-pointer">
                <option value="recent">Recentes</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-lavender border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-brand-lavender-dark font-serif italic">Carregando acervo...</p>
          </div>
        ) : (
          <>
            {/* GRID CORRIGIDO: 2 colunas no celular, 3 no tablet, 4 no desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {currentItems.map((work) => (
                <div key={work.id} className="group flex flex-col">
                  <div 
                    className="relative aspect-[3/4] overflow-hidden rounded-sm bg-white shadow-sm mb-3 cursor-pointer"
                    onClick={() => navigate(`/item/${work.id}`, { state: { work } })}
                  >
                    <img src={work.image} alt={work.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm px-2 py-1 text-[9px] uppercase tracking-widest font-bold text-brand-lavender-dark">
                        {work.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-start mb-3 min-h-[50px]">
                    <h3 className="text-lg font-serif text-brand-brown group-hover:text-brand-lavender-dark transition-colors leading-tight">
                      {work.title}
                    </h3>
                    <div className="text-right ml-2">
                     
                      
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate(`/item/${work.id}`, { state: { work } })}
                    className="w-full py-2.5 rounded-full border border-brand-lavender-dark text-brand-lavender-dark text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-brand-lavender-dark hover:text-white transition-all duration-300"
                  >
                    Ver Detalhes
                  </button>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-20">
                <button disabled={currentPage === 1} onClick={() => {setCurrentPage(prev => prev - 1); window.scrollTo(0,0);}} className="p-2 disabled:opacity-30 text-brand-lavender-dark">
                  <ChevronLeft size={24} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} onClick={() => {setCurrentPage(i + 1); window.scrollTo(0,0);}} className={`w-10 h-10 rounded-full text-sm font-medium ${currentPage === i + 1 ? "bg-brand-lavender-dark text-white shadow-md" : "text-brand-brown hover:bg-brand-lavender-light"}`}>
                    {i + 1}
                  </button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => {setCurrentPage(prev => prev + 1); window.scrollTo(0,0);}} className="p-2 disabled:opacity-30 text-brand-lavender-dark">
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}