import type { Tag } from '../../api/tagApi';

interface TagChipsProps {
  tags: Tag[];
  activeSlug?: string;
  onTagClick: (tag: Tag) => void;
  className?: string;
}

function TagChips({ tags, activeSlug, onTagClick, className = '' }: TagChipsProps) {
  if (tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map(tag => (
        <button
          key={tag.id}
          onClick={() => onTagClick(tag)}
          className={`text-xs px-3 py-1 rounded-full transition-colors ${
            activeSlug === tag.slug
              ? 'bg-blue-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}

export default TagChips;
