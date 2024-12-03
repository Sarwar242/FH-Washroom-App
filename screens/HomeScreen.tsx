// src/screens/HomeScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../constants';
import { WashroomSection } from '../components/WashroomSection';
import { styles } from '../styles';
import { Washroom } from '../helpers/types';

// Configure axios defaults
axios.defaults.baseURL = BASE_URL;

export const HomeScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [washrooms, setWashrooms] = useState<Washroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [waitingForToilets, setWaitingForToilets] = useState<number[]>([]);

  // Setup axios interceptor for token
  useEffect(() => {
    const setupAxiosInterceptor = async () => {
      const token = await AsyncStorage.getItem('@WashroomApp:token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    };
    setupAxiosInterceptor();
  }, []);

  const fetchWashrooms = async () => {
    try {
      const response = await axios.get<Washroom[]>('/washrooms');
      setWashrooms(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        await signOut();
      } else {
        Alert.alert('Error', 'Failed to fetch washrooms');
      }
      console.error('Fetch washrooms error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWashrooms();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchWashrooms();
    const interval = setInterval(fetchWashrooms, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOccupy = async (toiletId: number) => {
    try {
      await axios.post(`/toilets/${toiletId}/occupy`);
      // Remove from waiting list if successfully occupied
      setWaitingForToilets(prev => prev.filter(id => id !== toiletId));
      fetchWashrooms();
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        await signOut();
      } else {
        Alert.alert('Error', 'Failed to occupy toilet');
      }
      console.error('Occupy toilet error:', error);
    }
  };

  const handleRelease = async (toiletId: number) => {
    try {
      await axios.post(`/toilets/${toiletId}/release`);
      fetchWashrooms();
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        await signOut();
      } else {
        Alert.alert('Error', 'Failed to release toilet');
      }
      console.error('Release toilet error:', error);
    }
  };

  const handleJoinWaitlist = async (toiletId: number) => {
    try {
      await axios.post(`/toilets/${toiletId}/join-waitlist`);
      setWaitingForToilets(prev => [...prev, toiletId]);
      Alert.alert(
        'Added to Waitlist',
        'You will be notified when this toilet becomes available.'
      );
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        await signOut();
      } else {
        Alert.alert('Error', 'Failed to join waitlist');
      }
      console.error('Join waitlist error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4c669f" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
            <MaterialCommunityIcons name="logout" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {washrooms.map((washroom) => (
          <WashroomSection 
            key={washroom.id} 
            washroom={washroom}
            user={user}
            onOccupy={handleOccupy}
            onRelease={handleRelease}
            onJoinWaitlist={handleJoinWaitlist}
            waitingForToilets={waitingForToilets}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};