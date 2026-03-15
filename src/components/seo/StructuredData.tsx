import React from "react"
import { Helmet } from "react-helmet-async"
import { resolveAuthorName } from "@/lib/Resolveauthor"

interface _ASD {
  title: string
  excerpt?: string
  featured_image_url?: string | null
  featured_image?: string | string[] | null
  published_at: string
  author?: any
  author_name?: string | null
  url?: string
}

interface _SDP { article: _ASD }

const _SU  = "https://www.brawnly.online"
const _SN  = "Brawnly"
const _AN  = "Budi Putra Jaya"
const _OL  = "https://creativecommons.org/licenses/by/4.0/"
const _OC  = `© 2026 ${_AN}. All rights reserved.`
const _OAU = `${_SU}/license`

const _SP: Record<string,{license:string;copyright:string;acquireUrl:string;creatorName:string;creatorType:"Person"|"Organization";creatorUrl:string}> = {
  instagram: {license:"https://www.instagram.com/legal/terms/",copyright:"© Instagram / Meta Platforms, Inc. All rights reserved.",acquireUrl:"https://www.instagram.com/legal/terms/",creatorName:"Instagram / Meta Platforms, Inc.",creatorType:"Organization",creatorUrl:"https://www.instagram.com"},
  tiktok:    {license:"https://www.tiktok.com/legal/page/us/terms-of-service/en",copyright:"© TikTok / ByteDance Ltd. All rights reserved.",acquireUrl:"https://www.tiktok.com/legal/page/us/terms-of-service/en",creatorName:"TikTok / ByteDance Ltd.",creatorType:"Organization",creatorUrl:"https://www.tiktok.com"},
  tumblr:    {license:"https://www.tumblr.com/policy/en/terms-of-service",copyright:"© Tumblr / Automattic Inc. / respective content creators. All rights reserved.",acquireUrl:"https://www.tumblr.com/policy/en/terms-of-service",creatorName:"Tumblr / respective content creators",creatorType:"Organization",creatorUrl:"https://www.tumblr.com"},
  twitter:   {license:"https://twitter.com/en/tos",copyright:"© X Corp. / respective tweet authors. All rights reserved.",acquireUrl:"https://twitter.com/en/tos",creatorName:"X Corp. / respective tweet authors",creatorType:"Organization",creatorUrl:"https://twitter.com"},
  pinterest: {license:"https://policy.pinterest.com/en/terms-of-service",copyright:"© Pinterest, Inc. / respective pin owners. All rights reserved.",acquireUrl:"https://policy.pinterest.com/en/terms-of-service",creatorName:"Pinterest / respective content creators",creatorType:"Organization",creatorUrl:"https://www.pinterest.com"},
  google:    {license:"https://policies.google.com/terms",copyright:"© Google LLC. All rights reserved.",acquireUrl:"https://policies.google.com/terms",creatorName:"Google LLC",creatorType:"Organization",creatorUrl:"https://www.google.com"},
  flickr:    {license:"https://www.flickr.com/creativecommons/",copyright:"© Respective photographers on Flickr. License varies per image.",acquireUrl:"https://www.flickr.com/help/terms",creatorName:"Respective photographers on Flickr",creatorType:"Person",creatorUrl:"https://www.flickr.com"},
  youtube:   {license:"https://www.youtube.com/t/terms",copyright:"© YouTube / Google LLC / respective content creators. All rights reserved.",acquireUrl:"https://www.youtube.com/t/terms",creatorName:"YouTube / respective content creators",creatorType:"Organization",creatorUrl:"https://www.youtube.com"},
  cloudinary:{license:_OL,copyright:_OC,acquireUrl:_OAU,creatorName:_AN,creatorType:"Person",creatorUrl:_SU},
}

type _TPr = typeof _SP[keyof typeof _SP]

function _dIS(url: string): _TPr {
  const u = (url || "").toLowerCase()
  if (u.includes("instagram.com")||u.includes("cdninstagram.com")||u.includes("fbcdn.net")) return _SP.instagram
  if (u.includes("tiktok.com")||u.includes("tiktokcdn.com")||u.includes("musical.ly")) return _SP.tiktok
  if (u.includes("tumblr.com")||u.includes("tumblr.co")) return _SP.tumblr
  if (u.includes("twitter.com")||u.includes("twimg.com")||u.includes("x.com")) return _SP.twitter
  if (u.includes("pinterest.com")||u.includes("pinimg.com")) return _SP.pinterest
  if (u.includes("googleusercontent.com")||u.includes("ggpht.com")||u.includes("gstatic.com")) return _SP.google
  if (u.includes("flickr.com")||u.includes("staticflickr.com")||u.includes("live.staticflickr.com")) return _SP.flickr
  if (u.includes("youtube.com")||u.includes("ytimg.com")||u.includes("youtu.be")) return _SP.youtube
  if (u.includes("cloudinary.com")||u.includes("res.cloudinary.com")||u.includes("brawnly.online")) return _SP.cloudinary
  return {license:_OL,copyright:_OC,acquireUrl:_OAU,creatorName:_AN,creatorType:"Person",creatorUrl:_SU}
}

function _vU(url: string|null|undefined): string|null {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.protocol !== "https:" && u.protocol !== "http:") return null
    if (!u.hostname || u.hostname.length < 4) return null
    return url
  } catch { return null }
}

