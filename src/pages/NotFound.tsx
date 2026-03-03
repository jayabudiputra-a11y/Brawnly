import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Dumbbell, Home } from "lucide-react";

const NotFound = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] text-black dark:text-white px-6 text-center">
      <Helmet>
        <title>404 - Page Not Found | Brawnly</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      
      <Dumbbell size={80} className="text-red-600 mb-8 animate-bounce" />
      
      <h1 className="text-[100px] md:text-[150px] font-black uppercase italic leading-none tracking-tighter mb-4 drop-shadow-xl">
        404
      </h1>
      
      <p className="text-xl md:text-2xl font-serif italic text-neutral-600 dark:text-neutral-400 mb-10 max-w-md">
        Page not found. Maybe it's doing push-ups somewhere?
      </p>
      
      <Link 
        to="/"
        className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 font-black uppercase text-[12px] tracking-[0.2em] flex items-center gap-3 hover:invert active:scale-95 transition-all shadow-2xl"
      >
        <Home size={18} /> Return to Base
      </Link>
    </main>
  );
};

export default NotFound;