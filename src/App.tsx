/**
 * Top-level shell. Feature areas (header/footer, configurator form, preview
 * gallery) are wired in here as they land on `dev`.
 */
export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-bold">House Number Generator Demo</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Scaffold in progress.
        </p>
      </main>
    </div>
  );
}
