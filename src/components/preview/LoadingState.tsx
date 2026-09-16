export function LoadingState(): JSX.Element {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 px-6 py-16 text-center dark:border-slate-800"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Generating sign files…
      </p>
    </div>
  );
}
