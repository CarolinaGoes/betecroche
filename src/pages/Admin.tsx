import React, { useState, useEffect } from "react";
import { db } from "../firebase"; 
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, orderBy, getDocs, where } from "firebase/firestore";
import { Plus, Trash2, Edit2, Save, Image as ImageIcon, CheckCircle, FolderPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]); // Agora inicia vazio e vem do banco
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageEncoded, setImageEncoded] = useState<string | null>(null);
  const [fileName, setFileName] = useState(""); 
  const [newCategoryName, setNewCategoryName] = useState("");

  // 1. Monitorar ITENS e CATEGORIAS do Firebase em tempo real
  useEffect(() => {
    // Escuta Itens
    const qItems = query(collection(db, "artworks"), orderBy("date", "desc"));
    const unsubItems = onSnapshot(qItems, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Escuta Categorias
    const qCats = query(collection(db, "categories"), orderBy("name", "asc"));
    const unsubCats = onSnapshot(qCats, (snapshot) => {
      const catsFromDb = snapshot.docs.map(doc => doc.data().name);
      setCategories(catsFromDb);
    });

    return () => {
      unsubItems();
      unsubCats();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 800; 
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          setImageEncoded(canvas.toDataURL("image/jpeg", 0.6));
        };
      };
    }
  };

  // 2. Adicionar categoria ao FIREBASE
  const handleAddCategory = async (e: React.MouseEvent) => {
    e.preventDefault();
    const cleanName = newCategoryName.trim();
    if (cleanName === "") return;
    if (categories.includes(cleanName)) {
      setMessage("⚠️ Essa categoria já existe!");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    try {
      await addDoc(collection(db, "categories"), { name: cleanName });
      setNewCategoryName("");
      setMessage("✅ Categoria salva no banco!");
    } catch (error) {
      setMessage("❌ Erro ao salvar categoria.");
    }
    setTimeout(() => setMessage(""), 2000);
  };

  // 3. Remover categoria do FIREBASE
  const handleRemoveCategory = async (catToRemove: string) => {
    if (window.confirm(`Deseja mesmo remover a categoria "${catToRemove}"?`)) {
      try {
        const q = query(collection(db, "categories"), where("name", "==", catToRemove));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (documento) => {
          await deleteDoc(doc(db, "categories", documento.id));
        });
        if (category === catToRemove) setCategory("");
        setMessage("🗑️ Categoria removida!");
      } catch (error) {
        setMessage("❌ Erro ao remover.");
      }
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "artworks", id), { status: newStatus });
      setMessage("✅ Status alterado!");
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      setMessage("❌ Erro ao mudar status.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data: any = {
        title,
        description,
        price: parseFloat(price.replace(",", ".")),
        category,
        date: new Date().toISOString(),
      };
      if (imageEncoded) data.image = imageEncoded;

      if (isEditing) {
        await updateDoc(doc(db, "artworks", isEditing), data);
        setMessage("✅ Peça atualizada!");
      } else {
        if (!imageEncoded) throw new Error("Foto obrigatória");
        data.status = "disponivel";
        await addDoc(collection(db, "artworks"), data);
        setMessage("✅ Peça publicada!");
      }
      setTitle(""); setDescription(""); setPrice(""); setCategory(""); setImageEncoded(null); setFileName(""); setIsEditing(null);
    } catch (error) {
      setMessage("❌ Erro ao salvar.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7FF] p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-8 text-center text-purple-600">
          <h1 className="text-4xl font-serif font-bold italic">Painel da Bete 💜</h1>
          <p className="text-gray-500 mt-1 font-medium">Gerencie suas categorias e peças</p>
        </header>

        {message && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-white border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2 font-bold animate-pulse">
            <CheckCircle size={20} /> {message}
          </div>
        )}

        <section className="bg-white rounded-4xl shadow-lg p-6 md:p-8 mb-8 border-4 border-white">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-purple-900 font-serif">
            {isEditing ? <Edit2 size={24} className="text-purple-500" /> : <Plus size={24} className="text-purple-500" />} 
            {isEditing ? "Editar Detalhes" : "Postar Novo Crochê"}
          </h2>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-purple-700 ml-2 mb-2 uppercase tracking-wide">Nome da Peça</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Jogo de Banheiro Luxo" className="w-full p-4 text-lg rounded-2xl border-2 border-purple-50 focus:border-purple-300 outline-none bg-purple-50/30 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-bold text-purple-700 ml-2 mb-2 uppercase tracking-wide">Descrição detalhada</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Feito com barbante fio 6..." rows={3} className="w-full p-4 text-lg rounded-2xl border-2 border-purple-50 focus:border-purple-300 outline-none bg-purple-50/30 transition-all resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-purple-700 ml-2 mb-2 uppercase tracking-wide">Preço (R$)</label>
                <input type="text" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" className="w-full p-4 text-lg rounded-2xl border-2 border-purple-50 focus:border-purple-300 outline-none bg-purple-50/30" />
              </div>
              <div>
                <label className="block text-sm font-bold text-purple-700 ml-2 mb-2 uppercase tracking-wide">Categoria</label>
                <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-4 text-lg rounded-2xl border-2 border-purple-50 outline-none bg-purple-50/30 text-gray-600">
                  <option value="">Selecione...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-purple-100/50 p-6 rounded-2xl border-2 border-dashed border-purple-300 text-center">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <ImageIcon size={32} className="text-purple-500 mx-auto mb-2" />
                <span className="text-purple-700 font-bold block text-lg">{fileName ? `Foto: ${fileName}` : "Selecionar Foto"}</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white p-5 rounded-2xl text-xl font-bold hover:bg-purple-700 shadow-xl transition-all flex justify-center items-center gap-2">
              <Save size={24}/> {isEditing ? "Salvar Alterações" : "Publicar Peça"}
            </button>
          </form>
        </section>

        {/* ORGANIZAR CATEGORIAS */}
        <section className="bg-white rounded-4xl shadow-md p-6 md:p-8 mb-10 border-2 border-purple-50">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-800 font-serif">
            <FolderPlus size={22} /> Gerenciar Categorias no Banco
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <input 
              type="text" 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Ex: Tapetes de Sala"
              className="flex-1 p-3 rounded-xl border-2 border-purple-50 focus:border-purple-200 outline-none bg-purple-50/20"
            />
            <button onClick={handleAddCategory} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all">
              Salvar Categoria
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <div key={cat} className="flex items-center gap-2 bg-purple-50 border border-purple-100 px-3 py-2 rounded-xl text-purple-700 font-medium">
                {cat}
                <button onClick={() => handleRemoveCategory(cat)} className="text-red-400 hover:text-red-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* LISTA DE ITEMS */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-purple-900 font-serif ml-2 mb-6">Peças no Site:</h2>
          {items.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-[30px] shadow-md border-2 border-white flex flex-col md:flex-row gap-6 items-center">
              <div className="flex flex-1 items-center gap-5 cursor-pointer w-full" onClick={() => navigate(`/item/${item.id}`, { state: { work: item } })}>
                <img src={item.image} className="w-28 h-28 object-cover rounded-[20px] shadow-md" alt={item.title} />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 leading-tight">{item.title}</h3>
                  <p className="text-purple-400 text-sm mb-1 uppercase tracking-tighter">{item.category}</p>
                  <p className="text-purple-600 font-black text-2xl">R$ {Number(item.price).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-auto md:border-l border-purple-50 md:pl-6">
                <div className="flex flex-wrap gap-2 justify-center">
                  <button onClick={() => updateStatus(item.id, "disponivel")} className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${item.status === 'disponivel' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-green-500 border-green-100'}`}>Disponível</button>
                  <button onClick={() => updateStatus(item.id, "vendido")} className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${item.status === 'vendido' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-red-500 border-red-100'}`}>Vendido</button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setIsEditing(item.id); setTitle(item.title); setDescription(item.description || ""); setPrice(item.price.toString()); setCategory(item.category); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex-1 py-2 bg-gray-50 text-gray-500 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border border-gray-100"><Edit2 size={14}/> EDITAR</button>
                  <button onClick={() => { if(window.confirm("Apagar peça?")) deleteDoc(doc(db, "artworks", item.id)); }} className="flex-1 py-2 bg-gray-50 text-gray-400 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border border-gray-100"><Trash2 size={14}/> APAGAR</button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}