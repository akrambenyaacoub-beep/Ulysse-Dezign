import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export const useNativePlatform = () => {
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState('web');
  const [deviceInfo, setDeviceInfo] = useState(null);

  useEffect(() => {
    // Détecter si on est sur une app native
    const isNativePlatform = Capacitor.isNativePlatform();
    setIsNative(isNativePlatform);

    if (isNativePlatform) {
      const currentPlatform = Capacitor.getPlatform();
      setPlatform(currentPlatform);

      // Récupérer les infos de l'appareil
      import('@capacitor/device')
        .then(({ Device }) => {
          Device.getInfo().then(info => {
            setDeviceInfo(info);
          });
          Device.getBatteryInfo().then(battery => {
            console.log('Batterie:', battery);
          });
        })
        .catch(err => {
          console.warn('Plugin Device non disponible:', err);
        });
    }
  }, []);

  return { isNative, platform, deviceInfo };
};

export default useNativePlatform;