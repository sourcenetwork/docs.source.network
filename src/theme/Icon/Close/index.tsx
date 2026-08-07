import type { Props } from "@theme/Icon/Close";
import { type ReactNode } from "react";

export default function IconClose({
  width = 24,
  height = 24,
  className,
  ...restProps
}: Props): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...restProps}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
