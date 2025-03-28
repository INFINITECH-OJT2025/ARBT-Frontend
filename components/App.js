// App.js
import React, { useEffect, useState } from 'react';
import { getFCMToken, listenForMessages } from './firebase'; // Import the functions from firebase.js

const App = () => {
  const [fcmToken, setFcmToken] = useState(null);

  useEffect(() => {
    // Step 1: Request permission to receive notifications and get the token
    const getTokenFromFirebase = async () => {
      const token = await getFCMToken();
      if (token) {
        setFcmToken(token);
        // Step 2: Send the token to your Laravel backend
        sendTokenToBackend(token);
      }
    };

    // Call the function to get the FCM token
    getTokenFromFirebase();

    // Step 3: Listen for incoming Firebase messages
    listenForMessages();
  }, []);

  // Function to send the token to your backend
  const sendTokenToBackend = async (token) => {
    try {
      const response = await fetch('/api/save-token', {
        method: 'POST',
        body: JSON.stringify({ token }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('Token saved:', data);
    } catch (error) {
      console.error('Error sending token to backend:', error);
    }
  };

  return (
    <div>
      <h1>FCM Token: {fcmToken}</h1>
      {/* This is where you can display the token or handle your app UI */}
    </div>
  );
};

export default App;
