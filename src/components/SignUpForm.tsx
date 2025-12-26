import React, { useState, useEffect } from "react";
import { authApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/* ======================
    UI COMPONENTS
====================== */

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  ...props
}) => (
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
    className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 placeholder:text-gray-300"
    {...props}
  />
);

/* ======================
    SIGN UP FORM
====================== */

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Ambil email dari newsletter yang tersimpan di localStorage
  useEffect(() => {
    const pendingEmail = localStorage.getItem("pending_subscribe_email");
    if (pendingEmail) {
      setFormData((prev) => ({ ...prev, email: pendingEmail }));
      // Jangan hapus dulu, hapus setelah sukses submit agar tidak hilang jika page reload
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Menjalankan signUp yang sudah direvisi (dengan upsert user_profiles)
      const { user } = await authApi.signUp({
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      if (user) {
        localStorage.removeItem("pending_subscribe_email");
        setSuccess(true);
        
        toast.success("Berhasil Terdaftar!", {
          description: `Halo ${formData.name}, selamat bergabung di Fitapp.`
        });
        
        // Timer untuk memberikan efek visual sukses sebelum redirect
        setTimeout(() => {
          // Navigasi kembali ke halaman artikel agar bisa langsung komen
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/');
          }
          
          // REVISI: Berikan delay sedikit lebih lama agar session benar-benar tersimpan
          setTimeout(() => {
            window.location.reload();
          }, 200);
        }, 2000);
      }
    } catch (err: any) {
      console.error("SIGN UP ERROR:", err);
      // Menangani error password lemah atau email sudah ada
      const errorMessage = err?.message || "Terjadi kesalahan saat mendaftar.";
      setError(errorMessage);
      toast.error("Gagal Mendaftar", { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-12 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-emerald-900 leading-none">Success!</h2>
        <p className="mt-3 text-emerald-700 font-medium text-sm">
          Akun Anda telah aktif. Siapkan komentar terbaik Anda!
        </p>
        <div className="mt-8 flex justify-center gap-1">
          <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
          <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100"
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-gray-900">Join the Club</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Daftar instan & mulai diskusi</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-black uppercase tracking-wider text-center">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Nama Lengkap</label>
            <Input
              name="name"           
              type="text"
              placeholder="Masukkan nama Anda"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Email Address</label>
            <Input
              name="email"             
              type="email"
              placeholder="email@anda.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mt-8">
          <Button type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Aktifkan Akun & Komen"}
          </Button>
        </div>
        
        <div className="flex flex-col items-center gap-3 mt-8">
          <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.2em]">
            Tanpa Password • Tanpa Ribet
          </p>
          <div className="h-1 w-6 bg-emerald-100 rounded-full"></div>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;