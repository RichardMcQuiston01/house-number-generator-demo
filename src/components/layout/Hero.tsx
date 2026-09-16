/** Short intro explaining the underlying package and what this demo lets a visitor do. */
export function Hero(): JSX.Element {
  return (
    <section id="top" className="py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Design a laser-cut house number sign, right in your browser
      </h1>
      <p className="mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-400 sm:text-lg">
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-brand-700 dark:bg-slate-800 dark:text-brand-300">
          @richardmcquiston01/house-number-generator
        </code>{' '}
        turns a house number (and an optional name) into ready-to-cut laser
        files: one SVG or DXF piece per digit, per letter, and for the backer
        plate. This demo lets you pick a style, shape, dimensions, fonts, and
        assembly type, then preview and download the generated cut files
        without installing anything.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-slate-500 dark:text-slate-500">
        Configure your sign below, and the preview panel will render each
        piece as it's generated.
      </p>
    </section>
  );
}
