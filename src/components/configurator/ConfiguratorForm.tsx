import type {FormEvent} from 'react';
import type {UseSignGeneratorApi} from '../../lib/useSignGenerator';
import {
  ASSEMBLY_OPTIONS,
  FILE_GROUPING_OPTIONS,
  FONT_OPTIONS,
  FORMAT_OPTIONS,
  SCREW_SIZE_OPTIONS,
  SHAPE_OPTIONS,
  STYLE_OPTIONS,
  UNIT_OPTIONS,
} from './constants';
import {CheckboxField} from './CheckboxField';
import {GenerationErrors} from './GenerationErrors';
import {NumberField} from './NumberField';
import {RadioGroup} from './RadioGroup';
import {SelectField} from './SelectField';
import {TextField} from './TextField';

interface ConfiguratorFormProps {
  readonly api: UseSignGeneratorApi;
}

const SECTION_HEADING_CLASSES =
  'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400';

export function ConfiguratorForm(props: ConfiguratorFormProps): JSX.Element {
  const {api} = props;
  const {form} = api;
  const isNameAndNumbers = form.style === 'nameAndNumbers';

  const handleHouseNumberChange = (value: string): void => {
    api.updateForm({houseNumber: value.replace(/[^0-9]/g, '')});
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void api.generate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <h2 className={SECTION_HEADING_CLASSES}>Style</h2>
        <RadioGroup
          name="configurator-style"
          legend="Sign style"
          value={form.style}
          options={STYLE_OPTIONS}
          onChange={style => api.updateForm({style})}
        />
      </section>

      <section className="space-y-4">
        <h2 className={SECTION_HEADING_CLASSES}>Text</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="configurator-house-number"
            label="House number"
            value={form.houseNumber}
            onChange={handleHouseNumberChange}
            required
            placeholder="742"
            hint="Digits 0-9 only."
          />
          {isNameAndNumbers && (
            <TextField
              id="configurator-name"
              label="Name"
              value={form.name}
              onChange={name => api.updateForm({name})}
              required
              placeholder="Evergreen Terrace"
            />
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className={SECTION_HEADING_CLASSES}>Fonts</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="configurator-number-font"
            label="Number font"
            value={form.numberFontId}
            options={FONT_OPTIONS}
            onChange={numberFontId => api.updateForm({numberFontId})}
          />
          {isNameAndNumbers && (
            <SelectField
              id="configurator-name-font"
              label="Name font"
              value={form.nameFontId}
              options={FONT_OPTIONS}
              onChange={nameFontId => api.updateForm({nameFontId})}
            />
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className={SECTION_HEADING_CLASSES}>Shape &amp; size</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="configurator-shape"
            label="Sign shape"
            value={form.shape}
            options={SHAPE_OPTIONS}
            onChange={shape => api.updateForm({shape})}
          />
          <SelectField
            id="configurator-unit"
            label="Unit"
            value={form.unit}
            options={UNIT_OPTIONS}
            onChange={unit => api.updateForm({unit})}
          />
          <NumberField
            id="configurator-number-height"
            label="Number height"
            value={form.numberHeight}
            unitLabel={form.unit}
            min={0}
            onChange={numberHeight =>
              api.updateForm({numberHeight: numberHeight ?? 0})
            }
          />
          {isNameAndNumbers && (
            <NumberField
              id="configurator-name-height"
              label="Name height (optional)"
              value={form.nameHeight}
              unitLabel={form.unit}
              min={0}
              optional
              onChange={nameHeight => api.updateForm({nameHeight})}
            />
          )}
          <NumberField
            id="configurator-margin"
            label="Margin"
            value={form.margin}
            unitLabel={form.unit}
            min={0}
            onChange={margin => api.updateForm({margin: margin ?? 0})}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className={SECTION_HEADING_CLASSES}>Assembly</h2>
        <RadioGroup
          name="configurator-assembly"
          legend="Assembly type"
          value={form.assemblyType}
          options={ASSEMBLY_OPTIONS}
          onChange={assemblyType => api.updateForm({assemblyType})}
        />
        {form.assemblyType === 'hardware' && (
          <div className="max-w-xs">
            <SelectField
              id="configurator-screw-size"
              label="Screw size"
              value={form.screwSize}
              options={SCREW_SIZE_OPTIONS}
              onChange={screwSize => api.updateForm({screwSize})}
            />
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className={SECTION_HEADING_CLASSES}>Output</h2>
        <div className="max-w-xs">
          <SelectField
            id="configurator-format"
            label="Output format"
            value={form.format}
            options={FORMAT_OPTIONS}
            onChange={format => api.updateForm({format})}
          />
        </div>
        <RadioGroup
          name="configurator-file-grouping"
          legend="Cut file grouping"
          value={form.fileGrouping}
          options={FILE_GROUPING_OPTIONS}
          onChange={fileGrouping => api.updateForm({fileGrouping})}
        />
        <CheckboxField
          id="configurator-multi-layer-svg"
          label="Include a multi-layer combined SVG"
          checked={form.includeMultiLayerSvg}
          onChange={includeMultiLayerSvg =>
            api.updateForm({includeMultiLayerSvg})
          }
          hint="One SVG with the backer, numbers, and name each on their own colored layer."
        />
      </section>

      <GenerationErrors outcome={api.result} />

      <button
        type="submit"
        disabled={api.isGenerating}
        aria-busy={api.isGenerating}
        className="inline-flex items-center justify-center rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {api.isGenerating ? 'Generating…' : 'Generate Sign'}
      </button>
    </form>
  );
}
