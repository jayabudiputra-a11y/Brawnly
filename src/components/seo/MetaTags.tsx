import React from 'react';
import { Helmet as _H } from 'react-helmet-async';
import _pG from '@/assets/myPride.gif';
import _mL from '@/assets/masculineLogo.svg';
import _bG from '@/assets/Brawnly.gif';
import _fS from '@/assets/Brawnly-favicon.svg';

interface MetaTagsProps {
  title: string;
  description?: string;
  url?: string;
  image?: string;
}

const MetaTags = ({ title: _t, description: _d, url: _u, image: _i }: MetaTagsProps) => {
  const _bU = "https://brawnly.online";
  const _fT = `${_t} | Brawnly`;
  const _fD = _d || "Brawnly 2026: Smart Fitness and Wellness Tracker Intelligence.";
  const _fU = _u || _bU;
  const _fI = _i || `${_bU}${_bG}`;

  const _jLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Brawnly",
    "alternateName": "Brawnly Online",
    "url": _bU,
    "image": `${_bU}${_pG}`,
    "logo": `${_bU}${_mL}`,
    "author": {
      "@type": "Person",
      "name": "Budi Putra Jaya"
    },
    "description": _fD
  };

  return (
    <_H>
      <title>{_fT}</title>
      <link rel="icon" type="image/svg+xml" href={_fS} />
      <meta name="description" content={_fD} />
      <meta name="author" content="Budi Putra Jaya" />
      
      <meta property="og:type" content="website" />
      <meta property="og:title" content={_fT} />
      <meta property="og:description" content={_fD} />
      <meta property="og:image" content={_fI} />
      <meta property="og:url" content={_fU} />
      <meta property="og:site_name" content="Brawnly" />

      <link rel="canonical" href={_fU} />
      
      <script type="application/ld+json">
        {JSON.stringify(_jLd)}
      </script>
    </_H>
  );
};

export default MetaTags;