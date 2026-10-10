import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useGeolocation } from '@/shared/lib/use-geolocation';

interface PlaceSearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export interface LocationMapDialogProps {
  open: boolean;
  onClose: () => void;
  initialAddress?: string;
  initialLat?: number | null;
  initialLon?: number | null;
  onSelectLocation: (loc: { address: string; lat: number; lon: number }) => void;
}

const DEFAULT_LAT = 51.505;
const DEFAULT_LON = -0.09;

const createCustomIcon = () =>
  L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: #0284c7;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        margin-left: -16px;
        margin-top: -32px;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: #ffffff;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

export const LocationMapDialog: React.FC<LocationMapDialogProps> = ({
  open,
  onClose,
  initialAddress = '',
  initialLat,
  initialLon,
  onSelectLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [selectedLat, setSelectedLat] = useState<number>(initialLat ?? DEFAULT_LAT);
  const [selectedLon, setSelectedLon] = useState<number>(initialLon ?? DEFAULT_LON);
  const [address, setAddress] = useState<string>(initialAddress);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

  const { loading: gpsLoading, getCurrentLocation } = useGeolocation();

  const NOMINATIM_BASE_URL = import.meta.env.DEV
    ? '/nominatim'
    : 'https://nominatim.openstreetmap.org';

  // Reverse geocode lat/lon into address name using Nominatim API
  const reverseGeocode = useCallback(
    async (lat: number, lon: number) => {
      setIsGeocoding(true);
      try {
        const res = await fetch(
          `${NOMINATIM_BASE_URL}/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
          {
            headers: {
              'Accept-Language': 'en-US,en;q=0.9',
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          const formatted =
            data.display_name ||
            [data.address?.road, data.address?.suburb, data.address?.city || data.address?.town]
              .filter(Boolean)
              .join(', ') ||
            `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          setAddress(formatted);
        }
      } catch {
        // Keep existing address or fallback
        if (!address) {
          setAddress(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        }
      } finally {
        setIsGeocoding(false);
      }
    },
    [address],
  );

  // Update position helper
  const updatePosition = useCallback(
    (lat: number, lon: number, fetchAddress = true) => {
      setSelectedLat(lat);
      setSelectedLon(lon);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lon], 16);
      }

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
      }

      if (fetchAddress) {
        reverseGeocode(lat, lon);
      }
    },
    [reverseGeocode],
  );

  // Initialize map when dialog opens
  useEffect(() => {
    if (!open) return;

    const lat = initialLat ?? DEFAULT_LAT;
    const lon = initialLon ?? DEFAULT_LON;
    setSelectedLat(lat);
    setSelectedLon(lon);
    setAddress(initialAddress);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);

    // Timeout allows DOM element in Dialog to be laid out before initializing Leaflet
    const timer = setTimeout(async () => {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      let startLat = initialLat ?? DEFAULT_LAT;
      let startLon = initialLon ?? DEFAULT_LON;
      let hasCustomStart = Boolean(initialLat && initialLon);

      if (!hasCustomStart) {
        const loc = await getCurrentLocation();
        if (loc) {
          startLat = loc.latitude;
          startLon = loc.longitude;
          hasCustomStart = true;
          setSelectedLat(startLat);
          setSelectedLon(startLon);
          if (loc.address) {
            setAddress(loc.address);
          }
        }
      }

      const map = L.map(mapContainerRef.current).setView(
        [startLat, startLon],
        hasCustomStart ? 16 : 13,
      );
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([startLat, startLon], {
        icon: createCustomIcon(),
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setSelectedLat(position.lat);
        setSelectedLon(position.lng);
        reverseGeocode(position.lat, position.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat: clickLat, lng: clickLon } = e.latlng;
        marker.setLatLng([clickLat, clickLon]);
        setSelectedLat(clickLat);
        setSelectedLon(clickLon);
        reverseGeocode(clickLat, clickLon);
      });

      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [open, initialLat, initialLon, initialAddress, reverseGeocode]);

  // Handle places search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `${NOMINATIM_BASE_URL}/search?format=jsonv2&q=${encodeURIComponent(
          searchQuery.trim(),
        )}&limit=5`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
          },
        },
      );
      if (res.ok) {
        const data: PlaceSearchResult[] = await res.json();
        setSearchResults(data);
        setShowResults(true);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: PlaceSearchResult) => {
    const lat = Number.parseFloat(result.lat);
    const lon = Number.parseFloat(result.lon);
    setAddress(result.display_name);
    setShowResults(false);
    updatePosition(lat, lon, false);
  };

  const handleFetchGps = async () => {
    const loc = await getCurrentLocation();
    if (loc) {
      setAddress(loc.address);
      updatePosition(loc.latitude, loc.longitude, false);
    }
  };

  const handleConfirm = () => {
    onSelectLocation({
      address,
      lat: selectedLat,
      lon: selectedLon,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          fontWeight: 700,
        }}
      >
        <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
          Select Location on Map
        </Typography>
        <IconButton aria-label="close" onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {/* Search bar for open source places search */}
        <div style={{ position: 'relative', width: '100%' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search places, streets or landmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {isSearching ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <IconButton size="small" onClick={handleSearch} aria-label="Search location">
                        <SearchIcon fontSize="small" />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              },
            }}
          />

          {showResults && searchResults.length > 0 && (
            <Paper
              elevation={4}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1000,
                marginTop: 4,
                maxHeight: 200,
                overflowY: 'auto',
                borderRadius: 8,
              }}
            >
              {searchResults.map((res) => (
                <div
                  key={res.place_id}
                  onClick={() => handleSelectSearchResult(res)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSelectSearchResult(res);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--mui-palette-divider)',
                    fontSize: '0.85rem',
                  }}
                >
                  {res.display_name}
                </div>
              ))}
            </Paper>
          )}
        </div>

        {/* Map Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 320,
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid var(--mui-palette-divider)',
          }}
        >
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

          <IconButton
            size="small"
            onClick={handleFetchGps}
            disabled={gpsLoading}
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              zIndex: 500,
              backgroundColor: 'var(--mui-palette-background-paper)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            }}
            aria-label="Jump to current location"
          >
            {gpsLoading ? (
              <CircularProgress size={18} color="primary" />
            ) : (
              <MyLocationIcon fontSize="small" color="primary" />
            )}
          </IconButton>
        </div>

        {/* Location Info Footer */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            backgroundColor: 'var(--mui-palette-action-hover)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              SELECTED ADDRESS
            </Typography>
            {isGeocoding && <CircularProgress size={14} />}
          </div>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {address || 'No location selected'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Coordinates: {selectedLat.toFixed(5)}, {selectedLon.toFixed(5)}
          </Typography>
        </div>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Confirm Location
        </Button>
      </DialogActions>
    </Dialog>
  );
};
