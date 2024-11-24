import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

// Define API base URL
const API_BASE_URL = 'http://192.168.31.69:8000/api';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

interface Toilet {
  id: number;
  number: string;
  is_occupied: boolean;
  occupied_by: string | null;
  time_remaining: number | null;
}

interface Washroom {
  id: number;
  name: string;
  floor: string;
  type: 'male' | 'female' | 'unisex';
  is_operational: boolean;
  available_toilets: number;
  total_toilets: number;
  toilets: Toilet[];
}

export const HomeScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [washrooms, setWashrooms] = useState<Washroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleSignOut = async () => {
    try {
      // Clean up axios headers before signing out
      delete axios.defaults.headers.common['Authorization'];
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const ToiletCard: React.FC<{ toilet: Toilet }> = ({ toilet }) => {
    const isOccupiedByUser = toilet.occupied_by === user?.name;

    return (
      <TouchableOpacity
        style={[
          styles.toiletCard,
          toilet.is_occupied && styles.occupiedToilet
        ]}
        onPress={() => {
          if (!toilet.is_occupied) {
            handleOccupy(toilet.id);
          } else if (isOccupiedByUser) {
            handleRelease(toilet.id);
          }
        }}
        disabled={toilet.is_occupied && !isOccupiedByUser}
      >
        <MaterialCommunityIcons
          name="toilet"
          size={24}
          color={toilet.is_occupied ? '#ff4444' : '#4CAF50'}
        />
        <Text style={styles.toiletNumber}>{toilet.number}</Text>
        {toilet.is_occupied && (
          <>
            <Text style={styles.occupiedBy}>
              {isOccupiedByUser ? 'You' : toilet.occupied_by}
            </Text>
            {toilet.time_remaining && (
              <Text style={styles.timeRemaining}>
                {toilet.time_remaining}m remaining
              </Text>
            )}
          </>
        )}
      </TouchableOpacity>
    );
  };

  const WashroomSection: React.FC<{ washroom: Washroom }> = ({ washroom }) => (
    <View style={styles.washroomSection}>
      <View style={styles.washroomHeader}>
        <Text style={styles.washroomName}>{washroom.name}</Text>
        <Text style={styles.washroomInfo}>
          {washroom.available_toilets} of {washroom.total_toilets} available
        </Text>
      </View>
      <View style={styles.toiletsGrid}>
        {washroom.toilets.map((toilet) => (
          <ToiletCard key={toilet.id} toilet={toilet} />
        ))}
      </View>
    </View>
  );

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
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
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
          <WashroomSection key={washroom.id} washroom={washroom} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 0 : 40,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  washroomSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  washroomHeader: {
    marginBottom: 15,
  },
  washroomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  washroomInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  toiletsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  toiletCard: {
    width: '31%',
    margin: '1%',
    aspectRatio: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  occupiedToilet: {
    backgroundColor: '#ffebee',
  },
  toiletNumber: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: '500',
  },
  occupiedBy: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  timeRemaining: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
});