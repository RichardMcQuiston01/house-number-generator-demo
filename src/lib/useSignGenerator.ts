import {useCallback, useState} from 'react';
import {buildSignConfig, generateSignFiles} from './generator';
import {fetchCatalogFontBuffer, findFontCatalogEntry} from './fonts';
import {
  DEFAULT_FORM_STATE,
  type ResolvedFont,
  type SignFormState,
  type SignGenerationOutcome,
} from './types';

export interface UseSignGeneratorApi {
  readonly form: SignFormState;
  readonly updateForm: (patch: Partial<SignFormState>) => void;
  readonly isGenerating: boolean;
  readonly result: SignGenerationOutcome | undefined;
  readonly generate: () => Promise<void>;
}

async function resolveFont(fontId: string): Promise<ResolvedFont> {
  const entry = findFontCatalogEntry(fontId);
  if (!entry) {
    throw new Error(`Unknown font "${fontId}".`);
  }
  const buffer = await fetchCatalogFontBuffer(entry);
  return {fontId: entry.id, familyName: entry.familyName, buffer};
}

/** Owns form state, resolves the selected bundled fonts, and runs generation for the sign configurator. */
export function useSignGenerator(
  initialForm: SignFormState = DEFAULT_FORM_STATE,
): UseSignGeneratorApi {
  const [form, setForm] = useState<SignFormState>(initialForm);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<SignGenerationOutcome | undefined>(
    undefined,
  );

  const updateForm = useCallback((patch: Partial<SignFormState>) => {
    setForm(previous => ({...previous, ...patch}));
  }, []);

  const generate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const numberFont = await resolveFont(form.numberFontId);
      const nameFont =
        form.style === 'nameAndNumbers'
          ? await resolveFont(form.nameFontId)
          : undefined;

      const config = buildSignConfig(form);
      const outcome = generateSignFiles(config, {numberFont, nameFont}, {
        format: form.format,
        fileGrouping: form.fileGrouping,
        includeMultiLayerSvg: form.includeMultiLayerSvg,
      });
      setResult(outcome);
    } catch (error) {
      setResult({
        ok: false,
        error: {
          stage: 'font',
          fieldErrors: [],
          message:
            error instanceof Error
              ? error.message
              : 'Failed to load the selected font.',
        },
      });
    } finally {
      setIsGenerating(false);
    }
  }, [form]);

  return {
    form,
    updateForm,
    isGenerating,
    result,
    generate,
  };
}
