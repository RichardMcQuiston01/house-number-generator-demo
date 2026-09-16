export function EmptyState(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-10 w-10 text-slate-300 dark:text-slate-600"
      >
        <rect x={3} y={3} width={18} height={18} rx={2} />
        <path d="M3 15l4.5-4.5a2 2 0 0 1 2.8 0L15 15" />
        <circle cx={9} cy={8.5} r={1.5} />
      </svg>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
        No sign generated yet
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Configure your sign and click Generate. An assembled preview and the
        downloadable cut files for each piece will appear here.
      </p>
    </div>
  );
}
