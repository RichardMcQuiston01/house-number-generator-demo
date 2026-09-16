import type {SignGenerationResult} from '../../lib/types';
import {AssembledPreview} from './AssembledPreview';
import {FileGallery} from './FileGallery';

export interface SuccessViewProps {
  readonly result: SignGenerationResult;
}

export function SuccessView({result}: SuccessViewProps): JSX.Element {
  return (
    <div className="space-y-6">
      <AssembledPreview layout={result.layout} config={result.config} />
      <FileGallery files={result.files} />
    </div>
  );
}
