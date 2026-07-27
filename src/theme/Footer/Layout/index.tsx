import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import { ThemeClassNames } from '@docusaurus/theme-common';
import styles from "../styles.module.scss";
import type { Props } from '@theme/Footer/Layout';

export default function FooterLayout({ style, links, logo, copyright }: Props): ReactNode {
  return (
    <footer
      className={clsx(ThemeClassNames.layout.footer.container, 'footer', {
        'footer--dark': style === 'dark',
      })}>
      <div className="container">

        <div className={styles.footerMenu}>
          <div className={styles.footerMenuLogo}>
            {logo && <div>{logo}</div>}
          </div>
          <div className={styles.footerMenuLinks}>
            {links}
          </div>
        </div>

        {(copyright) && (
          <div className="footer__bottom">
            {copyright}
          </div>
        )}
      </div>
    </footer>
  );
}
