// Component ejected from Docusaurus

import React from 'react';

export default function IconExternalLink({width = 13.5, height = 13.5}) {
  const scaledHeight = width * (13 / 16);
  return (
    <svg
      width={width}
      height={scaledHeight}
      viewBox="0 0 16 13"
      aria-label="(opens in new tab)"
      style={{
        marginLeft: '0.3rem',
        verticalAlign: 'middle',
        transform: 'rotate(-45deg)',
        fill: 'currentColor',
      }}>
      <path d="M15.4609 6.79387C15.7808 6.47395 15.7808 5.95525 15.4609 5.63533L10.2475 0.421917C9.92756 0.101996 9.40887 0.101996 9.08895 0.421917C8.76903 0.741838 8.76903 1.26053 9.08895 1.58045L13.7231 6.2146L9.08895 10.8487C8.76903 11.1687 8.76903 11.6874 9.08895 12.0073C9.40887 12.3272 9.92756 12.3272 10.2475 12.0073L15.4609 6.79387ZM0.955078 7.03381H14.8816V5.39539H0.955078V7.03381Z" />
    </svg>
  );
}
