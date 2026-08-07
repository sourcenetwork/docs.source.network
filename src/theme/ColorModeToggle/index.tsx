import { translate } from "@docusaurus/Translate";
import useIsBrowser from "@docusaurus/useIsBrowser";
import type { Props } from "@theme/ColorModeToggle";
import clsx from "clsx";
import React, { type ReactNode } from "react";
import MoonIcon from "./MoonIcon";
import styles from "./styles.module.scss";
import SunIcon from "./SunIcon";

function ColorModeToggle({ className, value, onChange }: Props): ReactNode {
  const isBrowser = useIsBrowser();

  const title = translate(
    {
      message: "Switch between dark and light mode (currently {mode})",
      id: "theme.colorToggle.ariaLabel",
      description: "The ARIA label for the navbar color mode toggle",
    },
    {
      mode:
        value === "dark"
          ? translate({
              message: "dark mode",
              id: "theme.colorToggle.ariaLabel.mode.dark",
              description: "The name for the dark color mode",
            })
          : translate({
              message: "light mode",
              id: "theme.colorToggle.ariaLabel.mode.light",
              description: "The name for the light color mode",
            }),
    },
  );

  return (
    <button
      type="button"
      className={clsx("color-mode-toggle", styles.toggleButton, className)}
      disabled={!isBrowser}
      title={title}
      aria-label={title}
      aria-live="polite"
      onClick={() => onChange(value === "dark" ? "light" : "dark")}
    >
      <MoonIcon className={styles.light} />
      <SunIcon className={styles.dark} />
    </button>
  );
}

export default React.memo(ColorModeToggle);
