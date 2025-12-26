import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Simpan email agar bisa diambil oleh SignUpForm
    localStorage.setItem("pending_subscribe_email", email);

    // Arahkan ke halaman pendaftaran
    navigate("/signup");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your.email@example.com"
        required
        className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-emerald-600 text-white font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 whitespace-nowrap"
      >
        Subscribe
      </button>
    </form>
  );
};

export default NewsletterForm;