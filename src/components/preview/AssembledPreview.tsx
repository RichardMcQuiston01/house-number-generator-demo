import {renderCompositeSignSvg} from '../../lib/renderSignSvg';
import type {SignConfig, SignLayout} from '../../lib/types';

export interface AssembledPreviewProps {
  readonly layout: SignLayout;
  readonly config: SignConfig;
}

export function AssembledPreview({
  layout,
  config,
}: AssembledPreviewProps): JSX.Element {
  const svgMarkup = renderCompositeSignSvg(layout, config);
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        Assembled preview
      </h3>
      {/* Safe: svgMarkup is generated entirely by our own renderCompositeSignSvg, not user-supplied HTML. */}
      <div
        className="mt-3 [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{__html: svgMarkup}}
      />
    </div>
  );
}
