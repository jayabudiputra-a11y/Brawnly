import { Link } from 'react-router-dom';
import { Heart, Mail, ShieldCheck, Scale, FileText, ExternalLink } from 'lucide-react';
import React, { useEffect } from 'react';
import NewsletterForm from '@/components/common/NewsletterForm'; 
import { setCookieHash, mirrorQuery } from '@/lib/enterpriseStorage';
import { registerSW } from '@/pwa/swRegister';
import ScrollToTopButton from '../features/ScrollToTopButton';

const SITE_URL = "https://www.brawnly.online";
const SITE_NAME = "Brawnly";
const SITE_DESCRIPTION =
  "LGBTQ+ Fitness Inspiration • Muscle Worship • Mindset • Wellness. Operating at the intersection of Tech and Physical Performance.";
const CONTACT_EMAIL = "bbudi6621@gmail.com";
const CONTACT_NAME = "Budi Putra Jaya";
const FOUNDED_YEAR = "2026";
const LOCATION = "Medan, Indonesia";

/* ============================================================
   JSON-LD — built outside component to avoid re-serialising
   ============================================================ */
const _jLdOrganization = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": SITE_NAME,
  "url": SITE_URL,
  "logo": {
    "@type": "ImageObject",
    "url": `${SITE_URL}/masculineLogo.svg`,
    "name": `${SITE_NAME} logo`,
  },
  "description": SITE_DESCRIPTION,
  "foundingDate": FOUNDED_YEAR,
  "foundingLocation": {
    "@type": "Place",
    "name": LOCATION,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Medan",
      "addressCountry": "ID",
    },
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "email": CONTACT_EMAIL,
    "contactType": "editorial",
    "availableLanguage": ["Indonesian", "English"],
  },
  "sameAs": [SITE_URL],
  "knowsAbout": [
    "LGBTQ+",
    "Fitness",
    "Muscle Worship",
    "Mindset",
    "Wellness",
    "Technology",
    "Physical Performance",
  ],
});

const _jLdWebSite = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  "url": SITE_URL,
  "name": SITE_NAME,
  "description": SITE_DESCRIPTION,
  "inLanguage": "id",
  "publisher": {
    "@type": "Organization",
    "name": SITE_NAME,
    "url": SITE_URL,
  },
  "copyrightYear": FOUNDED_YEAR,
  "copyrightHolder": {
    "@type": "Organization",
    "name": SITE_NAME,
    "url": SITE_URL,
  },
});

const _jLdPerson = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  "name": CONTACT_NAME,
  "email": CONTACT_EMAIL,
  "url": SITE_URL,
  "worksFor": {
    "@type": "Organization",
    "name": SITE_NAME,
    "url": SITE_URL,
  },
  "jobTitle": "Editor",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Medan",
    "addressCountry": "ID",
  },
  "knowsAbout": ["LGBTQ+", "Fitness", "Muscle Worship", "Mindset", "Wellness"],
});

const _jLdSiteLinks = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": `${SITE_NAME} Site Links`,
  "description": `Key pages and legal documents on ${SITE_NAME}.`,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Editorial Ethics",
      "url": `${SITE_URL}/ethics`,
      "item": {
        "@type": "WebPage",
        "url": `${SITE_URL}/ethics`,
        "name": "Editorial Ethics — Brawnly",
      },
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Privacy Policy",
      "url": `${SITE_URL}/privacy`,
      "item": {
        "@type": "WebPage",
        "url": `${SITE_URL}/privacy`,
        "name": "Privacy Policy — Brawnly",
      },
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Terms of Service",
      "url": `${SITE_URL}/terms`,
      "item": {
        "@type": "WebPage",
        "url": `${SITE_URL}/terms`,
        "name": "Terms of Service — Brawnly",
      },
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "About",
      "url": `${SITE_URL}/about`,
      "item": {
        "@type": "WebPage",
        "url": `${SITE_URL}/about`,
        "name": "About — Brawnly",
      },
    },
    {
      "@type": "ListItem",
      "position": 5,
      "name": "Archive",
      "url": `${SITE_URL}/articles`,
      "item": {
        "@type": "WebPage",
        "url": `${SITE_URL}/articles`,
        "name": "Articles Archive — Brawnly",
      },
    },
    {
      "@type": "ListItem",
      "position": 6,
      "name": "Contact",
      "url": `${SITE_URL}/contact`,
      "item": {
        "@type": "WebPage",
        "url": `${SITE_URL}/contact`,
        "name": "Contact — Brawnly",
      },
    },
  ],
});

