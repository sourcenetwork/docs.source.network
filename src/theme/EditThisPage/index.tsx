import React, { type ReactNode } from 'react';
import Translate from '@docusaurus/Translate';
import { ThemeClassNames } from '@docusaurus/theme-common';
import { VscGithub } from "react-icons/vsc";
import type { Props } from '@theme/EditThisPage';

export default function EditThisPage({ editUrl }: Props): ReactNode {
  return (
    <a
      href={editUrl}
      target="_blank"
      rel="noreferrer noopener"
      className={ThemeClassNames.common.editThisPage}>
      <VscGithub />

      <Translate
        id="theme.common.editThisPage"
        description="The link label to edit the current page">
        Edit this page
      </Translate>
    </a>
  );
}
