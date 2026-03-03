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
        <meta name="description" content="Terms of Service and Medical Disclaimer for Brawnly.online. Read our legal framework, usage policies, and governing law information." />
        <meta name="keywords" content="Brawnly terms of service, legal agreement, medical disclaimer, fitness website terms, Indonesia governing law, digital assets policy, privacy terms" />
        <link rel="canonical" href="https://www.brawnly.online/terms" />
        
        {/* Additional SEO meta tags */}
        <meta property="og:title" content="Terms of Service | Brawnly.online" />
        <meta property="og:description" content="Legal framework and terms governing your use of Brawnly.online platform." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.brawnly.online/terms" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Terms of Service | Brawnly.online" />
        <meta name="twitter:description" content="Legal framework and terms governing your use of Brawnly.online platform." />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
      </Helmet>

      {/* ===== SEO HIDDEN CONTENT - LEGAL KEYWORDS & STRUCTURED DATA ===== */}
      <div className="hidden" aria-hidden="true">
        {/* Primary Legal Keywords */}
        <span>Brawnly Online Terms of Service 2026 Legal Agreement Medical Disclaimer Indonesia Governing Law</span>
        
        {/* Structured Data for Terms of Service Page */}
        <div itemScope itemType="https://schema.org/TermsOfService">
          <meta itemProp="name" content="Brawnly Online Terms of Service" />
          <meta itemProp="description" content="Official terms and conditions for using Brawnly.online platform" />
          <meta itemProp="datePublished" content="2026-02-01" />
          <meta itemProp="dateModified" content="2026-02-01" />
          <meta itemProp="version" content="2026.1" />
          <meta itemProp="jurisdiction" content="Indonesia" />
          <meta itemProp="inLanguage" content="en" />
        </div>
        
        {/* WebPage Schema */}
        <div itemScope itemType="https://schema.org/WebPage">
          <meta itemProp="name" content="Terms of Service - Brawnly Online" />
          <meta itemProp="description" content="Legal terms, conditions, and medical disclaimer for Brawnly.online" />
          <meta itemProp="isPartOf" content="https://www.brawnly.online" />
          <meta itemProp="lastReviewed" content="2026-02-01" />
          <meta itemProp="reviewedBy" content="Brawnly Legal Team" />
        </div>
        
        {/* Breadcrumb for Terms Page */}
        <div itemScope itemType="https://schema.org/BreadcrumbList">
          <div itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <meta itemProp="position" content="1" />
            <meta itemProp="name" content="Home" />
            <meta itemProp="item" content="https://www.brawnly.online" />
          </div>
          <div itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <meta itemProp="position" content="2" />
            <meta itemProp="name" content="Terms of Service" />
            <meta itemProp="item" content="https://www.brawnly.online/terms" />
          </div>
        </div>
        
        {/* Organization Details */}
        <div itemScope itemType="https://schema.org/Organization">
          <meta itemProp="name" content="Brawnly Online" />
          <meta itemProp="url" content="https://www.brawnly.online" />
          <meta itemProp="legalName" content="Brawnly Digital Media" />
          <meta itemProp="foundingDate" content="2024-01-01" />
          <meta itemProp="address" content="Medan, Indonesia" />
          <meta itemProp="jurisdiction" content="Indonesia" />
        </div>
        
        {/* Legal Keywords List */}
        <ul>
          <li>terms of service brawnly</li>
          <li>brawnly online legal agreement</li>
          <li>medical disclaimer fitness website</li>
          <li>indonesia governing law digital platform</li>
          <li>digital assets usage policy</li>
          <li>user agreement brawnly</li>
          <li>privacy terms fitness tech</li>
          <li>platform terms and conditions</li>
          <li>liability disclaimer health content</li>
          <li>intellectual property rights</li>
          <li>data storage policies brawnly</li>
          <li>jurisdiction medan indonesia</li>
        </ul>
        
        {/* Important Legal Phrases for Crawlers */}
        <div>
          <p>Brawnly Online Terms of Service effective February 2026</p>
          <p>Medical Disclaimer: Not a substitute for professional medical advice</p>
          <p>Governing Law: Republic of Indonesia, Medan jurisdiction</p>
          <p>Digital Archive feature uses local storage - user responsibility</p>
          <p>Anchor sharing limited to non-commercial use</p>
          <p>Acceptance by continued use of platform</p>
        </div>
      </div>
      
      {/* ===== INVISIBLE SEO TEXT BLOCK ===== */}
      <div style={{ display: 'none' }}>
        {/* Extended Legal Description */}
        <div>
          <h3>Complete Terms of Service Overview</h3>
          <p>
            Brawnly.online provides digital editorial content focusing on technology and physical performance. 
            These terms govern all interactions with our platform including but not limited to content consumption, 
            feature usage (Archive/Save and Anchor/Share features), and any user engagement with our digital assets.
          </p>
          <p>
            <strong>Medical Disclaimer Detail:</strong> All content including fitness routines, nutritional advice, 
            and performance analysis presented on Brawnly.online is generated for educational purposes. Users must 
            consult qualified healthcare providers before implementing any information found on this platform. 
            Brawnly Digital Media expressly disclaims all liability for any injury, loss, or damage resulting from 
            use of our content.
          </p>
          <p>
            <strong>Jurisdiction Specific Terms:</strong> As Brawnly operates under Indonesian law, all disputes 
            shall be resolved in Medan courts. Users outside Indonesia acknowledge they are accessing this platform 
            voluntarily and accept Indonesian legal jurisdiction.
          </p>
          <p>
            <strong>Intellectual Property:</strong> All content, branding, and digital assets on Brawnly.online are 
            protected by Indonesian and international copyright laws. Unauthorized reproduction, distribution, or 
            commercial use is strictly prohibited.
          </p>
        </div>
        
        {/* Keyword Density Block */}
        <div>
          <span>Brawnly terms, legal agreement, medical disclaimer, Indonesia law, Medan jurisdiction, fitness content disclaimer, digital platform terms, user agreement, privacy policy, data storage, local storage feature, non-commercial sharing, liability limitation, health information, educational purposes only, professional medical advice, technology performance, physical training, Indonesian courts, legal framework 2026</span>
        </div>
        
        {/* FAQ Structured Data in Text Form */}
        <div>
          <div>
            <span>Q: When do Brawnly Terms become effective?</span>
            <span>A: February 2026</span>
          </div>
          <div>
            <span>Q: Where is Brawnly legally governed?</span>
            <span>A: Indonesia, Medan jurisdiction</span>
          </div>
          <div>
            <span>Q: Is Brawnly content medical advice?</span>
            <span>A: No, educational purposes only</span>
          </div>
        </div>
      </div>

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