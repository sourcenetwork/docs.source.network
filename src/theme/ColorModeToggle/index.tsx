import { translate } from '@docusaurus/Translate';
import useIsBrowser from '@docusaurus/useIsBrowser';
import clsx from 'clsx';
import React, { FC, memo, useRef, useState } from 'react';
import MoonIcon from './MoonIcon';
import styles from './styles.module.scss';
import SunIcon from './SunIcon';

const Toggle: FC<any> = memo(
  ({ className, disabled, value, onChange }) => {

    const inputRef = useRef(null);
    const isBrowser = useIsBrowser();
    const [checked, setChecked] = useState(value === "light");
    const [focused, setFocused] = useState(false);

    const title = translate(
      {
        message: 'Switch between dark and light mode (currently {mode})',
        id: 'theme.colorToggle.ariaLabel',
        description: 'The ARIA label for the navbar color mode toggle',
      },
      {
        mode:
          value === 'dark'
            ? translate({
              message: 'dark mode',
              id: 'theme.colorToggle.ariaLabel.mode.dark',
              description: 'The name for the dark color mode',
            })
            : translate({
              message: 'light mode',
              id: 'theme.colorToggle.ariaLabel.mode.light',
              description: 'The name for the light color mode',
            }),
      },
    );

    return (
      <div
        className={clsx(styles.toggle, className, {
          [styles.toggleChecked]: checked,
          [styles.toggleFocused]: focused,
          [styles.toggleDisabled]: disabled,
          [styles.toggleButtonDisabled]: !isBrowser
        })}
      >
        <div
          className={styles.toggleTrack}
          role="button"
          tabIndex={-1}
          onClick={() => inputRef.current?.click()}
        >
          <div className={styles.toggleTrackCheck} />
          <div className={styles.toggleTrackX} />
          <div className={styles.toggleTrackThumb}>
            <MoonIcon className={styles.light} />
            <SunIcon className={styles.dark} />
          </div>
        </div>

        <input
          ref={inputRef}
          checked={checked}
          type="checkbox"
          className={styles.toggleScreenReader}
          disabled={!isBrowser}
          aria-label={title}
          aria-live="polite"
          onChange={() => onChange(value === 'dark' ? 'light' : 'dark')}
          onClick={() => setChecked(!checked)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              inputRef.current?.click();
            }
          }}
        />
      </div>
    );
  }
);


function ColorModeToggle(props) {
  const { className } = props;
  return (
    <div className={clsx(styles.toggle, className)}>
      <Toggle {...props} />
    </div>
  );
}

export default React.memo(ColorModeToggle);
