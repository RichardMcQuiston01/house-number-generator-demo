import {useState} from 'react';
import type {ReactNode} from 'react';

export interface HeroProps {
  /** Rendered into the right column, beside the description. */
  readonly preview: ReactNode;
}

/** Heading + collapsible intro (left) alongside a live preview slot (right). */
export function Hero({preview}: HeroProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section id="top" className="py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Design a laser-cut house number sign in your browser
      </h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-start">
        <div>
          <p
            className={`text-base text-slate-600 dark:text-slate-400 sm:text-lg ${isExpanded ? '' : 'line-clamp-4'}`}
          >
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-brand-700 dark:bg-slate-800 dark:text-brand-300">
              @richardmcquiston01/house-number-generator
            </code>{' '}
            turns a house number (and an optional name) into ready-to-cut
            laser files: one SVG or DXF piece per digit, per letter, and for
            the backer plate. This demo lets you pick a style, shape,
            dimensions, fonts, and assembly type, then preview and download
            the generated cut files without installing anything. Configure
            your sign below, and the preview panel will render each piece as
            it&rsquo;s generated.
          </p>
          <button
            type="button"
            onClick={() => setIsExpanded(previous => !previous)}
            aria-expanded={isExpanded}
            className="mt-2 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {isExpanded ? 'Show less' : '… more'}
          </button>
        </div>
        {preview}
      </div>
    </section>
  );
}
