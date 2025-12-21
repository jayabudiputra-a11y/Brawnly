import React, { useState } from "react";
import { authApi } from "@/lib/api";
import type { SignUpData } from "@/types";

/* ======================
   UI COMPONENTS
====================== */

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  ...props
}) => (
  <button
    className="w-full bg-green-600 text-white px-4 py-2 rounded
               hover:bg-green-700 disabled:bg-gray-400"
    {...props}
  >
    {children}
  </button>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
    {...props}
  />
);

/* ======================
   SIGN UP FORM
====================== */

const SignUpForm: React.FC = () => {
  const [formData, setFormData] = useState<SignUpData>({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /* ======================
     HANDLERS
  ====================== */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 🔍 DEBUG (boleh dihapus nanti)
      console.log("SIGN UP FORM DATA:", formData);

      await authApi.signUp({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccess(true);
    } catch (err: any) {
      console.error("SIGN UP ERROR:", err);
      setError(err?.message ?? "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     SUCCESS STATE
  ====================== */

  if (success) {
    return (
      <div className="p-6 bg-green-50 border border-green-300 rounded-lg text-center">
        <h2 className="text-xl font-semibold text-green-800">
          Account Created 🎉
        </h2>
        <p className="mt-2 text-green-700">
          Please check your email to verify your account.
        </p>
      </div>
    );
  }

  /* ======================
     FORM
  ====================== */

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto space-y-4 bg-white p-6 rounded-lg shadow"
    >

      {error && (
        <p className="text-red-600 text-sm text-center">{error}</p>
      )}

      {/* NAME */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Full Name
        </label>
        <Input
          id="name"
          name="name"              // ✅ PENTING
          type="text"
          placeholder="Your name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      {/* EMAIL */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <Input
          id="email"
          name="email"             // ✅ PENTING
          type="email"
          placeholder="you@email.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      {/* PASSWORD */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <Input
          id="password"
          name="password"          // ✅ PENTING
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Signing Up..." : "Sign Up"}
      </Button>
    </form>
  );
};

export default SignUpForm;
