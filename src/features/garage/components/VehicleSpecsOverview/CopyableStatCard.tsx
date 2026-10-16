import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import styles from './CopyableStatCard.module.scss';
import { statStyles } from './CopyableStatCard.styles';

export interface Props {
  label: string;
  value?: string;
  isMonospace?: boolean;
}

export const CopyableStatCard: React.FC<Props> = ({ label, value, isMonospace = false }) => {
  const [copied, setCopied] = useState(false);
  const displayValue = value || 'Not provided';
  const hasValue = Boolean(value);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = useCallback(async () => {
    if (!hasValue || !value) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      }
      setCopied(true);
    } catch (err) {
      console.error(`Failed to copy ${label}:`, err);
    }
  }, [hasValue, value, label]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCopy();
    }
  };

  const cardInner = (
    <>
      <Typography variant="caption" sx={statStyles.label}>
        {label}
      </Typography>

      <div className={styles.valueRow}>
        <Typography
          variant="body2"
          sx={{
            ...statStyles.value,
            ...(isMonospace ? statStyles.monospaceValue : {}),
            color: copied ? 'success.main' : 'text.primary',
          }}
        >
          {displayValue}
        </Typography>

        {hasValue && (
          <div
            className={classNames(styles.iconIndicator, {
              [styles.copied]: copied,
            })}
          >
            {copied ? (
              <CheckIcon sx={{ fontSize: 14 }} />
            ) : (
              <ContentCopyIcon sx={{ fontSize: 14 }} />
            )}
          </div>
        )}
      </div>
    </>
  );

  if (!hasValue) {
    return <div className={classNames(styles.card, styles.disabled)}>{cardInner}</div>;
  }

  return (
    <Tooltip title={copied ? 'Copied!' : `Click to copy ${label}`} arrow enterDelay={200}>
      <button
        type="button"
        aria-label={`Copy ${label}: ${value}`}
        onClick={handleCopy}
        onKeyDown={handleKeyDown}
        className={classNames(styles.card, styles.clickable)}
      >
        {cardInner}
      </button>
    </Tooltip>
  );
};

export default CopyableStatCard;
