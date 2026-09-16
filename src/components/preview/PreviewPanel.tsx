import type {UseSignGeneratorApi} from '../../lib/useSignGenerator';
import {EmptyState} from './EmptyState';
import {ErrorPanel} from './ErrorPanel';
import {LoadingState} from './LoadingState';
import {SuccessView} from './SuccessView';

/**
 * Results/preview panel: renders purely off `props.api`, owned and driven by
 * a parent that instantiates `useSignGenerator()` so the form and this panel
 * share one hook instance.
 */
export function PreviewPanel(props: {
  readonly api: UseSignGeneratorApi;
}): JSX.Element {
  const {api} = props;

  if (api.isGenerating) {
    return <LoadingState />;
  }

  if (!api.result) {
    return <EmptyState />;
  }

  if (!api.result.ok) {
    return <ErrorPanel error={api.result.error} />;
  }

  return <SuccessView result={api.result.value} />;
}
