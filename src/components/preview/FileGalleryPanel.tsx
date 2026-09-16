import type {UseSignGeneratorApi} from '../../lib/useSignGenerator';
import {FileGallery} from './FileGallery';

/**
 * Cut-file gallery, shown once generation succeeds. Renders nothing before
 * that — the empty/loading/error status already lives in
 * `AssembledPreviewCard`, so there's no need to duplicate it here.
 */
export function FileGalleryPanel(props: {
  readonly api: UseSignGeneratorApi;
}): JSX.Element | null {
  const {api} = props;
  if (!api.result?.ok) {
    return null;
  }
  return <FileGallery files={api.result.value.files} />;
}
