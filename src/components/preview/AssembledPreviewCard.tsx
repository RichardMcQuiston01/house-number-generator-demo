import type {UseSignGeneratorApi} from '../../lib/useSignGenerator';
import {AssembledPreview} from './AssembledPreview';
import {EmptyState} from './EmptyState';
import {ErrorPanel} from './ErrorPanel';
import {LoadingState} from './LoadingState';

/**
 * The hero-level preview card: the assembled sign preview, or its
 * empty/loading/error state. Independent of the cut-file gallery, which
 * renders separately once generation succeeds (see `FileGalleryPanel`).
 */
export function AssembledPreviewCard(props: {
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
  return (
    <AssembledPreview
      layout={api.result.value.layout}
      config={api.result.value.config}
    />
  );
}
