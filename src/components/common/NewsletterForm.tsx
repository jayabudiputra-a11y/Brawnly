import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!email) return;

    // SIMPAN EMAIL SEMENTARA (opsional)
    localStorage.setItem("pending_subscribe_email", email);

    // ARAHKAN KE SIGNUP / LOGIN
    navigate("/signup");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your.email@example.com"
        required
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700"
      >
        Subscribe
      </button>
    </form>
  );
};

export default NewsletterForm;
