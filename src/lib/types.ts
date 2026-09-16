/**
 * Shared type contract for the demo app. Every feature area (form, preview,
 * generator lib) imports from here so they can be built in parallel against
 * a stable interface.
 */
import type {
  AssemblyConfig,
  GeneratedFile,
  SignConfig,
  SignLayout,
  SignShape,
  SignStyle,
  Unit,
  ValidationError,
} from '@richardmcquiston01/house-number-generator';
import {DEFAULT_FONT_ID} from './fonts';

export type {
  AssemblyConfig,
  GeneratedFile,
  SignConfig,
  SignLayout,
  SignShape,
  SignStyle,
  Unit,
  ValidationError,
};

/** A bundled font's bytes, fetched and ready to register with the package's font registry. */
export interface ResolvedFont {
  readonly fontId: string;
  readonly familyName: string;
  readonly buffer: ArrayBuffer;
}

/** Which cut/engrave file format(s) to produce. Mirrors the package's `OutputFormat`. */
export type OutputFormat = 'svg' | 'dxf' | 'both';

/**
 * Whether number/name cut files are split one-per-glyph (matching the
 * package's own output) or combined into one file per group.
 */
export type FileGrouping = 'individual' | 'grouped';

/** Which physical piece a generated file represents. `'combined'` is the optional multi-layer SVG. */
export type GeneratedFileKind = 'number' | 'name' | 'backer' | 'combined';

/** A single generated cut/engrave file, tagged for the gallery UI. */
export interface GeneratedFilePreview extends GeneratedFile {
  readonly kind: GeneratedFileKind;
  readonly format: 'svg' | 'dxf';
}

/** Full result of a successful generation: layout for the composite preview, plus every downloadable file. */
export interface SignGenerationResult {
  readonly config: SignConfig;
  readonly layout: SignLayout;
  readonly files: readonly GeneratedFilePreview[];
}

/** Which pipeline stage produced an error, with a single user-facing message per field (or general). */
export interface SignGenerationError {
  readonly stage: 'validation' | 'font' | 'layout';
  readonly fieldErrors: readonly ValidationError[];
  readonly message: string;
}

export type SignGenerationOutcome =
  | {readonly ok: true; readonly value: SignGenerationResult}
  | {readonly ok: false; readonly error: SignGenerationError};

/**
 * Form state for the configurator. Numeric/font fields are kept as UI-friendly
 * primitives; `toSignConfig()` in `src/lib/generator.ts` converts this into a
 * validated `SignConfig` (font ids fixed as `'numberFont'` / `'nameFont'` in
 * the registry, matching {@link FontSlotId}).
 */
export interface SignFormState {
  readonly style: SignStyle;
  readonly houseNumber: string;
  readonly name: string;
  readonly numberFontId: string;
  readonly nameFontId: string;
  readonly shape: SignShape;
  readonly numberHeight: number;
  readonly nameHeight: number | undefined;
  readonly margin: number;
  readonly unit: Unit;
  readonly assemblyType: AssemblyConfig['type'];
  readonly fileGrouping: FileGrouping;
}

export const DEFAULT_FORM_STATE: SignFormState = {
  style: 'numbersOnly',
  houseNumber: '742',
  name: '',
  numberFontId: DEFAULT_FONT_ID,
  nameFontId: DEFAULT_FONT_ID,
  shape: 'rectangle',
  numberHeight: 4,
  nameHeight: undefined,
  margin: 0.5,
  unit: 'in',
  assemblyType: 'hardware',
  fileGrouping: 'grouped',
};
