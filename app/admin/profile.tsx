"use client";
import Sidebar from '@/components/sidebar';
import { useState, useEffect } from 'react';

interface UserData {
  email: string;
  username: string;
}

const Profile = () => {
  // Define the state with the appropriate type
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Fetch user profile data
    fetch('/api/user-profile')
      .then((response) => response.json())
      .then((data: UserData) => setUserData(data)); // Type the response
  }, []);

  return (
  
    <div className="p-4">
        <Sidebar/>
      <h1 className="text-4xl font-bold mb-4">Your Profile</h1>
      {userData ? (
        <div>
          <div>Email: {userData.email}</div>
          <div>Username: {userData.username}</div>
          {/* Form to update profile */}
        </div>
      ) : (
        <div>Loading profile..sdsfsdsdsds.</div>
      )}
    </div>
  );
};

export default Profile;
