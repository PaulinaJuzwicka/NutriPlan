import React from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileTabs from '../components/profile/ProfileTabs';

const Profile: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <ProfileTabs />
      </div>
    </div>
  );
};

export default Profile;