function _bIO(url: string|null|undefined, name: string, description?: string, representative?: boolean): object|undefined {
  const vU = _vU(url)
  if (!vU) return undefined
  const p = _dIS(vU)
  return {
    "@type":"ImageObject","url":vU,"contentUrl":vU,"name":name,
    ...(description?{"description":description}:{}),
    "license":p.license,
    "creator":{"@type":p.creatorType,"name":p.creatorName,"url":p.creatorUrl},
    "copyrightNotice":p.copyright,"acquireLicensePage":p.acquireUrl,"creditText":p.creatorName,
    ...(representative!==undefined?{"representativeOfPage":representative}:{}),
    "encodingFormat":vU.toLowerCase().match(/\.gif/i)?"image/gif":vU.toLowerCase().match(/\.webp/i)?"image/webp":"image/jpeg",
  }
}

const _PLG = {
  "@type":"ImageObject",
  "url":`${_SU}/masculineLogo.svg`,"contentUrl":`${_SU}/masculineLogo.svg`,"name":`${_SN} logo`,
  "license":_OL,"creator":{"@type":"Person","name":_AN,"url":_SU},"copyrightNotice":_OC,"acquireLicensePage":_OAU,
}

const StructuredData: React.FC<_SDP> = ({ article }) => {
  if (!article) return null

  const _gFI = (): string|undefined => {
    const raw = article.featured_image_url || article.featured_image
    if (!raw) return undefined
    if (Array.isArray(raw)) {
      for (const item of raw) { const v = _vU(String(item).trim()); if (v) return v }
      return undefined
    }
    const urls = String(raw).split(/[\n\r|,|\s+]+/).map(s => s.trim()).filter(Boolean)
    for (const u of urls) { const v = _vU(u); if (v) return v }
    return undefined
  }

  const _authorName = resolveAuthorName(article, _AN)
  const _aUrl       = _vU(article.url) || _SU
  const _imgUrl     = _gFI()
  const _cp         = _imgUrl ? _dIS(_imgUrl) : null

  const _sd = {
    "@context":"https://schema.org","@type":"Article",
    "mainEntityOfPage":{"@type":"WebPage","@id":_aUrl,"url":_aUrl},
    "headline":article.title,"name":article.title,"description":article.excerpt,
    "image":_bIO(_imgUrl,`${article.title} — cover image`,article.excerpt?article.excerpt:`Featured image for article: ${article.title}`,true),
    "datePublished":article.published_at,"dateModified":article.published_at,
    "author":{"@type":"Person","name":_authorName,"url":_SU},
    "publisher":{"@type":"Organization","name":_SN,"url":_SU,"logo":_PLG},
    "isPartOf":{"@type":"Blog","name":_SN,"url":_SU},
  }

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(_sd)}</script>
      </Helmet>

      <div className="sr-only" itemScope itemType="https://schema.org/Article">
        <h2 itemProp="headline">{article.title}</h2>
        {article.excerpt && <p itemProp="description">{article.excerpt}</p>}

        <span itemProp="author" itemScope itemType="https://schema.org/Person">
          Ditulis oleh <span itemProp="name">{_authorName}</span>
        </span>

        <time itemProp="datePublished" dateTime={article.published_at}>
          {new Date(article.published_at).toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' })}
        </time>

        {_imgUrl && _cp ? (
          <span itemScope itemType="https://schema.org/ImageObject" itemProp="image">
            <meta itemProp="url"                  content={_imgUrl} />
            <meta itemProp="contentUrl"           content={_imgUrl} />
            <meta itemProp="name"                 content={`${article.title} — cover image`} />
            {article.excerpt && <meta itemProp="description" content={article.excerpt} />}
            <meta itemProp="representativeOfPage" content="true" />
            <meta itemProp="license"              content={_cp.license} />
            <meta itemProp="copyrightNotice"      content={_cp.copyright} />
            <meta itemProp="acquireLicensePage"   content={_cp.acquireUrl} />
            <meta itemProp="creditText"           content={_cp.creatorName} />
            <span itemScope itemType={`https://schema.org/${_cp.creatorType}`} itemProp="creator">
              <meta itemProp="name" content={_cp.creatorName} />
              <meta itemProp="url"  content={_cp.creatorUrl} />
            </span>
          </span>
        ) : null}

        <span itemScope itemType="https://schema.org/Organization" itemProp="publisher">
          <span itemProp="name">{_SN}</span>
          <a href={_SU} itemProp="url" tabIndex={-1} rel="noopener noreferrer">{_SN}</a>
          <span itemScope itemType="https://schema.org/ImageObject" itemProp="logo">
            <meta itemProp="url"                content={`${_SU}/masculineLogo.svg`} />
            <meta itemProp="contentUrl"         content={`${_SU}/masculineLogo.svg`} />
            <meta itemProp="name"               content={`${_SN} logo`} />
            <meta itemProp="license"            content={_OL} />
            <meta itemProp="copyrightNotice"    content={_OC} />
            <meta itemProp="acquireLicensePage" content={_OAU} />
            <span itemScope itemType="https://schema.org/Person" itemProp="creator">
              <meta itemProp="name" content={_AN} />
              <meta itemProp="url"  content={_SU} />
            </span>
          </span>
        </span>
      </div>
    </>
  )
}

export default StructuredData