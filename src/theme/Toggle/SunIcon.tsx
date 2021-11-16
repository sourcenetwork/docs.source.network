import React, { FC } from "react";

const SunIcon: FC<{ className: string }> = (props) => {
  return (
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 75 75"
      xmlSpace="preserve"
      {...props}
    >
      <path
        d="M37.5,53.9c-9.1,0-16.4-7.4-16.4-16.4s7.4-16.4,16.4-16.4s16.4,7.4,16.4,16.4S46.6,53.9,37.5,53.9z M37.5,26.1
	c-6.3,0-11.4,5.1-11.4,11.4s5.1,11.4,11.4,11.4s11.4-5.1,11.4-11.4S43.8,26.1,37.5,26.1z"
      />
      <rect x="35" y="5.5" width="5" height="8.9" />
      <rect
        x="11.1"
        y="19.3"
        transform="matrix(0.5 -0.866 0.866 0.5 -13.7261 23.674)"
        width="5"
        height="8.9"
      />
      <rect
        x="9.2"
        y="48.8"
        transform="matrix(0.866 -0.5 0.5 0.866 -23.811 13.6893)"
        width="8.9"
        height="5"
      />
      <rect x="35" y="60.6" width="5" height="8.9" />
      <rect
        x="58.9"
        y="46.8"
        transform="matrix(0.5 -0.866 0.866 0.5 -13.7255 78.7796)"
        width="5"
        height="8.9"
      />
      <rect
        x="56.9"
        y="21.2"
        transform="matrix(0.866 -0.5 0.5 0.866 -3.6411 33.8592)"
        width="8.9"
        height="5"
      />
    </svg>
  );
};

export default SunIcon;
