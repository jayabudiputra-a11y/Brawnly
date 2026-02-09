import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Hexagon, ShieldAlert, Gavel, FileText } from "lucide-react";
import ScrollToTopButton from "@/components/features/ScrollToTopButton";

export default function Terms() {
  const _x = {
    root: "bg-white dark:bg-[#0a0a0a] min-h-screen pb-24 text-black dark:text-white transition-all duration-500 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black",
    core: "max-w-[1000px] mx-auto px-5 md:px-10",
    head: "pt-24 pb-16 border-b-[12px] border-black dark:border-white mb-16",
    title: "text-[50px] md:text-[80px] leading-[0.85] font-black uppercase tracking-tighter mb-8 italic",
    subtitle: "text-[14px] font-black uppercase tracking-[0.3em] text-red-700 mb-5 block",
    section: "mb-20 border-l-2 border-neutral-200 dark:border-neutral-800 pl-8 md:pl-12",
    h2: "text-3xl font-black uppercase tracking-tight mb-6 flex items-center gap-3",
    p: "text-[18px] md:text-[20px] leading-[1.7] font-serif text-neutral-800 dark:text-neutral-300 mb-6",
    list: "list-disc ml-5 space-y-3 font-serif text-[18px] text-neutral-800 dark:text-neutral-300 marker:text-red-600",
    box: "bg-neutral-100 dark:bg-[#111] p-8 border border-neutral-200 dark:border-neutral-800",
  };

  return (
    <main className={_x.root}>
      <Helmet>
        <title>Terms of Service | Brawnly.online</title>
        <meta name="description" content="Terms of Service and Medical Disclaimer for Brawnly.online." />
        <link rel="canonical" href="https://www.brawnly.online/terms" />
      </Helmet>

      <div className={_x.core}>
        <header className={_x.head}>
          <span className={_x.subtitle}>Brawnly Legal Framework / Vol. 2026</span>
          <h1 className={_x.title}>Terms of <br/>Service</h1>
          <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest opacity-60">
             <Hexagon size={16} />
             <span>Effective: February 2026</span>
          </div>
        </header>

        <article>
          <div className={_x.section}>
            <h2 className={_x.h2}>01. General Provisions</h2>
            <p className={_x.p}>
              By accessing <strong>www.brawnly.online</strong> (the "Platform"), you agree to these Terms. Brawnly is a digital editorial interface focusing on the intersection of Technology and Physical Performance.
            </p>
          </div>

          <div className={_x.section}>
            <h2 className={_x.h2}>
              <ShieldAlert className="text-red-600" />
              02. Medical Disclaimer
            </h2>
            <div className={_x.box}>
              <p className="font-bold uppercase tracking-widest text-xs mb-4 text-red-600">Important Safety Warning</p>
              <p className={_x.p}>
                The content on Brawnly.online is for <strong>educational and informational purposes only</strong>. It is not intended as a substitute for professional medical advice, diagnosis, or treatment.
              </p>
              <p className={_x.p}>
                Always seek the advice of your physician before undertaking a new fitness regime or dietary change based on our tech-driven analysis.
              </p>
            </div>
          </div>

          <div className={_x.section}>
            <h2 className={_x.h2}>03. Digital Assets & Usage</h2>
            <p className={_x.p}>
              <strong>"The Archive" (Save Feature):</strong> This bookmarking feature utilizes your device's local storage. You are responsible for maintaining your own device data.
            </p>
            <p className={_x.p}>
              <strong>"Anchor" (Sharing):</strong> You are granted a limited license to share article permalinks for non-commercial use.
            </p>
          </div>

          <div className={_x.section}>
            <h2 className={_x.h2}>
              <Gavel className="text-black dark:text-white" />
              04. Governing Law
            </h2>
            <p className={_x.p}>
              These terms are governed by the laws of <strong>Indonesia</strong>. Any disputes relating to these terms shall be subject to the jurisdiction of the courts in Medan.
            </p>
          </div>

          <div className="mt-24 p-10 bg-black text-white dark:bg-white dark:text-black">
            <h3 className="text-2xl font-black uppercase italic mb-4">Agreement</h3>
            <p className="font-serif text-lg mb-8 opacity-80">
              Continuing to navigate Brawnly.online constitutes acceptance of these terms.
            </p>
            <Link to="/" className="inline-block border-b-2 border-white dark:border-black pb-1 text-xs font-black uppercase tracking-[0.2em] hover:text-red-500 transition-colors">
              Return to Feed
            </Link>
          </div>
        </article>
      </div>
      <ScrollToTopButton />
    </main>
  );
}