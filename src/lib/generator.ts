import {
  computeSignLayout,
  createFontRegistry,
  generateDxfFiles,
  generateSvgFiles,
  validateSignConfig,
} from '@richardmcquiston01/house-number-generator';
import type {
  LoadedFont,
  MountingHole,
  PositionedGlyph,
} from '@richardmcquiston01/house-number-generator';
import {buildGroupedDxfFile, buildGroupedSvgFile} from './groupedFiles';
import {improveHolePlacement} from './holePlacement';
import {buildMultiLayerSvg} from './multiLayerSvg';
import type {
  FileGrouping,
  GeneratedFilePreview,
  OutputFormat,
  ResolvedFont,
  SignConfig,
  SignFormState,
  SignGenerationOutcome,
  Unit,
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

/**
 * Emits one SVG/DXF file per glyph (`number-0-7.svg`, `name-1-o.dxf`, ...),
 * carrying that glyph's own relocated holes. The package's own per-glyph
 * generators only ever draw one hole per file, so glyphs get more than one
 * hole via {@link buildGroupedSvgFile}/{@link buildGroupedDxfFile} called
 * with a single-glyph array instead.
 */
function pushIndividualGlyphFiles(
  files: GeneratedFilePreview[],
  glyphs: readonly PositionedGlyph[],
  holesByGlyph: readonly (readonly MountingHole[])[],
  kind: 'number' | 'name',
  unit: Unit,
  wantsSvg: boolean,
  wantsDxf: boolean,
): void {
  glyphs.forEach((glyph, index) => {
    const holes = holesByGlyph[index];
    const baseName = `${kind}-${index}-${glyph.character}`;
    if (wantsSvg) {
      const file = buildGroupedSvgFile(`${baseName}.svg`, [glyph], holes, unit);
      if (file) files.push({...file, kind, format: 'svg'});
    }
    if (wantsDxf) {
      const file = buildGroupedDxfFile(`${baseName}.dxf`, [glyph], holes, unit);
      if (file) files.push({...file, kind, format: 'dxf'});
    }
  });
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
  const relocated = improveHolePlacement(layoutResult.value);
  const layout = {
    ...layoutResult.value,
    numberHoles: relocated.numberHoles,
    ...(relocated.nameHoles !== undefined ? {nameHoles: relocated.nameHoles} : {}),
    ...(relocated.engravingMarks !== undefined
      ? {engravingMarks: relocated.engravingMarks}
      : {}),
  };

  const {format, fileGrouping, includeMultiLayerSvg} = options;
  const wantsSvg = format === 'svg' || format === 'both';
  const wantsDxf = format === 'dxf' || format === 'both';

  const files: GeneratedFilePreview[] = [];

  if (fileGrouping === 'individual') {
    pushIndividualGlyphFiles(
      files,
      layout.numberGlyphs,
      relocated.numberHolesByGlyph,
      'number',
      config.unit,
      wantsSvg,
      wantsDxf,
    );
    if (layout.nameGlyphs && relocated.nameHolesByGlyph) {
      pushIndividualGlyphFiles(
        files,
        layout.nameGlyphs,
        relocated.nameHolesByGlyph,
        'name',
        config.unit,
        wantsSvg,
        wantsDxf,
      );
    }
    if (wantsSvg) {
      const backer = generateSvgFiles(layout, config.unit).find(
        file => file.name === 'backer.svg',
      );
      if (backer) files.push({...backer, kind: 'backer', format: 'svg'});
    }
    if (wantsDxf) {
      const backer = generateDxfFiles(layout, config.unit).find(
        file => file.name === 'backer.dxf',
      );
      if (backer) files.push({...backer, kind: 'backer', format: 'dxf'});
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
