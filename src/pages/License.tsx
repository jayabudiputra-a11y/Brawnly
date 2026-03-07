import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Scale, ExternalLink } from "lucide-react";

const SITE_URL   = "https://www.brawnly.online";
const AUTHOR     = "Budi Putra Jaya";
const EMAIL      = "bbudi6621@gmail.com";
const CC_URL     = "https://creativecommons.org/licenses/by/4.0/";
const CC_LEGAL   = "https://creativecommons.org/licenses/by/4.0/legalcode";
const YEAR       = "2026";

const _jLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/license`,
  "url": `${SITE_URL}/license`,
  "name": "Content License — Brawnly",
  "description":
    "All original content on Brawnly is published under the Creative Commons Attribution 4.0 International (CC BY 4.0) license.",
  "inLanguage": "en",
  "isPartOf": { "@type": "WebSite", "name": "Brawnly", "url": SITE_URL },
  "license": CC_URL,
  "author": {
    "@type": "Person",
    "name": AUTHOR,
    "email": EMAIL,
    "url": SITE_URL,
  },
  "copyrightYear": YEAR,
  "copyrightHolder": { "@type": "Person", "name": AUTHOR, "url": SITE_URL },
});

export default function License() {
  return (
    <>
      <Helmet>
        <title>Content License — Brawnly</title>
        <meta
          name="description"
          content="All original content on Brawnly is published under the Creative Commons Attribution 4.0 International (CC BY 4.0) license."
        />
        <link rel="canonical" href={`${SITE_URL}/license`} />
        <meta property="og:title" content="Content License — Brawnly" />
        <meta
          property="og:description"
          content="All original content on Brawnly is published under CC BY 4.0."
        />
        <meta property="og:url" content={`${SITE_URL}/license`} />
        <script type="application/ld+json">{_jLd}</script>
      </Helmet>

      <main
        className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white"
        itemScope
        itemType="https://schema.org/WebPage"
      >
        <meta itemProp="url" content={`${SITE_URL}/license`} />
        <meta itemProp="license" content={CC_URL} />

        {/* ── Header bar ── */}
        <div className="border-b-[6px] border-black dark:border-white">
          <div className="max-w-[860px] mx-auto px-6 py-10 md:py-14">
            <Link
              to="/articles"
              aria-label="Back to articles"
              className="inline-flex items-center gap-2 text-red-600 font-black uppercase text-[11px] tracking-[0.3em] hover:gap-4 transition-all italic mb-8"
            >
              <ArrowLeft size={14} aria-hidden="true" /> Back
            </Link>

            <div className="flex items-start gap-5">
              <div
                className="w-12 h-12 flex-shrink-0 rounded-2xl bg-black dark:bg-white flex items-center justify-center shadow-lg mt-1"
                aria-hidden="true"
              >
                <Scale size={22} className="text-white dark:text-black" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.35em] text-neutral-400 mb-2">
                  Legal / License
                </p>
                <h1 className="text-[36px] sm:text-[52px] md:text-[64px] leading-[0.88] font-black uppercase italic tracking-tighter">
                  Content License
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-w-[860px] mx-auto px-6 py-14 md:py-20 space-y-14">

          {/* CC badge block */}
          <section
            className="rounded-[2rem] border-2 border-black dark:border-white p-8 md:p-10 shadow-xl bg-neutral-50 dark:bg-[#111]"
            aria-label="Creative Commons license"
            itemScope
            itemType="https://schema.org/CreativeWork"
          >
            <meta itemProp="license" content={CC_URL} />
            <meta itemProp="copyrightYear" content={YEAR} />
            <span
              itemProp="copyrightHolder"
              itemScope
              itemType="https://schema.org/Person"
              style={{ display: "none" }}
            >
              <meta itemProp="name" content={AUTHOR} />
              <meta itemProp="url" content={SITE_URL} />
            </span>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <img
                src="https://mirrors.creativecommons.org/presskit/icons/cc.svg"
                alt="Creative Commons"
                className="w-8 h-8"
              />
              <img
                src="https://mirrors.creativecommons.org/presskit/icons/by.svg"
                alt="Attribution"
                className="w-8 h-8"
              />
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
                CC BY 4.0
              </span>
            </div>

            <p className="text-[18px] md:text-[22px] font-serif leading-relaxed text-neutral-800 dark:text-neutral-200 mb-6">
              All original content on{" "}
              <strong className="font-black text-black dark:text-white">
                Brawnly
              </strong>{" "}
              — including articles, images, graphics, and editorial copy
              created by{" "}
              <strong className="font-black text-black dark:text-white">
                {AUTHOR}
              </strong>{" "}
              — is published under the{" "}
              <a
                href={CC_URL}
                target="_blank"
                rel="license noopener noreferrer"
                className="font-black text-red-600 hover:underline inline-flex items-center gap-1"
              >
                Creative Commons Attribution 4.0 International (CC BY 4.0)
                <ExternalLink size={13} aria-hidden="true" />
              </a>{" "}
              license.
            </p>

            <a
              href={CC_URL}
              target="_blank"
              rel="license noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[11px] tracking-widest hover:invert transition-all shadow-md"
            >
              View Full License <ExternalLink size={13} aria-hidden="true" />
            </a>
          </section>

          {/* What this means */}
          <section aria-label="What CC BY 4.0 means">
            <h2 className="text-[22px] md:text-[28px] font-black uppercase italic tracking-tighter mb-6 border-b-2 border-black dark:border-white pb-3">
              What this means
            </h2>
            <div className="space-y-5 text-[17px] md:text-[19px] font-serif leading-relaxed text-neutral-700 dark:text-neutral-300">
              <p>
                <strong className="font-black text-black dark:text-white">You are free to:</strong>
              </p>
              <ul className="list-none space-y-3 pl-4 border-l-4 border-black dark:border-white">
                <li>
                  <strong className="font-black text-black dark:text-white">Share</strong> —
                  copy and redistribute the material in any medium or format.
                </li>
                <li>
                  <strong className="font-black text-black dark:text-white">Adapt</strong> —
                  remix, transform, and build upon the material for any purpose,
                  even commercially.
                </li>
              </ul>
              <p>
                <strong className="font-black text-black dark:text-white">
                  Under the following terms:
                </strong>
              </p>
              <ul className="list-none space-y-3 pl-4 border-l-4 border-red-600">
                <li>
                  <strong className="font-black text-black dark:text-white">Attribution</strong> —
                  You must give appropriate credit to{" "}
                  <strong className="font-black text-black dark:text-white">{AUTHOR}</strong>{" "}
                  and{" "}
                  <strong className="font-black text-black dark:text-white">Brawnly</strong>,
                  provide a link to the license, and indicate if changes were
                  made. You may do so in any reasonable manner, but not in any
                  way that suggests the licensor endorses you or your use.
                </li>
                <li>
                  <strong className="font-black text-black dark:text-white">
                    No additional restrictions
                  </strong>{" "}
                  — You may not apply legal terms or technological measures that
                  legally restrict others from doing anything the license
                  permits.
                </li>
              </ul>
            </div>
          </section>

          {/* Third-party content */}
          <section aria-label="Third-party content notice">
            <h2 className="text-[22px] md:text-[28px] font-black uppercase italic tracking-tighter mb-6 border-b-2 border-black dark:border-white pb-3">
              Third-party content
            </h2>
            <p className="text-[17px] md:text-[19px] font-serif leading-relaxed text-neutral-700 dark:text-neutral-300">
              Embedded media from Instagram, YouTube, TikTok, Pinterest,
              Tumblr, X/Twitter, and other platforms remain subject to their
              respective platform Terms of Service. The CC BY 4.0 license
              applies only to original Brawnly editorial content and images
              created by {AUTHOR}.
            </p>
          </section>

          {/* Attribution example */}
          <section aria-label="Attribution example">
            <h2 className="text-[22px] md:text-[28px] font-black uppercase italic tracking-tighter mb-6 border-b-2 border-black dark:border-white pb-3">
              How to attribute
            </h2>
            <div className="rounded-2xl border-2 border-black dark:border-white bg-neutral-50 dark:bg-[#111] p-6 font-mono text-[13px] md:text-[14px] leading-relaxed text-neutral-800 dark:text-neutral-200 break-all">
              © {YEAR}{" "}
              <a
                href={SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-black text-red-600 hover:underline"
              >
                {AUTHOR} / Brawnly
              </a>
              , licensed under{" "}
              <a
                href={CC_URL}
                target="_blank"
                rel="license noopener noreferrer"
                className="font-black text-red-600 hover:underline"
              >
                CC BY 4.0
              </a>
              .
            </div>
          </section>

          {/* Contact */}
          <section aria-label="License contact">
            <h2 className="text-[22px] md:text-[28px] font-black uppercase italic tracking-tighter mb-6 border-b-2 border-black dark:border-white pb-3">
              Questions?
            </h2>
            <p className="text-[17px] md:text-[19px] font-serif leading-relaxed text-neutral-700 dark:text-neutral-300">
              For licensing inquiries, commercial use, or permissions beyond
              the scope of CC BY 4.0, contact{" "}
              <a
                href={`mailto:${EMAIL}`}
                className="font-black text-black dark:text-white hover:text-red-600 transition-colors"
              >
                {EMAIL}
              </a>
              .
            </p>
          </section>

          {/* Legal code link */}
          <div className="pt-4 border-t-2 border-neutral-100 dark:border-neutral-900 flex flex-wrap gap-4">
            <a
              href={CC_LEGAL}
              target="_blank"
              rel="license noopener noreferrer"
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Read the full legal code <ExternalLink size={12} aria-hidden="true" />
            </a>
            <Link
              to="/privacy"
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}