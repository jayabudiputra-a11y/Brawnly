import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Scale, MessageSquare, Lightbulb } from "lucide-react";
import ScrollToTopButton from "@/components/features/ScrollToTopButton";

export default function Ethics() {
  const _x = {
    root: "bg-white dark:bg-[#0a0a0a] min-h-screen pb-24 text-black dark:text-white transition-all duration-500",
    core: "max-w-[1000px] mx-auto px-5 md:px-10",
    head: "pt-24 pb-16 border-b-[12px] border-black dark:border-white mb-16",
    title: "text-[50px] md:text-[80px] leading-[0.85] font-black uppercase tracking-tighter mb-8 italic",
    subtitle: "text-[14px] font-black uppercase tracking-[0.3em] text-red-700 mb-5 block",
    body: "max-w-[800px]",
    h2: "text-4xl font-black uppercase italic mb-6 mt-20 first:mt-0 flex items-center gap-4",
    p: "text-[20px] leading-[1.6] font-serif text-neutral-800 dark:text-neutral-300 mb-6",
    quote: "border-l-4 border-red-600 pl-6 py-2 my-10 text-2xl font-black italic uppercase text-neutral-400",
    highlight: "bg-neutral-100 dark:bg-[#111] p-6 border border-neutral-200 dark:border-neutral-800 my-8",
  };

  return (
    <main className={_x.root}>
      <Helmet>
        <title>Editorial Ethics | Brawnly.online</title>
        <meta name="description" content="Editorial standards and ethics for Brawnly.online." />
        <link rel="canonical" href="https://www.brawnly.online/ethics" />
      </Helmet>

      <div className={_x.core}>
        <header className={_x.head}>
          <span className={_x.subtitle}>Brawnly Standards / Vol. 2026</span>
          <h1 className={_x.title}>Editorial <br/>Ethics</h1>
        </header>

        <div className={_x.body}>
          
          <h2 className={_x.h2}>
            <Lightbulb className="hidden md:block" />
            01. Independence
          </h2>
          <p className={_x.p}>
            Brawnly.online operates at the cutting edge of fitness technology. Our reviews, code analysis, and workout protocols are driven by data, not sponsorship.
          </p>
          <div className={_x.highlight}>
            <h4 className="font-black uppercase text-sm tracking-widest mb-2">Disclosure Policy</h4>
            <p className="text-sm opacity-70">
              If a piece of hardware or software was provided for review, it will be clearly disclosed at the "Head" section of the article.
            </p>
          </div>

          <h2 className={_x.h2}>
            <Scale className="hidden md:block" />
            02. Accuracy & Corrections
          </h2>
          <p className={_x.p}>
            I, verify our "Weekly Briefing" data against multiple sources. However, in the fast-paced world of tech, errors occur.
          </p>
          <p className={_x.p}>
            <strong>My Promise:</strong> Corrections are transparent. We do not stealth-edit. If we change a fact, we note it with a timestamp.
          </p>
          <div className={_x.quote}>
            "I do not chase clicks. I chase the truth."
          </div>

          <h2 className={_x.h2}>
            <MessageSquare className="hidden md:block" />
            03. The Dialogue
          </h2>
          <p className={_x.p}>
            The Community Dialogue (Comments) section is a space for intellectual debate regarding the implementation of tech in fitness.
          </p>
          <ul className="list-disc ml-6 mb-8 text-lg font-serif space-y-2 marker:text-red-600">
            <li>Zero tolerance for hate speech.</li>
            <li>No unsolicited spam or bot activity.</li>
            <li>Respect the learning curve of other developers and athletes.</li>
          </ul>

        </div>

        <div className="mt-24 pt-10 border-t border-black dark:border-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
             <span className="block text-[10px] font-black uppercase tracking-widest opacity-50">Maintained By</span>
             <span className="block text-lg font-black uppercase">Brawnly Editorial Board</span>
           </div>
           <Link to="/" className="text-[12px] font-black uppercase border-b border-black dark:border-white hover:text-red-600 transition-colors">
             Back to Homepage
           </Link>
        </div>

      </div>
      <ScrollToTopButton />
    </main>
  );
}