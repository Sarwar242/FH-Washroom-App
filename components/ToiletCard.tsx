// src/components/ToiletCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../styles';
import { Toilet } from '../helpers/types';

interface ToiletCardProps {
  toilet: Toilet;
  user: { name: string } | null;
  onOccupy: (toiletId: number) => void;
  onRelease: (toiletId: number) => void;
  onJoinWaitlist: (toiletId: number) => void;
  waitingForToilets: number[];
}

export const ToiletCard: React.FC<ToiletCardProps> = ({
  toilet,
  user,
  onOccupy,
  onRelease,
  onJoinWaitlist,
  waitingForToilets
}) => {
  const isOccupiedByUser = toilet.occupied_by === user?.name;
  const isWaiting = waitingForToilets.includes(toilet.id);

  const handleToiletPress = () => {

    if (!toilet.is_occupied) {
      onOccupy(toilet.id);
    } else if (isOccupiedByUser) {
      Alert.alert(
        'Release Toilet',
        'Are you sure you want to release this toilet?',
        [
          {
            text: 'Yes',
            onPress: () => onRelease(toilet.id),
          },
          {
            text: 'No',
            style: 'cancel',
          },
        ]
      );
    } else if (!isWaiting) {
      Alert.alert(
        'Toilet Occupied',
        'Would you like to join the waiting list?',
        [
          {
            text: 'Yes',
            onPress: () => onJoinWaitlist(toilet.id),
          },
          {
            text: 'No',
            style: 'cancel',
          },
        ]
      );
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.toiletCard,
        toilet.is_occupied && styles.occupiedToilet,
        isWaiting && styles.waitingToilet
      ]}
      onPress={handleToiletPress}
      disabled={toilet.is_occupied && !isOccupiedByUser}
    >
      <MaterialCommunityIcons
        name="toilet"
        size={24}
        color={toilet.is_occupied ? '#ff4444' : (isWaiting ? '#FFA500' : '#4CAF50')}
      />
      <Text style={styles.toiletNumber}>{toilet.number}</Text>
      {toilet.is_occupied && (
        <>
          {isOccupiedByUser ? (
            <Text style={styles.occupiedBy}>You</Text>
          ) : (
            <>
              <Text style={styles.occupiedBy}>Occupied</Text>
              {isWaiting && (
                <Text style={styles.waitingText}>Waiting</Text>
              )}
            </>
          )}
          {toilet.time_remaining && (
            <Text style={styles.timeRemaining}>
              {toilet.time_remaining.toFixed(2)}min remaining
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};