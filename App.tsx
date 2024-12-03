import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navigation } from './navigation';

import '@react-native-firebase/app';
import '@react-native-firebase/messaging';
import './config/firebaseConfig';
export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}