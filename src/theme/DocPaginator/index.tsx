/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import Link from "@docusaurus/Link";
import Translate, { translate } from "@docusaurus/Translate";
import IconThemeArrow from "../IconArrow";
import clsx from "clsx";
import styles from "./styles.module.scss";

const DocPaginator = (props) => {
  const { metadata } = props;

  return (
    <nav
      className="pagination-nav docusaurus-mt-lg"
      aria-label={translate({
        id: "theme.docs.paginator.navAriaLabel",
        message: "Docs pages navigation",
        description: "The ARIA label for the docs pagination",
      })}
    >
      <div className="pagination-nav__item pagination-nav__item--previous">
        {metadata.previous && (
          <Link
            className="pagination-nav__link"
            to={metadata.previous.permalink}
          >
            <div className="pagination-nav__sublabel">
              {/* <Translate
                id="theme.docs.paginator.previous"
                description="The label used to navigate to the previous doc"
              >
                Previous
              </Translate> */}
            </div>
            <div className={clsx("pagination-nav__label")}>
              <IconThemeArrow dir="left" />
              <span>{metadata.previous.title}</span>
            </div>
          </Link>
        )}
      </div>
      <div className="pagination-nav__item pagination-nav__item--next">
        {metadata.next && (
          <Link className="pagination-nav__link" to={metadata.next.permalink}>
            <div className="pagination-nav__sublabel">
              {/* <Translate
                id="theme.docs.paginator.next"
                description="The label used to navigate to the next doc"
              >
                Next
              </Translate> */}
            </div>
            <div className={clsx("pagination-nav__label", styles.icon)}>
              <span>{metadata.next.title}</span>
              <IconThemeArrow dir="right" />
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default DocPaginator;
