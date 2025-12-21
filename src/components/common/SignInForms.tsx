// src/components/SignInForm.tsx
import React, { useState } from "react";
import { authApi } from "@/lib/api";
import { useNavigate, Link } from "react-router-dom";

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400" {...props}>
    {children}
  </button>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input className="w-full border rounded p-2" {...props} />
);

const SignInForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Memanggil fungsi signIn yang sudah kita buat di api.ts
      // Fungsi ini akan otomatis memanggil subscribersApi.insertIfNotExists
      await authApi.signIn(email, password);
      
      // Jika berhasil, arahkan ke halaman utama
      navigate('/');
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">Sign In</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <Input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Signing In..." : "Sign In"}
      </Button>
      <p className="text-sm text-gray-600">
        Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign Up</Link>
      </p>
    </form>
  );
};

export default SignInForm;