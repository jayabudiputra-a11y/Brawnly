interface MetaTagsProps {
  title: string
  description?: string
  url?: string
  image?: string
}

const MetaTags = ({ title, description, url, image }: MetaTagsProps) => {
  return (
    <>
      <title>{title} | Brawnly</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
    </>
  )
}

export default MetaTags
