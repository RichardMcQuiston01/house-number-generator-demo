import {
  computeSignLayout,
  createFontRegistry,
  generateDxfFiles,
  generateSvgFiles,
  validateSignConfig,
} from '@richardmcquiston01/house-number-generator';
import type {LoadedFont} from '@richardmcquiston01/house-number-generator';
import {buildGroupedDxfFile, buildGroupedSvgFile} from './groupedFiles';
import {improveHolePlacement} from './holePlacement';
import {buildMultiLayerSvg} from './multiLayerSvg';
import type {
  FileGrouping,
  GeneratedFileKind,
  GeneratedFilePreview,
  OutputFormat,
  ResolvedFont,
  SignConfig,
  SignFormState,
  SignGenerationOutcome,
} from './types';

// M4's hole (4mm + the package's clearance = 4.5mm / ~0.18in) comfortably
// passes both common metric (M3, M4) and SAE (#4, #6, #8) hardware, so
// hardware assembly always uses this one size instead of asking which
// screw the user has.
const UNIVERSAL_SCREW_SIZE = 'M4';

/** Converts UI form state into the package's `SignConfig`, fixing font ids to the registry slots used by {@link generateSignFiles}. */
export function buildSignConfig(form: SignFormState): SignConfig {
  return {
    style: form.style,
    houseNumber: form.houseNumber,
    ...(form.style === 'nameAndNumbers' ? {name: form.name} : {}),
    font: {
      numberFont: 'numberFont',
      ...(form.style === 'nameAndNumbers' ? {nameFont: 'nameFont'} : {}),
    },
    shape: form.shape,
    numberHeight: form.numberHeight,
    ...(form.nameHeight !== undefined ? {nameHeight: form.nameHeight} : {}),
    margin: form.margin,
    unit: form.unit,
    assembly:
      form.assemblyType === 'hardware'
        ? {type: 'hardware', screwSize: UNIVERSAL_SCREW_SIZE}
        : {type: 'adhesive'},
  };
}

function classifyFileName(
  name: string,
): {kind: GeneratedFileKind; format: 'svg' | 'dxf'} {
  const format = name.endsWith('.dxf') ? 'dxf' : 'svg';
  const kind: GeneratedFileKind = name.startsWith('number-')
    ? 'number'
    : name.startsWith('name-')
      ? 'name'
      : 'backer';
  return {kind, format};
}

export interface GenerateSignFilesOptions {
  readonly format: OutputFormat;
  /** 'individual' (one file per glyph, matching the package's own output) or 'grouped' (one file per number/name group). */
  readonly fileGrouping: FileGrouping;
  /** Also produce a single SVG with the backer, numbers, and name each on their own colored layer. */
  readonly includeMultiLayerSvg: boolean;
}

/**
 * Runs the full sign generation pipeline (validate → register fonts →
 * compute layout → produce cut files), tagging every generated file with the
 * physical piece it represents so the preview UI doesn't need to re-derive
 * that from the filename convention itself.
 */
export function generateSignFiles(
  config: SignConfig,
  selectedFonts: {
    readonly numberFont: ResolvedFont;
    readonly nameFont?: ResolvedFont;
  },
  options: GenerateSignFilesOptions,
): SignGenerationOutcome {
  const validation = validateSignConfig(config);
  if (!validation.ok) {
    return {
      ok: false,
      error: {
        stage: 'validation',
        fieldErrors: validation.error,
        message: validation.error.map(e => e.message).join(' '),
      },
    };
  }

  const fonts = createFontRegistry();
  const numberFontResult = fonts.register(
    'numberFont',
    selectedFonts.numberFont.buffer,
  );
  if (!numberFontResult.ok) {
    return {
      ok: false,
      error: {
        stage: 'font',
        fieldErrors: [],
        message: numberFontResult.error.message,
      },
    };
  }

  let nameFont: LoadedFont | undefined;
  if (config.style === 'nameAndNumbers') {
    if (!selectedFonts.nameFont) {
      return {
        ok: false,
        error: {
          stage: 'font',
          fieldErrors: [],
          message: 'A name font is required for the "name + numbers" style.',
        },
      };
    }
    const nameFontResult = fonts.register(
      'nameFont',
      selectedFonts.nameFont.buffer,
    );
    if (!nameFontResult.ok) {
      return {
        ok: false,
        error: {
          stage: 'font',
          fieldErrors: [],
          message: nameFontResult.error.message,
        },
      };
    }
    nameFont = nameFontResult.value;
  }

  const layoutResult = computeSignLayout(
    config,
    numberFontResult.value,
    nameFont,
  );
  if (!layoutResult.ok) {
    return {
      ok: false,
      error: {
        stage: 'layout',
        fieldErrors: [],
        message: layoutResult.error.message,
      },
    };
  }
  const layout = improveHolePlacement(layoutResult.value);

  const {format, fileGrouping, includeMultiLayerSvg} = options;
  const wantsSvg = format === 'svg' || format === 'both';
  const wantsDxf = format === 'dxf' || format === 'both';

  const files: GeneratedFilePreview[] = [];

  if (fileGrouping === 'individual') {
    if (wantsSvg) {
      for (const file of generateSvgFiles(layout, config.unit)) {
        files.push({...file, ...classifyFileName(file.name)});
      }
    }
    if (wantsDxf) {
      for (const file of generateDxfFiles(layout, config.unit)) {
        files.push({...file, ...classifyFileName(file.name)});
      }
    }
  } else {
    if (wantsSvg) {
      const numbers = buildGroupedSvgFile(
        'numbers.svg',
        layout.numberGlyphs,
        layout.numberHoles,
        config.unit,
      );
      if (numbers) files.push({...numbers, kind: 'number', format: 'svg'});
      if (layout.nameGlyphs) {
        const name = buildGroupedSvgFile(
          'name.svg',
          layout.nameGlyphs,
          layout.nameHoles,
          config.unit,
        );
        if (name) files.push({...name, kind: 'name', format: 'svg'});
      }
      const backer = generateSvgFiles(layout, config.unit).find(
        file => file.name === 'backer.svg',
      );
      if (backer) files.push({...backer, kind: 'backer', format: 'svg'});
    }
    if (wantsDxf) {
      const numbers = buildGroupedDxfFile(
        'numbers.dxf',
        layout.numberGlyphs,
        layout.numberHoles,
        config.unit,
      );
      if (numbers) files.push({...numbers, kind: 'number', format: 'dxf'});
      if (layout.nameGlyphs) {
        const name = buildGroupedDxfFile(
          'name.dxf',
          layout.nameGlyphs,
          layout.nameHoles,
          config.unit,
        );
        if (name) files.push({...name, kind: 'name', format: 'dxf'});
      }
      const backer = generateDxfFiles(layout, config.unit).find(
        file => file.name === 'backer.dxf',
      );
      if (backer) files.push({...backer, kind: 'backer', format: 'dxf'});
    }
  }

  if (includeMultiLayerSvg) {
    const combined = buildMultiLayerSvg(layout, config);
    files.push({...combined, kind: 'combined', format: 'svg'});
  }

  return {ok: true, value: {config, layout, files}};
}
