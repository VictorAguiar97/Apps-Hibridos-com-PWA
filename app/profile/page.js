'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PrivateRoute from '@/components/PrivateRoute';

const Profile = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    email: 'informação não consta',
    name: 'informação não consta',
    uid: 'informação não consta',
  });
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else {
      const { displayName, email, uid } = user;
      setUserData({
        name: displayName || 'informação não consta',
        email: email || 'informação não consta',
        uid: uid || 'informação não consta',
      });
    }
  }, [user, router]);

  return (
    <PrivateRoute>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-400 to-blue-500 p-4 sm:p-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 max-w-md w-full">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            Perfil do Usuário
          </h1>
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gray-100 p-4 sm:p-6 rounded-xl shadow-md flex items-center">
              <span className="font-bold text-lg text-blue-500 mr-2 sm:mr-4">👤 Nome:</span>
              <p className="text-gray-700 text-base sm:text-lg">{userData.name}</p>
            </div>
            <div className="bg-gray-100 p-4 sm:p-6 rounded-xl shadow-md flex items-center">
              <span className="font-bold text-lg text-blue-500 mr-2 sm:mr-4">✉️ Email:</span>
              <p className="text-gray-700 text-base sm:text-lg">{userData.email}</p>
            </div>
            <div className="bg-gray-100 p-4 sm:p-6 rounded-xl shadow-md flex items-center">
              <span className="font-bold text-lg text-blue-500 mr-2 sm:mr-4">🆔 ID do Usuário:</span>
              <p className="text-gray-700 text-base sm:text-lg">{userData.uid}</p>
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  );  
};

export default Profile;