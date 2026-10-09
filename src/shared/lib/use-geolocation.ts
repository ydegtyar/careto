import { useState } from 'react';

export interface LocationDetails {
  address: string;
  latitude: number;
  longitude: number;
}

export interface UseGeolocationResult {
  loading: boolean;
  error: string | null;
  getCurrentAddress: () => Promise<string | null>;
  getCurrentLocation: () => Promise<LocationDetails | null>;
}

export function useGeolocation(): UseGeolocationResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = async (): Promise<LocationDetails | null> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return null;
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
              {
                headers: {
                  'Accept-Language': 'en-US,en;q=0.9',
                },
              },
            );

            if (!res.ok) {
              throw new Error('Failed to fetch address from location service.');
            }

            const data = await res.json();
            const address =
              data.display_name ||
              [data.address?.road, data.address?.suburb, data.address?.city || data.address?.town]
                .filter(Boolean)
                .join(', ') ||
              `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

            setLoading(false);
            resolve({ address, latitude, longitude });
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error fetching location address.';
            setError(message);
            setLoading(false);
            resolve(null);
          }
        },
        (geoError) => {
          let msg = 'Failed to retrieve device location.';
          if (geoError.code === geoError.PERMISSION_DENIED) {
            msg = 'Location permission denied. Please allow location access in your browser.';
          } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            msg = 'Location information is unavailable.';
          } else if (geoError.code === geoError.TIMEOUT) {
            msg = 'Location request timed out.';
          }
          setError(msg);
          setLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        },
      );
    });
  };

  const getCurrentAddress = async (): Promise<string | null> => {
    const loc = await getCurrentLocation();
    return loc ? loc.address : null;
  };

  return { loading, error, getCurrentAddress, getCurrentLocation };
}
