import Link from "@docusaurus/Link";
import React, { FC } from "react";
import styles from "./styles.module.scss";

interface BreadcrumbsProps {
  links: any[];
  docData?: any;
}

const Breadcrumbs: FC<BreadcrumbsProps> = (props) => {
  const { links = [], docData = null } = props;

  if (!links.length || links.length === 1) return null;

  const paths = links.map((link, index) => {
    if (link.type === "category") {
      return <li>{link.label}</li>;
    }
    if (link.type === "link") {
      return (
        <li>
          <Link href={link.href}>{link.label}</Link>
        </li>
      );
    }
  });

  const docRoot = docData ? (
    <li>
      <Link href={docData.path}>{docData.title}</Link>
    </li>
  ) : null;

  return (
    <ul className={styles.crumbs}>
      {docRoot}
      {paths}
    </ul>
  );
};

export default Breadcrumbs;
