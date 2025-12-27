import { AdMob } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Interstitial Ad Unit ID
const INTERSTITIAL_AD_UNIT_ID = 'ca-app-pub-8396981938969998/1925236354';

let isAdMobInitialized = false;
let interstitialAdLoaded = false;

/**
 * Initialize AdMob (only needs to be called once)
 */
export const initializeAdMob = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform() || isAdMobInitialized) {
    return;
  }

  try {
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: [],
      initializeForTesting: false,
    });
    isAdMobInitialized = true;
    console.log('AdMob initialized');
  } catch (error) {
    console.error('AdMob initialization error:', error);
  }
};

/**
 * Preload an interstitial ad
 */
export const prepareInterstitial = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform() || !isAdMobInitialized) {
    await initializeAdMob();
  }

  if (interstitialAdLoaded) {
    return; // Already loaded
  }

  try {
    await AdMob.prepareInterstitial({
      adId: INTERSTITIAL_AD_UNIT_ID,
      isTesting: false,
    });
    interstitialAdLoaded = true;
    console.log('Interstitial ad prepared');
  } catch (error) {
    console.error('Error preparing interstitial ad:', error);
  }
};

/**
 * Show an interstitial ad
 * This will automatically prepare a new ad after showing
 */
export const showInterstitial = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Ensure AdMob is initialized
    if (!isAdMobInitialized) {
      await initializeAdMob();
    }

    // Prepare ad if not already loaded
    if (!interstitialAdLoaded) {
      await prepareInterstitial();
    }

    // Show the ad
    await AdMob.showInterstitial({
      adId: INTERSTITIAL_AD_UNIT_ID,
    });

    // Reset loaded flag so we prepare a new ad for next time
    interstitialAdLoaded = false;

    // Preload next ad in background
    prepareInterstitial().catch(console.error);
  } catch (error) {
    console.error('Error showing interstitial ad:', error);
    // Reset flag on error so we can try again
    interstitialAdLoaded = false;
  }
};

/**
 * Preload interstitial ad on app start (call this early)
 */
export const preloadInterstitial = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  await initializeAdMob();
  await prepareInterstitial();
};

