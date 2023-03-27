import React from 'react';
import clsx from 'clsx';
import styles from "../styles.module.scss";


export default function FooterLayout({ style, links, logo, copyright }) {
  return (
    <footer
      className={clsx('footer', {
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
            {/* {logo && <div className="margin-bottom--sm">{logo}</div>} */}
            {copyright}
          </div>
        )}
      </div>
    </footer>
  );
}
