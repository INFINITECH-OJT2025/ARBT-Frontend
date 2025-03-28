// Import the functions you need from the SDKs
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyD4CmuR07_RIo9wyJHzcsOQJ-TaSZh567g',
  authDomain: 'cms-project-1e627.firebaseapp.com',
  projectId: 'cms-project-1e627',
  storageBucket: 'cms-project-1e627.firebasestorage.app',
  messagingSenderId: '1072350483385',
  appId: '1:1072350483385:web:0341d29ce52e72861e5c68',
  measurementId: 'G-5WX0ZHZ4BD',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Messaging
const messaging = getMessaging(app);

// Function to request permission and get FCM token
export const getFCMToken = async () => {
  try {
    // Request permission to show notifications
    await Notification.requestPermission();

    // Get the FCM token
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY', // Replace with your VAPID key
    });

    if (token) {
      console.log('FCM Token:', token);
      return token; // Send this token to your backend
    } else {
      console.error('No registration token available');
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
};

// Function to listen for incoming messages while the app is in the foreground
export const listenForMessages = () => {
  onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    // Handle the incoming message here and show a notification if needed
  });
};
