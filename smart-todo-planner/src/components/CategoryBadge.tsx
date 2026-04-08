const categoryColors: Record<string, string> = {
  Work: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
  Personal: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
  Health: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  Learning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  Finance: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
};

export default function CategoryBadge({ category }: { category: string }) {
  if (!category) return null;
  const colors = categoryColors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors}`}>
      {category}
    </span>
  );
}
