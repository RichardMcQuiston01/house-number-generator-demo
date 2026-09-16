import type {GeneratedFileKind, SignGenerationError} from '../../lib/types';

export const KIND_LABELS: Record<GeneratedFileKind, string> = {
  number: 'House number',
  name: 'Name',
  backer: 'Backer plate',
};

export const STAGE_BADGE_LABELS: Record<SignGenerationError['stage'], string> =
  {
    validation: 'Validation error',
    font: 'Font error',
    layout: 'Layout error',
  };

/** Plain-language explanation of which part of the pipeline a stage failure belongs to. */
export function describeStage(stage: SignGenerationError['stage']): string {
  switch (stage) {
    case 'validation':
      return 'One or more configuration values need to be fixed before a sign can be generated.';
    case 'font':
      return 'There was a problem loading the selected font.';
    case 'layout':
      return 'The sign layout could not be computed from the current settings.';
  }
}
