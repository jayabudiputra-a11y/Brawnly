import Badge from '../ui/Badge'

const tags = ['musc', 'fitness', 'gay', 'crush']

interface TagFilterProps {
  selected: string | null
  onSelect: (tag: string | null) => void
}

const TagFilter = ({ selected, onSelect }: TagFilterProps) => {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-4">
      <Badge
        variant={selected === null ? 'primary' : 'secondary'}
        className="cursor-pointer"
        onClick={() => onSelect(null)}
      >
        All
      </Badge>
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant={selected === tag ? 'primary' : 'secondary'}
          className="cursor-pointer capitalize"
          onClick={() => onSelect(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
}

export default TagFilter
