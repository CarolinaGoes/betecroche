import React, { useState, useEffect } from "react";
import { db } from "../firebase"; 
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  setDoc
} from "firebase/firestore";
import { Plus, Trash2, Edit2, Save, Image as ImageIcon, CheckCircle, FolderPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
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

  // 1. Monitorar ITENS e CATEGORIAS
  useEffect(() => {
    // Escuta Peças
    const qItems = query(collection(db, "artworks"), orderBy("date", "desc"));
    const unsubItems = onSnapshot(qItems, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // CORREÇÃO: Escuta o documento exato onde estão as categorias (settings/categories)
    const unsubCats = onSnapshot(doc(db, "settings", "categories"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        // Garante que estamos pegando a array chamada 'list'
        setCategories(data.list || []);
      } else {
        // Se o documento não existir, inicializa vazio
        setCategories([]);
      }
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

  // 2. Adicionar categoria na ARRAY 'list'
  const handleAddCategory = async (e: React.MouseEvent) => {
    e.preventDefault();
    const cleanName = newCategoryName.trim();
    if (cleanName === "" || categories.includes(cleanName)) return;

    try {
      const newCategories = [...categories, cleanName];
      // Salva no caminho settings -> categories -> campo list
      await setDoc(doc(db, "settings", "categories"), { list: newCategories });
      setNewCategoryName("");
      setMessage("✅ Categoria salva!");
    } catch (error) {
      console.error(error);
      setMessage("❌ Erro ao salvar categoria.");
    }
    setTimeout(() => setMessage(""), 2000);
  };

  // 3. Remover categoria da ARRAY 'list'
  const handleRemoveCategory = async (catToRemove: string) => {
    if (window.confirm(`Remover "${catToRemove}"?`)) {
      try {
        const newCategories = categories.filter(c => c !== catToRemove);
        await setDoc(doc(db, "settings", "categories"), { list: newCategories });
        if (category === catToRemove) setCategory("");
        setMessage("🗑️ Removida!");
      } catch (error) {
        setMessage("❌ Erro ao remover.");
      }
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "artworks", id), { status: newStatus });
      setMessage("✅ Status atualizado!");
    } catch (error) {
      setMessage("❌ Erro no status.");
    }
    setTimeout(() => setMessage(""), 2000);
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
        setMessage("✅ Publicado!");
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
          <p className="text-gray-500 mt-1 font-medium">Controle de Acervo</p>
        </header>

        {message && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-white border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2 font-bold">
            <CheckCircle size={20} /> {message}
          </div>
        )}

        {/* POSTAR / EDITAR PEÇA */}
        <section className="bg-white rounded-3xl shadow-lg p-6 mb-8 border border-purple-100">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-purple-900 font-serif">
            {isEditing ? <Edit2 size={24} /> : <Plus size={24} />} 
            {isEditing ? "Editar Peça" : "Nova Peça"}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className="w-full p-3 rounded-xl border bg-purple-50/30 outline-none focus:border-purple-400" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" rows={2} className="w-full p-3 rounded-xl border bg-purple-50/30 outline-none focus:border-purple-400" />
            
            <div className="grid grid-cols-2 gap-4">
              <input type="text" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Preço (R$)" className="p-3 rounded-xl border bg-purple-50/30 outline-none" />
              <select required value={category} onChange={(e) => setCategory(e.target.value)} className="p-3 rounded-xl border bg-purple-50/30 outline-none">
                <option value="">Categoria...</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl border-2 border-dashed border-purple-200 text-center">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <ImageIcon size={24} className="mx-auto mb-1 text-purple-400" />
                <span className="text-sm font-bold text-purple-600 block">{fileName || "Escolher Foto"}</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white p-4 rounded-xl font-bold hover:bg-purple-700 transition-all flex justify-center gap-2">
              <Save size={20}/> {isEditing ? "Atualizar" : "Publicar"}
            </button>
          </form>
        </section>

        {/* GERENCIAR CATEGORIAS */}
        <section className="bg-white rounded-3xl shadow-md p-6 mb-10 border border-purple-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-800 font-serif">
            <FolderPlus size={22} /> Categorias
          </h2>
          <div className="flex gap-2 mb-6">
            <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Nova categoria..." className="flex-1 p-3 rounded-xl border bg-purple-50/30 outline-none" />
            <button onClick={handleAddCategory} className="bg-purple-600 text-white px-6 rounded-xl font-bold hover:bg-purple-700">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <div key={cat} className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100 text-purple-700 font-medium">
                {cat}
                <button onClick={() => handleRemoveCategory(cat)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </section>

        {/* LISTAGEM */}
        <section className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-purple-50 flex gap-4 items-center">
              <img src={item.image} className="w-20 h-20 object-cover rounded-xl shadow-sm" alt="" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{item.title}</h3>
                <p className="text-purple-600 font-bold">R$ {Number(item.price).toFixed(2)}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => updateStatus(item.id, "disponivel")} className={`text-[10px] px-2 py-1 rounded font-bold border ${item.status === 'disponivel' ? 'bg-green-500 text-white' : 'text-green-500'}`}>Disponível</button>
                  <button onClick={() => updateStatus(item.id, "vendido")} className={`text-[10px] px-2 py-1 rounded font-bold border ${item.status === 'vendido' ? 'bg-red-500 text-white' : 'text-red-500'}`}>Vendido</button>
                  <button onClick={() => { setIsEditing(item.id); setTitle(item.title); setPrice(item.price.toString()); setCategory(item.category); window.scrollTo(0,0); }} className="text-[10px] px-2 py-1 rounded font-bold border bg-gray-50">Editar</button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}