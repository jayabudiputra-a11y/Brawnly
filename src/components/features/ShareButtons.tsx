// src/components/features/ShareButtons.tsx
import { useState } from 'react'
import {
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Link2,
  CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonsProps {
  article: {
    title: string
    slug: string
  }
}

const ShareButtons = ({ article }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false)

  const url = `${window.location.origin}/article/${article.slug}`
  const title = article.title

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied to clipboard!', {
        duration: 2000,
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  return (
    <div className="flex items-center gap-5 flex-wrap">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-12 h-12 bg-[#1877f2] text-white rounded-full hover:bg-[#166fe5] transition-all"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-6 h-6" />
      </a>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-12 h-12 bg-black text-white rounded-full hover:bg-gray-800 transition-all"
        aria-label="Share on X"
      >
        <Twitter className="w-6 h-6" />
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-12 h-12 bg-[#0a66c2] text-white rounded-full hover:bg-[#004182] transition-all"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="w-6 h-6" />
      </a>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-12 h-12 bg-[#25d366] text-white rounded-full hover:bg-[#128c7e] transition-all"
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      <button
        onClick={copyLink}
        className="flex items-center justify-center w-12 h-12 bg-gray-200 text-gray-700 rounded-full hover:bg-emerald-600 hover:text-white transition-all"
      >
        {copied ? <CheckCircle className="w-6 h-6" /> : <Link2 className="w-6 h-6" />}
      </button>
    </div>
  )
}

export default ShareButtons