const Footer = () => {
    const emailAddress = CONTACT_EMAIL;
    const subject = "Brawnly Editorial / Ideal Man Discussion";
    const body = "Hi Budi,\n\nI'm very interested in the 'Muscle Worship' and 'Mindset' content on Brawnly. I'd love to discuss the concept of an ideal/dream man further based on your perspective.";

    useEffect(() => {
        registerSW();
    }, []);

    const handleDirectGmail = async () => {
        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);

        await setCookieHash("contact_intent");
        mirrorQuery({ type: "CONTACT_CLICK", target: emailAddress, ts: Date.now() });

        const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailAddress}&su=${encodedSubject}&body=${encodedBody}`;
        const mailtoUrl = `mailto:${emailAddress}?subject=${encodedSubject}&body=${encodedBody}`;

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
            window.location.href = mailtoUrl;
        } else {
            window.open(gmailWebUrl, '_blank');
        }
    };

     return (
        <>
            {/* Dipanggil sebelum footer agar logika deteksi posisi tetap akurat */}
            <ScrollToTopButton />

            <footer
                className="bg-gray-900 text-white py-16 transition-colors duration-300 border-t-4 border-black relative z-10"
                itemScope
                itemType="https://schema.org/WPFooter"
                role="contentinfo"
                aria-label={`${SITE_NAME} site footer`}
            >
            {/* ── JSON-LD: Organization ── */}
            <script type="application/ld+json">{_jLdOrganization}</script>

            {/* ── JSON-LD: WebSite ── */}
            <script type="application/ld+json">{_jLdWebSite}</script>

            {/* ── JSON-LD: Person (author / contact) ── */}
            <script type="application/ld+json">{_jLdPerson}</script>

            {/* ── JSON-LD: ItemList (all site links) ── */}
            <script type="application/ld+json">{_jLdSiteLinks}</script>

            {/* ── Microdata: footer-level ── */}
            <meta itemProp="url" content={SITE_URL} />
            <meta itemProp="name" content={SITE_NAME} />
            <meta itemProp="description" content={SITE_DESCRIPTION} />

            {/* ── SEO HIDDEN: full site identity + links for crawlers ── */}
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
                {/* Organization */}
                <span itemScope itemType="https://schema.org/Organization" itemProp="publisher">
                    <a href={SITE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
                        {SITE_NAME}
                    </a>
                    <span itemProp="name">{SITE_NAME}</span>
                    <span itemProp="description">{SITE_DESCRIPTION}</span>
                    <span itemProp="foundingDate">{FOUNDED_YEAR}</span>
                    <span
                        itemScope
                        itemType="https://schema.org/ContactPoint"
                        itemProp="contactPoint"
                    >
                        <a
                            href={`mailto:${CONTACT_EMAIL}`}
                            itemProp="email"
                            tabIndex={-1}
                        >
                            {CONTACT_EMAIL}
                        </a>
                        <meta itemProp="contactType" content="editorial" />
                    </span>
                    <span
                        itemScope
                        itemType="https://schema.org/Place"
                        itemProp="foundingLocation"
                    >
                        <span itemProp="name">{LOCATION}</span>
                        <span
                            itemScope
                            itemType="https://schema.org/PostalAddress"
                            itemProp="address"
                        >
                            <span itemProp="addressLocality">Medan</span>
                            <span itemProp="addressCountry">ID</span>
                        </span>
                    </span>
                    {/* knowsAbout keywords */}
                    <meta itemProp="knowsAbout" content="LGBTQ+" />
                    <meta itemProp="knowsAbout" content="Fitness" />
                    <meta itemProp="knowsAbout" content="Muscle Worship" />
                    <meta itemProp="knowsAbout" content="Mindset" />
                    <meta itemProp="knowsAbout" content="Wellness" />
                    <meta itemProp="knowsAbout" content="Technology" />
                    <meta itemProp="knowsAbout" content="Physical Performance" />
                </span>

                {/* Person — author / contact */}
                <span itemScope itemType="https://schema.org/Person" itemProp="author">
                    <span itemProp="name">{CONTACT_NAME}</span>
                    <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        itemProp="email"
                        tabIndex={-1}
                    >
                        {CONTACT_EMAIL}
                    </a>
                    <a
                        href={SITE_URL}
                        itemProp="url"
                        tabIndex={-1}
                        rel="noopener noreferrer"
                    >
                        {CONTACT_NAME} on {SITE_NAME}
                    </a>
                    <meta itemProp="jobTitle" content="Editor" />
                    <span
                        itemScope
                        itemType="https://schema.org/PostalAddress"
                        itemProp="address"
                    >
                        <span itemProp="addressLocality">Medan</span>
                        <span itemProp="addressCountry">ID</span>
                    </span>
                </span>

                {/* WebSite isPartOf */}
                <span itemScope itemType="https://schema.org/WebSite" itemProp="isPartOf">
                    <a href={SITE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
                        {SITE_NAME}
                    </a>
                    <span itemProp="name">{SITE_NAME}</span>
                    <meta itemProp="copyrightYear" content={FOUNDED_YEAR} />
                    <meta itemProp="inLanguage" content="id" />
                </span>

                {/* Legal + site navigation links */}
                <nav aria-label="Hidden SEO footer navigation">
                    <a href={`${SITE_URL}/ethics`} tabIndex={-1} rel="noopener noreferrer"
                        itemScope itemType="https://schema.org/WebPage">
                        <span itemProp="name">Editorial Ethics</span>
                        <meta itemProp="url" content={`${SITE_URL}/ethics`} />
                    </a>
                    <a href={`${SITE_URL}/privacy`} tabIndex={-1} rel="noopener noreferrer"
                        itemScope itemType="https://schema.org/WebPage">
                        <span itemProp="name">Privacy Policy</span>
                        <meta itemProp="url" content={`${SITE_URL}/privacy`} />
                    </a>
                    <a href={`${SITE_URL}/terms`} tabIndex={-1} rel="noopener noreferrer"
                        itemScope itemType="https://schema.org/WebPage">
                        <span itemProp="name">Terms of Service</span>
                        <meta itemProp="url" content={`${SITE_URL}/terms`} />
                    </a>
                    <a href={`${SITE_URL}/about`} tabIndex={-1} rel="noopener noreferrer"
                        itemScope itemType="https://schema.org/WebPage">
                        <span itemProp="name">About Brawnly</span>
                        <meta itemProp="url" content={`${SITE_URL}/about`} />
                    </a>
                    <a href={`${SITE_URL}/articles`} tabIndex={-1} rel="noopener noreferrer"
                        itemScope itemType="https://schema.org/CollectionPage">
                        <span itemProp="name">Articles Archive</span>
                        <meta itemProp="url" content={`${SITE_URL}/articles`} />
                    </a>
                    <a href={`${SITE_URL}/contact`} tabIndex={-1} rel="noopener noreferrer"
                        itemScope itemType="https://schema.org/ContactPage">
                        <span itemProp="name">Contact Brawnly</span>
                        <meta itemProp="url" content={`${SITE_URL}/contact`} />
                        <meta itemProp="email" content={CONTACT_EMAIL} />
                    </a>
                </nav>

                {/* Copyright */}
                <span itemScope itemType="https://schema.org/CreativeWork" itemProp="mainEntity">
                    <meta itemProp="copyrightYear" content={FOUNDED_YEAR} />
                    <span itemScope itemType="https://schema.org/Organization" itemProp="copyrightHolder">
                        <span itemProp="name">{SITE_NAME}</span>
                        <a href={SITE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
                            {SITE_URL}
                        </a>
                    </span>
                </span>
            </div>

            {/* ── Visible footer content (all existing logic preserved) ── */}
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

                    {/* Brand column */}
                    <div
                        className="space-y-4"
                        itemScope
                        itemType="https://schema.org/Organization"
                    >
                        <meta itemProp="name" content={SITE_NAME} />
                        <meta itemProp="url" content={SITE_URL} />
                        <meta itemProp="description" content={SITE_DESCRIPTION} />

                        <div className="flex items-center overflow-visible">
                            <Link
                                to="/"
                                aria-label={`${SITE_NAME} — go to homepage`}
                            >
                                <span className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent p-4 pb-8 -mt-4 leading-none block overflow-visible transform-gpu">
                                    {SITE_NAME}
                                </span>
                            </Link>
                        </div>
                        <p
                            className="text-gray-400 text-sm font-medium leading-relaxed"
                            itemProp="description"
                        >
                            LGBTQ+ Fitness Inspiration • Muscle Worship • Mindset • Wellness. 
                            Operating at the intersection of Tech and Physical Performance.
                        </p>
                    </div>

                    {/* Standards & Legal column */}
                    <nav
                        aria-label="Standards and legal links"
                        itemScope
                        itemType="https://schema.org/SiteNavigationElement"
                    >
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6 border-b border-gray-800 pb-2">
                            Standards & Legal
                        </h2>
                        <ul className="space-y-4">
                            <li
                                itemScope
                                itemType="https://schema.org/WebPage"
                                itemProp="hasPart"
                            >
                                <meta itemProp="url" content={`${SITE_URL}/ethics`} />
                                <meta itemProp="name" content="Editorial Ethics" />
                                <Link
                                    to="/ethics"
                                    aria-label="Editorial Ethics policy"
                                    className="flex items-center gap-2 text-gray-300 hover:text-red-500 transition-all font-bold uppercase text-[11px] tracking-widest group"
                                >
                                    <Scale size={14} className="group-hover:rotate-12 transition-transform" aria-hidden="true" />
                                    Editorial Ethics
                                </Link>
                            </li>
                            <li
                                itemScope
                                itemType="https://schema.org/WebPage"
                                itemProp="hasPart"
                            >
                                <meta itemProp="url" content={`${SITE_URL}/privacy`} />
                                <meta itemProp="name" content="Privacy Policy" />
                                <Link
                                    to="/privacy"
                                    aria-label="Privacy Policy"
                                    className="flex items-center gap-2 text-gray-300 hover:text-emerald-500 transition-all font-bold uppercase text-[11px] tracking-widest group"
                                >
                                    <ShieldCheck size={14} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
                                    Privacy Policy
                                </Link>
                            </li>
                            <li
                                itemScope
                                itemType="https://schema.org/WebPage"
                                itemProp="hasPart"
                            >
                                <meta itemProp="url" content={`${SITE_URL}/terms`} />
                                <meta itemProp="name" content="Terms of Service" />
                                <Link
                                    to="/terms"
                                    aria-label="Terms of Service"
                                    className="flex items-center gap-2 text-gray-300 hover:text-blue-500 transition-all font-bold uppercase text-[11px] tracking-widest group"
                                >
                                    <FileText size={14} className="group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Newsletter column */}
                    <div>
                        <h2
                            className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6"
                            id="newsletter-heading"
                        >
                            Stay Inspired
                        </h2>
                        <div
                            className="mb-4"
                            role="region"
                            aria-labelledby="newsletter-heading"
                        >
                            <NewsletterForm />
                        </div>
                        <p className="text-gray-400 text-[10px] font-serif italic leading-tight">
                            Latest protocols synced to your local archive weekly.
                        </p>
                    </div>

                    {/* Contact column */}
                    <div
                        itemScope
                        itemType="https://schema.org/ContactPage"
                    >
                        <meta itemProp="url" content={`${SITE_URL}/contact`} />
                        <meta itemProp="name" content={`Contact ${SITE_NAME}`} />

                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6">
                            Direct Contact
                        </h2>
                        <p
                            className="text-gray-400 mb-6 italic text-xs flex items-center gap-1"
                            itemScope
                            itemType="https://schema.org/Person"
                            itemProp="author"
                        >
                            <span itemProp="name" className="sr-only">{CONTACT_NAME}</span>
                            <span
                                itemScope
                                itemType="https://schema.org/PostalAddress"
                                itemProp="address"
                                className="sr-only"
                            >
                                <span itemProp="addressLocality">Medan</span>
                                <span itemProp="addressCountry">ID</span>
                            </span>
                            Made with{" "}
                            <Heart
                                className="inline w-4 h-4 text-red-500 animate-pulse"
                                aria-label="love"
                            />{" "}
                            in Medan, {FOUNDED_YEAR}.
                        </p>

                        <button
                            onClick={handleDirectGmail}
                            aria-label={`Send email to ${CONTACT_NAME} at ${emailAddress} via Gmail`}
                            className="w-full inline-flex items-center justify-between px-4 py-3 border border-gray-700 rounded-none bg-gray-800/50 text-gray-300 hover:text-white hover:bg-black hover:border-emerald-500 transition-all duration-500 group"
                        >
                            <div className="flex items-center gap-3">
                                <Mail
                                    className="w-4 h-4 text-emerald-500 group-hover:animate-bounce"
                                    aria-hidden="true"
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    Open Gmail Direct
                                </span>
                            </div>
                            <ExternalLink
                                size={12}
                                className="opacity-30 group-hover:opacity-100"
                                aria-hidden="true"
                            />
                        </button>

                        {/* Hidden email link for crawlers */}
                        <a
                            href={`mailto:${emailAddress}`}
                            className="sr-only"
                            itemProp="email"
                            tabIndex={-1}
                            aria-hidden="true"
                        >
                            {emailAddress}
                        </a>

                        <p className="text-[8px] text-gray-600 mt-2 uppercase tracking-tighter">
                            Bypassing generic mailto via Gmail Interface
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div
                    className="h-px w-full bg-gradient-to-r from-transparent via-gray-800 to-transparent my-12"
                    aria-hidden="true"
                />

                {/* Bottom bar */}
                <div
                    className="flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]"
                    itemScope
                    itemType="https://schema.org/CreativeWork"
                >
                    <meta itemProp="copyrightYear" content={FOUNDED_YEAR} />

                    <div>
                        © {FOUNDED_YEAR}{" "}
                        <span
                            className="text-white"
                            itemScope
                            itemType="https://schema.org/Organization"
                            itemProp="copyrightHolder"
                        >
                            <a
                                href={SITE_URL}
                                itemProp="url"
                                className="hover:underline"
                                aria-label={`${SITE_NAME} homepage`}
                            >
                                <span itemProp="name">Brawnly.online</span>
                            </a>
                        </span>
                        . All Protocols Logged.
                    </div>

                    <nav
                        aria-label="Footer secondary navigation"
                        className="flex gap-8"
                        itemScope
                        itemType="https://schema.org/SiteNavigationElement"
                    >
                        <Link
                            to="/about"
                            aria-label="About Brawnly"
                            className="hover:text-white transition-colors"
                            itemProp="url"
                        >
                            About
                        </Link>
                        <Link
                            to="/articles"
                            aria-label="Articles archive"
                            className="hover:text-white transition-colors"
                            itemProp="url"
                        >
                            Archive
                        </Link>
                        <Link
                            to="/contact"
                            aria-label="Contact Brawnly"
                            className="hover:text-white transition-colors"
                            itemProp="url"
                        >
                            Contact
                        </Link>
                    </nav>

                    <p
                        className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent italic"
                        itemProp="description"
                    >
                        Built for the community.
                    </p>
                </div>
            </div>
        </footer>
        </>
    );
};

export default Footer;