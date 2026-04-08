interface Props {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon ? (
        <div className="text-gray-200 dark:text-gray-700 mb-3">{icon}</div>
      ) : (
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        </div>
      )}
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">{title}</h3>
      {description && <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
