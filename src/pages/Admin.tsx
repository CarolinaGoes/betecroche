import React, { useState, useEffect, useRef } from "react";
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
import { Plus, Trash2, Edit2, Save, Image as ImageIcon, FolderPlus, Ruler, ExternalLink, Eye } from "lucide-react";

export default function Admin() {
  const formRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dimensions, setDimensions] = useState(""); 
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
    setCategory(item.category);
    setFileName("Imagem atual preservada");

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setMessage("✏️ Editando: " + item.title);
    setTimeout(() => setMessage(""), 3000);
  };

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setDimensions("");
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
    <div className="min-h-screen bg-[#FDF7FF] p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto">
        
        {/* BOTÃO PARA O SITE NO TOPO */}
        <div className="flex justify-center mb-6">
          <a 
            href="https://betemartins.vercel.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-purple-100 text-purple-700 px-8 py-4 rounded-full text-xl font-black border-2 border-purple-300 hover:bg-purple-200 transition-all shadow-sm"
          >
            <Eye size={28} />
            VER MEU SITE
            <ExternalLink size={20} />
          </a>
        </div>

        <header ref={formRef} className="mb-10 text-center text-purple-700">
          <h1 className="text-5xl md:text-6xl font-serif font-bold italic">Painel da Bete 💜</h1>
          <p className="text-2xl mt-2 font-medium text-purple-500/80">Administração de Peças</p>
        </header>

        {message && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-white border-4 border-purple-600 text-purple-700 px-8 py-4 rounded-3xl shadow-2xl z-50 text-2xl font-bold">
            {message}
          </div>
        )}

        {/* FORMULÁRIO PRINCIPAL */}
        <section className={`bg-white rounded-[40px] shadow-2xl p-8 mb-12 border-4 transition-all duration-300 ${isEditing ? 'border-orange-400 ring-8 ring-orange-50' : 'border-purple-100'}`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-8 flex items-center gap-3 text-purple-900 font-serif">
            {isEditing ? <Edit2 size={36} className="text-orange-500" /> : <Plus size={36} />}
            {isEditing ? "Editar Peça" : "Nova Peça"}
          </h2>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label className="text-2xl font-bold text-gray-700 ml-2">Nome da Peça</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Tapete de Sala" className="w-full p-6 text-2xl rounded-2xl border-2 border-purple-100 bg-purple-50/30 outline-none focus:border-purple-500" />
            </div>

            <div className="space-y-2">
              <label className="text-2xl font-bold text-gray-700 ml-2">Descrição</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes (cor, linha, etc)..." rows={3} className="w-full p-6 text-2xl rounded-2xl border-2 border-purple-100 bg-purple-50/30 outline-none focus:border-purple-500" />
            </div>
            
            <div className="space-y-2">
              <label className="text-2xl font-bold text-gray-700 ml-2">Tamanho / Medidas</label>
              <div className="relative">
                <Ruler size={28} className="absolute left-4 top-6 text-purple-400" />
                <input type="text" value={dimensions} onChange={(e) => setDimensions(e.target.value)} placeholder="Ex: 60cm de largura" className="w-full p-6 pl-16 text-2xl rounded-2xl border-2 border-purple-100 bg-purple-50/30 outline-none focus:border-purple-500" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-2xl font-bold text-gray-700 ml-2">Categoria</label>
              <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-6 text-2xl rounded-2xl border-2 border-purple-100 bg-purple-50/30 outline-none focus:border-purple-500">
                <option value="">Escolha uma...</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="bg-purple-100/50 p-10 rounded-2xl border-4 border-dashed border-purple-300 text-center">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <ImageIcon size={50} className="mx-auto mb-3 text-purple-500" />
                <span className="text-2xl font-black text-purple-700 block leading-tight">{fileName || "Escolha a foto da peça"}</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className={`w-full ${isEditing ? 'bg-orange-500' : 'bg-purple-600'} text-white p-7 rounded-3xl text-3xl font-black shadow-xl hover:brightness-110 active:scale-95 transition-all`}>
              <Save size={32} className="inline mr-3"/> {loading ? "Salvando..." : isEditing ? "Salvar Alteração" : "Publicar no Site"}
            </button>
            
            {isEditing && (
              <button type="button" onClick={clearForm} className="w-full text-gray-500 text-2xl font-bold py-2 underline">Cancelar e fazer uma nova</button>
            )}
          </form>
        </section>

        {/* CATEGORIAS */}
        <section className="bg-white rounded-[40px] shadow-lg p-8 mb-12 border-4 border-purple-100">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-purple-800 font-serif">
            <FolderPlus size={32} /> Criar Categorias
          </h2>
          <div className="flex flex-col gap-4 mb-8">
            <input 
              type="text" 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)} 
              placeholder="Ex: Banheiro, Cozinha..." 
              className="w-full p-6 text-2xl rounded-2xl border-2 border-purple-100 outline-none focus:border-purple-400" 
            />
            <button 
              onClick={handleAddCategory} 
              className="w-full bg-purple-700 text-white p-6 rounded-2xl text-2xl font-black hover:bg-purple-800 transition-colors shadow-lg"
            >
              ADICIONAR CATEGORIA
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            {categories.map(cat => (
              <div key={cat} className="flex items-center gap-4 bg-purple-50 px-6 py-4 rounded-2xl border-2 border-purple-100 text-purple-700 text-2xl font-bold">
                {cat}
                <button onClick={() => handleRemoveCategory(cat)} className="text-red-400 hover:text-red-600"><Trash2 size={30} /></button>
              </div>
            ))}
          </div>
        </section>

        {/* LISTA */}
        <section className="space-y-8 pb-32">
          <h2 className="text-4xl font-black text-purple-900 font-serif mb-8 text-center md:text-left">Peças Cadastradas</h2>
          {items.map(item => (
            <div key={item.id} className={`bg-white p-6 rounded-[40px] shadow-md border-4 flex flex-col gap-6 items-center transition-all ${isEditing === item.id ? 'border-orange-400 bg-orange-50/30' : 'border-purple-50'}`}>
              <img src={item.image} className="w-full md:w-60 h-60 object-cover rounded-[30px] shadow-inner" alt="" />
              <div className="flex-1 w-full text-center md:text-left">
                <h3 className="text-3xl font-black text-gray-800 mb-2">{item.title}</h3>
                {item.dimensions && <p className="text-2xl text-gray-500 mb-6 font-bold">📏 {item.dimensions}</p>}
                
                <div className="grid grid-cols-1 gap-3 mb-8">
                  <button onClick={() => updateStatus(item.id, "disponivel")} className={`p-5 rounded-2xl text-xl font-black border-4 ${item.status === 'disponivel' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'text-green-600 border-green-200 bg-green-50'}`}>DISPONÍVEL AGORA</button>
                  <button onClick={() => updateStatus(item.id, "encomenda")} className={`p-5 rounded-2xl text-xl font-black border-4 ${item.status === 'encomenda' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'text-blue-600 border-blue-200 bg-blue-50'}`}>POR ENCOMENDA</button>
                  <button onClick={() => updateStatus(item.id, "vendido")} className={`p-5 rounded-2xl text-xl font-black border-4 ${item.status === 'vendido' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'text-red-600 border-red-200 bg-red-50'}`}>JÁ FOI VENDIDO</button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-6 border-t-4 border-gray-100">
                  <button onClick={() => handleEditClick(item)} className="flex-1 flex items-center justify-center gap-3 bg-gray-200 text-gray-800 p-6 rounded-2xl text-2xl font-black hover:bg-orange-400 hover:text-white transition-all">
                    <Edit2 size={28} /> ALTERAR PEÇA
                  </button>
                  <button onClick={() => handleDeleteItem(item.id)} className="flex items-center justify-center gap-3 bg-red-100 text-red-600 p-6 rounded-2xl text-2xl font-black hover:bg-red-600 hover:text-white transition-all">
                    <Trash2 size={28} /> APAGAR
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}