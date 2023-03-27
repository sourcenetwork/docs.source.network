import React, { FC } from "react";

const MoonIcon: FC<{ className: string }> = (props) => {
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
      <g>
        <path
          d="M42.8,4.8c3.1,4,5.4,8.8,6.5,14.1c4,18-6.8,36.4-24.5,41.8c-5.2,1.6-10.5,1.9-15.5,1.2c-1.1-0.2-1.8,1.3-0.9,2
            c8.5,7,20.2,10,31.7,7c19.1-5,30.5-24.5,25.5-43.6C62.7,15.8,54.4,7,44.1,3C43,2.6,42.1,3.9,42.8,4.8z"
        />
      </g>
    </svg>
  );
};

export default MoonIcon;
