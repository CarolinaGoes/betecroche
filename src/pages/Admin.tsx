import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy,
  setDoc,
  deleteDoc as firestoreDeleteDoc
} from "firebase/firestore";
import { Plus, Trash2, Edit2, Save, Image as ImageIcon, CheckCircle, FolderPlus, Ruler } from "lucide-react";

export default function Admin() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dimensions, setDimensions] = useState(""); 
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageEncoded, setImageEncoded] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    const qItems = query(collection(db, "artworks"), orderBy("date", "desc"));
    const unsubItems = onSnapshot(qItems, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubCats = onSnapshot(doc(db, "settings", "categories"), (snapshot) => {
      if (snapshot.exists()) {
        setCategories(snapshot.data().list || []);
      }
    });

    return () => { unsubItems(); unsubCats(); };
  }, []);

  const handleEditClick = (item: any) => {
    setIsEditing(item.id);
    setTitle(item.title);
    setDescription(item.description || "");
    setDimensions(item.dimensions || "");
    setPrice(item.price.toString());
    setCategory(item.category);
    setFileName("Imagem atual preservada");

    // Scroll para o topo garantido
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);

    setMessage("✏️ Modo de edição ativado");
    setTimeout(() => setMessage(""), 3000);
  };

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setDimensions("");
    setPrice("");
    setCategory("");
    setImageEncoded(null);
    setFileName("");
    setIsEditing(null);
  };

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data: any = {
        title,
        description,
        dimensions,
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
      clearForm();
    } catch (error) {
      setMessage("❌ Erro ao salvar.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 4000);
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

  const handleDeleteItem = async (id: string) => {
    if (window.confirm("Apagar peça permanentemente?")) {
      try {
        await firestoreDeleteDoc(doc(db, "artworks", id));
        setMessage("🗑️ Peça removida!");
      } catch (error) {
        setMessage("❌ Erro ao apagar.");
      }
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleAddCategory = async (e: React.MouseEvent) => {
    e.preventDefault();
    const cleanName = newCategoryName.trim();
    if (!cleanName || categories.includes(cleanName)) return;
    try {
      const newCats = [...categories, cleanName];
      await setDoc(doc(db, "settings", "categories"), { list: newCats });
      setNewCategoryName("");
      setMessage("✅ Categoria adicionada!");
    } catch (error) {
      setMessage("❌ Erro na categoria.");
    }
    setTimeout(() => setMessage(""), 2000);
  };

  const handleRemoveCategory = async (catToRemove: string) => {
    if (window.confirm(`Remover "${catToRemove}"?`)) {
      try {
        const newCats = categories.filter(c => c !== catToRemove);
        await setDoc(doc(db, "settings", "categories"), { list: newCats });
        setMessage("🗑️ Categoria removida!");
      } catch (error) {
        setMessage("❌ Erro ao remover.");
      }
      setTimeout(() => setMessage(""), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7FF] p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center text-purple-600">
          <h1 className="text-4xl font-serif font-bold italic">Painel da Bete 💜</h1>
        </header>

        {message && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-white border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-2xl shadow-2xl z-50 font-bold">
            <CheckCircle size={20} className="inline mr-2" /> {message}
          </div>
        )}

        <section className={`bg-white rounded-3xl shadow-lg p-6 mb-8 border transition-all duration-300 ${isEditing ? 'border-orange-400 ring-2 ring-orange-50' : 'border-purple-100'}`}>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-purple-900 font-serif">
            {isEditing ? <Edit2 size={24} className="text-orange-500" /> : <Plus size={24} />}
            {isEditing ? "Editar Detalhes da Peça" : "Nova Peça"}
          </h2>
          
          <form onSubmit={handleSave} className="space-y-4">
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className="w-full p-3 rounded-xl border bg-purple-50/30 outline-none focus:border-purple-400" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" rows={2} className="w-full p-3 rounded-xl border bg-purple-50/30 outline-none focus:border-purple-400" />
            
            <div className="relative">
              <Ruler size={18} className="absolute left-3 top-3.5 text-purple-300" />
              <input type="text" value={dimensions} onChange={(e) => setDimensions(e.target.value)} placeholder="Medidas (ex: 30x40cm)" className="w-full p-3 pl-10 rounded-xl border bg-purple-50/30 outline-none focus:border-purple-400" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input type="text" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Preço (R$)" className="p-3 rounded-xl border bg-purple-50/30 outline-none focus:border-purple-400" />
              <select required value={category} onChange={(e) => setCategory(e.target.value)} className="p-3 rounded-xl border bg-purple-50/30 outline-none focus:border-purple-400">
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

            <button type="submit" disabled={loading} className={`w-full ${isEditing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-600 hover:bg-purple-700'} text-white p-4 rounded-xl font-bold shadow-md transition-colors`}>
              <Save size={20} className="inline mr-2"/> {loading ? "Salvando..." : isEditing ? "Salvar Alteração" : "Publicar Peça"}
            </button>
            {isEditing && (
              <button type="button" onClick={clearForm} className="w-full text-gray-400 text-sm py-2 hover:text-red-400 transition-colors">Cancelar Edição</button>
            )}
          </form>
        </section>

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
              <div key={cat} className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100 text-purple-700">
                {cat}
                <button onClick={() => handleRemoveCategory(cat)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-purple-900 font-serif">Peças no Site</h2>
          {items.map(item => (
            <div key={item.id} className={`bg-white p-4 rounded-2xl shadow-sm border flex gap-4 items-center transition-all ${isEditing === item.id ? 'border-orange-300 ring-2 ring-orange-50' : 'border-purple-50'}`}>
              <img src={item.image} className="w-20 h-20 object-cover rounded-xl" alt="" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{item.title}</h3>
                {item.dimensions && <p className="text-[10px] text-gray-400 italic font-medium">📏 {item.dimensions}</p>}
                <p className="text-purple-600 font-bold text-sm">R$ {Number(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button onClick={() => updateStatus(item.id, "disponivel")} className={`text-[9px] px-2 py-1 rounded font-bold border transition-colors ${item.status === 'disponivel' ? 'bg-green-500 text-white border-green-500' : 'text-green-500 border-green-100 hover:bg-green-50'}`}>Disponível</button>
                  
                  <button onClick={() => updateStatus(item.id, "encomenda")} className={`text-[9px] px-2 py-1 rounded font-bold border transition-colors ${item.status === 'encomenda' ? 'bg-blue-500 text-white border-blue-500' : 'text-blue-500 border-blue-100 hover:bg-blue-50'}`}>Por Encomenda</button>
                  
                  <button onClick={() => updateStatus(item.id, "vendido")} className={`text-[9px] px-2 py-1 rounded font-bold border transition-colors ${item.status === 'vendido' ? 'bg-red-500 text-white border-red-500' : 'text-red-500 border-red-100 hover:bg-red-50'}`}>Vendido</button>
                  
                  <button onClick={() => handleEditClick(item)} className="text-[9px] px-2 py-1 rounded font-bold border bg-gray-50 text-gray-500 hover:bg-orange-50 hover:text-orange-600">Editar</button>
                  <button onClick={() => handleDeleteItem(item.id)} className="text-[9px] px-2 py-1 rounded font-bold border bg-gray-50 text-red-400 hover:bg-red-50">Apagar</button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}