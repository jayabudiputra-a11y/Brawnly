import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ShieldCheck, Database, EyeOff, Lock } from "lucide-react";
import ScrollToTopButton from "@/components/features/ScrollToTopButton";

export default function Privacy() {
  const _x = {
    root: "bg-white dark:bg-[#0a0a0a] min-h-screen pb-24 text-black dark:text-white transition-all duration-500",
    core: "max-w-[1000px] mx-auto px-5 md:px-10",
    head: "pt-24 pb-16 border-b-[12px] border-black dark:border-white mb-16",
    title: "text-[50px] md:text-[80px] leading-[0.85] font-black uppercase tracking-tighter mb-8 italic",
    subtitle: "text-[14px] font-black uppercase tracking-[0.3em] text-red-700 mb-5 block",
    card: "p-8 md:p-12 border border-neutral-200 dark:border-neutral-800 mb-8 hover:border-black dark:hover:border-white transition-colors group relative overflow-hidden",
    icon: "mb-6 text-black dark:text-white group-hover:text-red-600 transition-colors relative z-10",
    h3: "text-2xl font-black uppercase tracking-tight mb-4 relative z-10",
    p: "text-[17px] leading-relaxed font-serif text-neutral-700 dark:text-neutral-400 relative z-10",
    bgIcon: "absolute -bottom-10 -right-10 opacity-[0.03] transform rotate-12 group-hover:scale-110 transition-transform duration-500",
  };

  return (
    <main className={_x.root}>
       <Helmet>
        <title>Privacy Policy | Brawnly.online</title>
        <meta name="description" content="Privacy Policy and Data Handling for Brawnly.online." />
        <link rel="canonical" href="https://www.brawnly.online/privacy" />
      </Helmet>

      <div className={_x.core}>
        <header className={_x.head}>
          <span className={_x.subtitle}>Brawnly Data Protocol / Vol. 2026</span>
          <h1 className={_x.title}>Privacy <br/>Policy</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className={_x.card}>
            <Database size={40} className={_x.icon} />
            <Database size={200} className={_x.bgIcon} />
            <h3 className={_x.h3}>Local Storage (The Archive)</h3>
            <p className={_x.p}>
              The "Save to Collection" feature in our articles uses <strong>Browser Local Storage</strong>. This data resides 100% on your device. I do not sync your reading list to any external cloud database.
            </p>
          </div>

          <div className={_x.card}>
            <EyeOff size={40} className={_x.icon} />
            <EyeOff size={200} className={_x.bgIcon} />
            <h3 className={_x.h3}>No Tracking Pixels</h3>
            <p className={_x.p}>
              Brawnly.online prioritizes editorial integrity. I do not use invasive third-party advertising trackers that follow your movement across the web.
            </p>
          </div>

          <div className={_x.card}>
            <Lock size={40} className={_x.icon} />
            <Lock size={200} className={_x.bgIcon} />
            <h3 className={_x.h3}>User Anonymity</h3>
            <p className={_x.p}>
              The "Article Reach" (View Count) displayed on our headers is aggregated anonymously. Your specific identity is never attached to the views you generate.
            </p>
          </div>

          <div className={_x.card}>
            <ShieldCheck size={40} className={_x.icon} />
            <ShieldCheck size={200} className={_x.bgIcon} />
            <h3 className={_x.h3}>Contact</h3>
            <p className={_x.p}>
              For privacy concerns regarding the Brawnly ecosystem, please contact the Data Officer at: <strong>bbudi6621@gmail.com</strong>.
            </p>
          </div>

        </div>

        <div className="mt-16 flex flex-col justify-center items-start p-8 md:p-12 bg-neutral-100 dark:bg-neutral-900 border-l-4 border-red-600">
             <h3 className="text-xl font-black uppercase mb-4">Protocol Status</h3>
             <p className="text-sm font-bold opacity-60 mb-8">
               Last Updated: February 2026
             </p>
             <Link to="/" className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black text-[10px] font-black uppercase tracking-widest hover:invert transition-all">
               Acknowledge & Return
             </Link>
        </div>
      </div>
      <ScrollToTopButton />
    </main>
  );
}