import { useState, useEffect } from 'react';

export const useGPS = () => {
  const [speedMph, setSpeedMph] = useState<number>(0);
  const [isGPSActive, setIsGPSActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setIsGPSActive(true);
        // Browser speed is natively in meters per second
        // 1 meter/second = 2.23694 miles/hour
        if (position.coords.speed !== null) {
          const mph = position.coords.speed * 2.23694;
          setSpeedMph(Math.round(mph));
        } else {
          // If browser can't calculate speed natively (like a stationary laptop over WiFi)
          setSpeedMph(0);
        }
      },
      (err) => {
        setIsGPSActive(false);
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { speedMph, isGPSActive, error };
};
