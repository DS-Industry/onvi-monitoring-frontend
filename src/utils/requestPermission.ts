// src/utils/requestPermission.ts
import { messaging, getToken } from './firebase';

const VAPID_KEY =
  'BP50TwuAYT4lkYN-3rpXcA5bfCszuigV4bbghddRlsoXpDAL9_Kb1UN0Cq8oSyFRM5Mc-n1GRjxhH-CYDA9C3kI'; // Found in Firebase > Cloud Messaging

export const requestFirebaseNotificationPermission = async (): Promise<
  string | null
> => {
  try {
    const status = await Notification.requestPermission();
    if (status !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    // console.log("FCM token:", token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token', error);
    return null;
  }
};
