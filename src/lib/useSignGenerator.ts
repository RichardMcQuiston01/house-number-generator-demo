import {useCallback, useState} from 'react';
import {buildSignConfig, generateSignFiles, loadUploadedFont} from './generator';
import {
  DEFAULT_FORM_STATE,
  type FontSlotId,
  type SignFormState,
  type SignGenerationOutcome,
  type UploadedFontFile,
} from './types';

export interface UseSignGeneratorApi {
  readonly form: SignFormState;
  readonly updateForm: (patch: Partial<SignFormState>) => void;
  readonly uploadedFonts: Partial<Record<FontSlotId, UploadedFontFile>>;
  readonly fontUploadError: string | undefined;
  readonly uploadFont: (slot: FontSlotId, file: File) => Promise<void>;
  readonly isGenerating: boolean;
  readonly result: SignGenerationOutcome | undefined;
  readonly generate: () => Promise<void>;
}

/** Owns form state, uploaded fonts, and the generated result for the sign configurator. */
export function useSignGenerator(
  initialForm: SignFormState = DEFAULT_FORM_STATE,
): UseSignGeneratorApi {
  const [form, setForm] = useState<SignFormState>(initialForm);
  const [uploadedFonts, setUploadedFonts] = useState<
    Partial<Record<FontSlotId, UploadedFontFile>>
  >({});
  const [fontUploadError, setFontUploadError] = useState<string | undefined>(
    undefined,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<SignGenerationOutcome | undefined>(
    undefined,
  );

  const updateForm = useCallback((patch: Partial<SignFormState>) => {
    setForm(previous => ({...previous, ...patch}));
  }, []);

  const uploadFont = useCallback(async (slot: FontSlotId, file: File) => {
    const loaded = await loadUploadedFont(slot, file);
    if (!loaded.ok) {
      setFontUploadError(loaded.message);
      return;
    }
    setFontUploadError(undefined);
    setUploadedFonts(previous => ({...previous, [slot]: loaded.value}));
  }, []);

  const generate = useCallback(async () => {
    const numberFont = uploadedFonts.numberFont;
    if (!numberFont) {
      setResult({
        ok: false,
        error: {
          stage: 'font',
          fieldErrors: [],
          message: 'Upload a font file for the house number before generating.',
        },
      });
      return;
    }

    setIsGenerating(true);
    try {
      const config = buildSignConfig(form);
      const outcome = generateSignFiles(
        config,
        {numberFont, nameFont: uploadedFonts.nameFont},
        form.format,
      );
      setResult(outcome);
    } finally {
      setIsGenerating(false);
    }
  }, [form, uploadedFonts]);

  return {
    form,
    updateForm,
    uploadedFonts,
    fontUploadError,
    uploadFont,
    isGenerating,
    result,
    generate,
  };
}
