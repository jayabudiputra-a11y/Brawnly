import React from "react";
import { Share2 } from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────
const PAYPAL_URL = "https://paypal.me/BudiPutraJaya?locale.x=id_ID&country.x=ID";
const FB_SHARE_URL = "https://web.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fpaypal.me%2FBudiPutraJaya%3Flocale.x%3Did_ID%26country.x%3DID&_rdc=1&_rdr#";
const USERNAME = "BudiPutraJaya";

// ─── SEO Node ────────────────────────────────────────────────────────────────
function PayPalSEONode() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
      }}
    >
      <span itemScope itemType="https://schema.org/Person">
        <span itemProp="name" content={USERNAME} />
        <a href={PAYPAL_URL} itemProp="url" rel="noopener noreferrer">
          Tip {USERNAME} on PayPal
        </a>
      </span>
    </div>
  );
}

// ─── Main Widget Component ───────────────────────────────────────────────────
export default function PayPalWidget() {
  return (
    <div
      className="rounded-[2rem] border-2 border-black dark:border-white overflow-hidden shadow-xl bg-white dark:bg-[#111]"
      itemScope
      itemType="https://schema.org/WebPage"
    >
      <PayPalSEONode />
      <meta itemProp="url" content={PAYPAL_URL} />

      {/* Top Color Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#003087] via-[#005ea6] to-[#0079C1]" />

      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#003087] to-[#0079C1] flex items-center justify-center shadow-md flex-shrink-0">
            {/* Simple 'P' Icon representation for PayPal */}
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 fill-white"
              aria-label="PayPal"
              role="img"
            >
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106a.64.64 0 0 1-.632.54z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 leading-none mb-0.5">
              PayPal
            </p>
            <p className="text-[13px] font-black uppercase italic tracking-tight text-black dark:text-white leading-none">
              @{USERNAME}
            </p>
          </div>
        </div>

        <a
          href={PAYPAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Support via PayPal"
          className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-gradient-to-r from-[#003087] to-[#0079C1] text-white shadow-sm hover:opacity-80 transition-opacity flex-shrink-0"
        >
          Tip me
        </a>
      </div>

      <div className="px-6 pb-4">
        <p className="text-[12px] font-serif italic text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800 pt-4">
          Dukung tulisan dan project ini dengan memberikan donasi melalui{" "}
          <span className="font-black not-italic text-[#0079C1] dark:text-[#3b9bdb]">
            PayPal
          </span>{" "}
          ✦
        </p>
      </div>

      <div className="px-6 pb-5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <a
          href={FB_SHARE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share PayPal link on Facebook"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1877F2] hover:text-[#0c59c2] transition-colors duration-300"
        >
          <Share2 size={12} aria-hidden="true" />
          Share on Facebook
        </a>
      </div>
    </div>
  );
}