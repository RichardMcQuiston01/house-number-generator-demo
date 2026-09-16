import {
  computeSignLayout,
  createFontRegistry,
  generateDxfFiles,
  generateSvgFiles,
  validateSignConfig,
} from '@richardmcquiston01/house-number-generator';
import type {LoadedFont} from '@richardmcquiston01/house-number-generator';
import type {
  GeneratedFileKind,
  GeneratedFilePreview,
  OutputFormat,
  ResolvedFont,
  SignConfig,
  SignFormState,
  SignGenerationOutcome,
} from './types';

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
        ? {type: 'hardware', screwSize: form.screwSize}
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
  format: OutputFormat,
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
  const layout = layoutResult.value;

  const files: GeneratedFilePreview[] = [];
  if (format === 'svg' || format === 'both') {
    for (const file of generateSvgFiles(layout, config.unit)) {
      files.push({...file, ...classifyFileName(file.name)});
    }
  }
  if (format === 'dxf' || format === 'both') {
    for (const file of generateDxfFiles(layout, config.unit)) {
      files.push({...file, ...classifyFileName(file.name)});
    }
  }

  return {ok: true, value: {config, layout, files}};
}
