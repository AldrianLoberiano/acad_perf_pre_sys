export function EmptyState({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-hover text-ink-light">
        {icon}
      </div>
      <h4 className="text-sm font-semibold text-ink">{title}</h4>
      <p className="mt-1 max-w-xs text-xs text-ink-light">{description}</p>
    </div>
  );
}
