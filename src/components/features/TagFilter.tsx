import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { setCookieHash, mirrorQuery } from '@/lib/enterpriseStorage'
import { enqueue } from '@/lib/idbQueue'

const tags = ['musc', 'fitness', 'gay', 'crush']

interface TagFilterProps {
  selected: string | null
  onSelect: (tag: string | null) => void
}

const TagFilter = ({ selected, onSelect }: TagFilterProps) => {
  useEffect(() => {
    if (selected) {
      setCookieHash(`tag_${selected}`)
      mirrorQuery({ type: 'TAG_FILTER', value: selected, ts: Date.now() })
    }
  }, [selected])

  const handleSelect = async (tag: string | null) => {
    try {
      onSelect(tag)
      if (tag) {
        await enqueue({ type: 'TAG_SELECT', payload: tag, timestamp: Date.now() })
      }
    } catch (e) {
      onSelect(tag)
    }
  }

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-6 pt-2 no-scrollbar">
      <button
        onClick={() => handleSelect(null)}
        className="relative px-6 py-2 outline-none group"
      >
        <span className={`relative z-10 text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${
          selected === null ? 'text-black dark:text-white' : 'text-neutral-400 group-hover:text-yellow-500'
        }`}>
          All
        </span>
        
        {selected === null && (
          <motion.div
            layoutId="active-tag-lasso"
            className="absolute inset-0 bg-yellow-400 rounded-lg shadow-[0_0_15px_rgba(250,204,21,0.5)]"
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </button>

      {tags.map((tag) => {
        const isSelected = selected === tag;
        return (
          <button
            key={tag}
            onClick={() => handleSelect(tag)}
            className="relative px-6 py-2 outline-none group"
          >
            <span className={`relative z-10 text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-300 capitalize ${
              isSelected ? 'text-black dark:text-white' : 'text-neutral-400 group-hover:text-yellow-500'
            }`}>
              {tag}
            </span>

            {isSelected && (
              <motion.div
                layoutId="active-tag-lasso"
                className="absolute inset-0 bg-yellow-400 rounded-lg shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default TagFilter