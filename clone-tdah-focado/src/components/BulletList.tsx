interface BulletListProps {
  items: string[];
  className?: string;
}

export default function BulletList({ items, className = "" }: BulletListProps) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((item, index) => (
        <li key={index} className="flex gap-3 items-start">
          <span className="text-orange-500 font-bold flex-shrink-0 mt-1">✓</span>
          <span className="text-base leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}
