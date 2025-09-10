import { useState, useEffect } from 'react';

interface GeolocationState {
  loading: boolean;
  error: GeolocationPositionError | null;
  position: GeolocationPosition | null;
}

export const useGeolocation = (): GeolocationState => {
  const [state, setState] = useState<GeolocationState>({
    loading: true,
    error: null,
    position: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prevState) => ({
        ...prevState,
        loading: false,
        error: {
          code: 2, // POSITION_UNAVAILABLE
          message: 'Geolocation is not supported by your browser',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError,
      }));
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        loading: false,
        error: null,
        position,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setState((prevState) => ({
        ...prevState,
        loading: false,
        error,
      }));
    };

    const options = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

  }, []);

  return state;
};