import {FONT_CATALOG} from '../../lib/fonts';
import type {
  AssemblyConfig,
  FileGrouping,
  SignShape,
  SignStyle,
  Unit,
} from '../../lib/types';

export interface SelectOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

export const FONT_OPTIONS: readonly SelectOption<string>[] = FONT_CATALOG.map(
  entry => ({value: entry.id, label: entry.label}),
);

export const STYLE_OPTIONS: readonly SelectOption<SignStyle>[] = [
  {value: 'numbersOnly', label: 'Numbers only'},
  {value: 'nameAndNumbers', label: 'Name + numbers'},
];

export const SHAPE_OPTIONS: readonly SelectOption<SignShape>[] = [
  {value: 'square', label: 'Square'},
  {value: 'rectangle', label: 'Rectangle'},
  {value: 'round', label: 'Round'},
];

export const UNIT_OPTIONS: readonly SelectOption<Unit>[] = [
  {value: 'in', label: 'Inches (in)'},
  {value: 'mm', label: 'Millimeters (mm)'},
];

export const ASSEMBLY_OPTIONS: readonly SelectOption<AssemblyConfig['type']>[] =
  [
    {value: 'hardware', label: 'Hardware (screws)'},
    {value: 'adhesive', label: 'Adhesive'},
  ];

export const FILE_GROUPING_OPTIONS: readonly SelectOption<FileGrouping>[] = [
  {value: 'individual', label: 'Individual (one file per glyph)'},
  {value: 'grouped', label: 'Grouped (one file per number/name group)'},
];
