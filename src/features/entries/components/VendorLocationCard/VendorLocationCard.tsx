import LocationOnIcon from '@mui/icons-material/LocationOn';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StorefrontIcon from '@mui/icons-material/Storefront';
import Typography from '@mui/material/Typography';
import type React from 'react';
import type { Entry } from '@/data/client/types';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import styles from './VendorLocationCard.module.scss';
import { styles as muiStyles } from './VendorLocationCard.styles';

export interface Props {
  entry: Entry;
}

export const VendorLocationCard: React.FC<Props> = ({ entry }) => {
  const hasVendorOrLocation = Boolean(
    entry.vendor_name || (entry.lat !== undefined && entry.lon !== undefined),
  );

  if (!hasVendorOrLocation) {
    return null;
  }

  const hasCoords = entry.lat !== undefined && entry.lon !== undefined;

  return (
    <GlassCard style={muiStyles.card}>
      <div style={muiStyles.headerRow}>
        <div style={muiStyles.headerTitleGroup}>
          <StorefrontIcon sx={muiStyles.icon} />
          <Typography variant="caption" sx={muiStyles.title}>
            Vendor &amp; Location
          </Typography>
        </div>
        {entry.business ? (
          <span className={styles.businessLocationBadge}>Business Location</span>
        ) : null}
      </div>

      <div className={styles.vendorCard}>
        <div className={styles.vendorIconWell}>
          <LocationOnIcon sx={muiStyles.markerIcon} />
        </div>
        <div style={muiStyles.vendorDetailsRow}>
          {entry.vendor_name && (
            <span style={muiStyles.vendorName}>{entry.vendor_name}</span>
          )}
          {hasCoords && (
            <span style={muiStyles.coordsText}>
              {entry.lat?.toFixed(5)}, {entry.lon?.toFixed(5)}
            </span>
          )}
        </div>
      </div>

      {hasCoords && (
        <a
          href={`https://maps.google.com/?q=${entry.lat},${entry.lon}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mapsButton}
        >
          <span>Open in Google Maps</span>
          <OpenInNewIcon sx={muiStyles.mapLinkIcon} />
        </a>
      )}
    </GlassCard>
  );
};

export default VendorLocationCard;
