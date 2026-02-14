import React, { useState as _s, type FormEvent as _FE } from "react";
import { useNavigate as _uN } from "react-router-dom";

const NewsletterForm: React.FC = () => {
  const [_e, _se] = _s("");
  const _n = _uN();

  const _hS = (e: _FE) => {
    e.preventDefault();
    if (!_e) return;
    localStorage.setItem("pending_subscribe_email", _e);
    _n("/signup");
  };

  return (
    <form onSubmit={_hS} className="flex flex-col sm:flex-row gap-2 max-w-md">
      {/* Hidden Label for Accessibility */}
      <label htmlFor="newsletter-email-input" className="sr-only">
        Email Address
      </label>
      
      <input
        type="email"
        id="newsletter-email-input" // FIX: Unique ID
        name="newsletter_email"      // FIX: Name attribute for browser autofill
        value={_e}
        onChange={(e) => _se(e.target.value)}
        placeholder="your.email@example.com"
        required
        aria-label="Email address for newsletter"
        className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-black dark:text-white focus:ring-2 focus:ring-emerald-600 outline-none transition-all placeholder:text-neutral-500"
      />
      
      <button
        type="submit"
        className="px-6 py-2 bg-emerald-700 text-white font-black uppercase text-[10px] tracking-[.15em] rounded-xl hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/10 active:scale-95 whitespace-nowrap"
      >
        Subscribe
      </button>
    </form>
  );
};

export default NewsletterForm;