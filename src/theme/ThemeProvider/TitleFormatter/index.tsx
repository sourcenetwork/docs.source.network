import React, {type ComponentProps, type ReactNode} from 'react';
import {TitleFormatterProvider} from '@docusaurus/theme-common/internal';
import type {Props} from '@theme/ThemeProvider/TitleFormatter';

type FormatterProp = ComponentProps<typeof TitleFormatterProvider>['formatter'];

const formatter: FormatterProp = (params) => {
  let project = undefined
  if (params.plugin.id == 'defradb') {
    project = 'DefraDB';
  } else if (params.plugin.id == 'sourcehub') {
    project = 'SourceHub';
  } else if (params.plugin.id == 'orbis') {
    project = 'Orbis';
  } else if (params.plugin.id == 'lensvm') {
    project = 'LensVM';
  }

  if (project != undefined) {
    return `${params.title} ${params.titleDelimiter} ${project} ${params.titleDelimiter} ${params.siteTitle}`;
  } else {
    return params.defaultFormatter(params);
  }
};

export default function ThemeProviderTitleFormatter({
  children,
}: Props): ReactNode {
  return (
    <TitleFormatterProvider formatter={formatter}>
      {children}
    </TitleFormatterProvider>
  );
}
