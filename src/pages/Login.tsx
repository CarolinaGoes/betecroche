import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Sparkles, Heart, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginBete() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin"); 
    } catch (err: any) {
      setError("Ops! E-mail ou senha incorretos. Tente de novo, Bete! 🧶");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7FF] flex items-center justify-center p-4 font-sans text-gray-700">
      <div className="fixed top-10 left-10 text-[#D8B4FE] animate-pulse hidden md:block">
        <Heart size={40} fill="currentColor" />
      </div>
      
      <div className="fixed bottom-10 right-10 text-[#D8B4FE] animate-bounce hidden md:block">
        <Sparkles size={40} />
      </div>

      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl overflow-hidden border-4 border-[#F3E8FF]">
        <div className="bg-[#A855F7] p-8 text-center text-white relative">
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white p-3 rounded-full shadow-lg text-[#A855F7]">
            <Lock size={28} />
          </div>
          <h1 className="text-3xl font-serif font-bold mb-2">Olá, Bete! 💜</h1>
          <p className="text-purple-50 font-medium">Pronta para postar seus crochês?</p>
        </div>

        <form id="login-form" onSubmit={handleLogin} className="p-10 pt-12 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 text-center italic">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-bold text-[#7E22CE] ml-2 uppercase tracking-widest">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C084FC]" size={20} />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com" 
                className="w-full pl-12 pr-4 py-4 bg-[#FAF5FF] border-2 border-transparent focus:border-[#D8B4FE] rounded-2xl outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-bold text-[#7E22CE] ml-2 uppercase tracking-widest">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C084FC]" size={20} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha aqui" 
                className="w-full pl-12 pr-12 py-4 bg-[#FAF5FF] border-2 border-transparent focus:border-[#D8B4FE] rounded-2xl outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C084FC] hover:text-[#A855F7] transition-colors"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold py-4 rounded-2xl text-lg shadow-lg shadow-purple-100 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? "Entrando..." : (
              <>
                ENTRAR NO PAINEL 
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-gray-400 text-sm font-medium">
            Feito com <Heart size={14} className="inline text-[#D8B4FE] mx-1" fill="currentColor" /> para Bete
          </p>
        </form>
      </div>
    </div>
  );
}