import React, { useState } from "react";
import { authApi } from "@/lib/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

/* ======================
    UI COMPONENTS
====================== */

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button 
    className="w-full bg-emerald-600 text-white px-4 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em]
               hover:bg-emerald-700 disabled:bg-gray-400 transition-all shadow-lg shadow-emerald-500/10 active:scale-95" 
    {...props}
  >
    {children}
  </button>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 text-center text-lg placeholder:text-gray-200" 
    {...props} 
  />
);

/* ======================
    SIGN IN FORM
====================== */

const SignInForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Selaraskan pengambilan data sesuai dengan return di api.ts
      const result = await authApi.signInWithEmailOnly(email);
      
      if (result?.session || result?.user) {
        toast.success("Berhasil Masuk!", {
          description: "Selamat datang kembali di Fitapp."
        });

        // REVISI: Berikan sedikit waktu agar toast terlihat sebelum redirect
        setTimeout(() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/');
          }
          
          // Refresh untuk memastikan session terdeteksi di CommentSection
          setTimeout(() => {
            window.location.reload();
          }, 200);
        }, 1000);
      }
    } catch (err: any) {
      console.error("SIGN IN ERROR:", err);
      // Mapping error message agar user tidak bingung
      const msg = err.message?.includes("Invalid login credentials") 
        ? "Email tidak ditemukan atau password salah. Silakan daftar jika belum punya akun." 
        : "Gagal masuk. Silakan periksa koneksi atau email Anda.";
      
      setError(msg);
      toast.error("Gagal Masuk", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Welcome Back</h2>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.2em] mt-2">Masuk untuk lanjut diskusi</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-black uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="block text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
            Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="email@anda.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="pt-4">
          <Button type="submit" disabled={loading || !email}>
            {loading ? "Memverifikasi..." : "Masuk Sekarang"}
          </Button>
        </div>

        <div className="text-center mt-6">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">
            Belum punya akun?{" "}
            <Link 
              to="/signup"  // REVISI: Diarahkan ke /signup agar konsisten
              className="text-emerald-600 font-black hover:underline not-italic ml-1"
            >
              Daftar Disini
            </Link>
          </p>
        </div>
        
        {/* Visual Decor */}
        <div className="flex justify-center gap-1.5 pt-4">
            <div className="h-1 w-1 bg-gray-200 rounded-full"></div>
            <div className="h-1 w-4 bg-emerald-500 rounded-full"></div>
            <div className="h-1 w-1 bg-gray-200 rounded-full"></div>
        </div>
      </form>
    </div>
  );
};

export default SignInForm;