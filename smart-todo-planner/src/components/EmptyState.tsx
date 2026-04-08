interface Props {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="text-gray-300 dark:text-gray-600 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-500 mb-4 max-w-md">{description}</p>}
      {action}
    </div>
  );
}
