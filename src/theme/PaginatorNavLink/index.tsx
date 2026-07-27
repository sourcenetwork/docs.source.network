import Link from "@docusaurus/Link";
import clsx from "clsx";
import React, { type ReactNode } from "react";
import IconThemeArrow from "../IconArrow/index";
import type { Props } from "@theme/PaginatorNavLink";

export default function PaginatorNavLink(props: Props): ReactNode {
  const { permalink, title, subLabel, isNext } = props;
  return (
    <Link
      className={clsx(
        "pagination-nav__link",
        isNext ? "pagination-nav__link--next" : "pagination-nav__link--prev"
      )}
      to={permalink}
    >
      {subLabel && <div className="pagination-nav__sublabel">{subLabel}</div>}
      <div className="pagination-nav__label">
        <IconThemeArrow
          className={clsx("pagination-nav__arrow", {
            "pagination-nav__arrow--next": isNext,
            "pagination-nav__arrow--prev": !isNext,
          })}
          dir={isNext ? "right" : "left"}
        />
        <span>{title}</span>
      </div>
    </Link>
  );
}
