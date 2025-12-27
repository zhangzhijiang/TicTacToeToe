import React, { useEffect, useRef } from 'react';
import { AdMob } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

interface AdMobProps {
  adUnitId: string;
  position?: 'top' | 'bottom';
  className?: string;
}

const AdMobBanner: React.FC<AdMobProps> = ({
  adUnitId,
  position = 'bottom',
  className = '',
}) => {
  const bannerAdRef = useRef<string | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only initialize on native platforms (Android/iOS)
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const initializeAdMob = async () => {
      try {
        // Initialize AdMob (only needs to be called once)
        if (!isInitialized.current) {
          await AdMob.initialize({
            requestTrackingAuthorization: true,
            testingDevices: [],
            initializeForTesting: false,
          });
          isInitialized.current = true;
        }

        // Prepare banner ad
        const options = {
          adId: adUnitId,
          adSize: 'BANNER',
          position: position === 'top' ? 'TOP_CENTER' : 'BOTTOM_CENTER',
          margin: 0,
          isTesting: false,
        };

        // Show banner ad
        const bannerAdId = await AdMob.showBanner(options);
        bannerAdRef.current = bannerAdId;

        return () => {
          // Cleanup: hide banner when component unmounts
          if (bannerAdRef.current) {
            AdMob.hideBanner({ id: bannerAdRef.current });
          }
        };
      } catch (error) {
        console.error('AdMob initialization error:', error);
      }
    };

    initializeAdMob();

    // Cleanup function
    return () => {
      if (bannerAdRef.current) {
        AdMob.hideBanner({ id: bannerAdRef.current }).catch(console.error);
      }
    };
  }, [adUnitId, position]);

  // This component doesn't render anything visible
  // The ad is shown natively by the AdMob plugin
  return <div className={className} style={{ height: position === 'top' ? '50px' : '50px' }} />;
};

export default AdMobBanner;

