import React, { useEffect } from 'react';
import { usePageState } from '../hooks/usePageState';
import { usePreventReload } from '../hooks/usePreventReload';
import ProfileTabs from '../components/profile/ProfileTabs';
import { useAuth } from '../context/AuthContextOptimized';

const Profile: React.FC = () => {
  const { isRestored, saveState } = usePageState('profile');
  const { isPreventingReload } = usePreventReload(true);
  const { state } = useAuth();

  useEffect(() => {
    if (isRestored) {
      // Restore any saved state if needed
    }
  }, [isRestored]);

  const handleUpdateProfile = (data: any) => {
    // Handle profile update logic here
    console.log('Profile updated:', data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Profil użytkownika</h1>
          {state.user ? (
            <ProfileTabs
              user={{
                id: state.user.id,
                email: state.user.email,
                firstName: state.user.name,
                lastName: state.user.name
              }}
              onUpdateProfile={handleUpdateProfile}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Ładowanie profilu...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
